import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  CalendarView,
  CalendarEvent,
  CalendarModule
} from 'angular-calendar';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { SiteCalendarService } from '../site-calendar.service';
import { SiteService } from 'app/shared/services/site.service';
import { SiteOperatingDayRequest } from 'app/shared/models/request/SiteOperatingDayRequest';
import { SiteOperatingDay } from 'app/shared/models/site/SiteOperatingDay';
import { OperatingDayApiResponse } from 'app/shared/models/response/OperatingDayApiResponse';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { GenericTableConfig, OnGenericTableHandler } from '../../../../shared/components/generic-table/generic-table.interface';
import { DAY_EVENTS_COLUMNS_SCHEMA } from './columns-schema';
import { Observable, Subject, takeUntil } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FuseConfigService } from '@fuse/services/config';
import { SiteCalendarEditModalComponent } from '../site-calendar-edit-modal/site-calendar-edit-modal.component';
import { SiteCalendarAddModalComponent } from '../site-calendar-add-modal/site-calendar-add-modal.component';
import { SiteCalendarTableModalComponent } from '../site-calendar-table-modal/site-calendar-table-modal.component';
import { SiteCalendarTableModalData } from '../site-calendar-table-modal/site-calendar-table-modal-data.interface';
import { SiteOperatingDayServiceService } from 'app/shared/services/site-operating-day-service.service';
import { SiteOperatingDayService } from 'app/shared/models/site/SiteOperatingDayService';
import { SiteCalendarServiceEditModalComponent } from '../site-calendar-service-edit-modal/site-calendar-service-edit-modal.component';
import { SiteCalendarServiceEditModalData } from '../site-calendar-service-edit-modal/site-calendar-service-edit-modal-data.interface';
import { NotificationService } from 'app/shared/services/notification.service';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { Site } from 'app/shared/models/site/Site';
import { AgencyStatusStorageService } from 'app/shared/services/agency-status-storage.service';
import {
  getServiceEventColorByTypeId,
  getServiceTypeStyle
} from 'app/shared/constants/service-type-styles.constants';
import { ServiceTypes } from 'app/shared/constants/service-type.constants';
import { getGroupBorderColor } from 'app/shared/constants/child-group-styles.constants';
import { HourSegmentClickEvent } from 'app/shared/models/calendar/HourSegmentClickEvent';

@Component({
  selector: 'app-site-calendar',
  styleUrls: ['./site-calendar.component.scss'],
  imports: [
    CommonModule,
    CalendarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    TranslocoModule
  ],
  templateUrl: './site-calendar.component.html'
})
export class SiteCalendarComponent implements OnInit, OnDestroy, OnGenericTableHandler {
  @Input() siteId?: number;
  @Input() siteName: string = '';
  @Output() dayToggled = new EventEmitter<{date: Date, isOperating: boolean}>();

  private siteCalendarService: SiteCalendarService = inject(SiteCalendarService);
  private siteService: SiteService = inject(SiteService);
  private siteOperatingDayServiceService: SiteOperatingDayServiceService = inject(SiteOperatingDayServiceService);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  private translocoService: TranslocoService = inject(TranslocoService);
  private fuseConfigService: FuseConfigService = inject(FuseConfigService);
  private dialog: MatDialog = inject(MatDialog);
  private fb: FormBuilder = inject(FormBuilder);
  private notificationService: NotificationService = inject(NotificationService);
  private customRouterService: CustomRouterService = inject(CustomRouterService);
  private agencyStatusStorageService: AgencyStatusStorageService = inject(AgencyStatusStorageService);

  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private document = inject<Document>(DOCUMENT);
  private readonly darkThemeClass = 'dark-theme';
  private currentTableModal: any = null; // Referencia al modal de tabla actual
  private isCalculatingInitialDate: boolean = false; // Bandera para evitar bucles infinitos
  private hasCalculatedInitialDate: boolean = false; // Bandera para saber si ya se calculó el viewDate inicial


  // Exponer CalendarView para uso en template
  CalendarView = CalendarView;

  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  operatingDays: SiteOperatingDay[] = [];
  loading = false;
  currentSiteId: number = 0;
  activeDayIsOpen: boolean = false;
  selectedDate: Date | null = null;
  currentLanguage: string = 'es';
  isDarkMode: boolean = false;
  operatingFromDate?: Date;
  operatingToDate?: Date;
  currentSite?: Site; // Información del sitio para determinar si es center o home
  editForm: FormGroup = this.fb.group({
    startTime: ['', Validators.required],
    endTime: ['', Validators.required],
    comment: [''],
    isHoliday: [false]
  });

  // Configuración de la tabla de eventos del día
  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<any>([]),
    dataSourceList: [],
    columnsSchema: DAY_EVENTS_COLUMNS_SCHEMA,
    displayedColumns: DAY_EVENTS_COLUMNS_SCHEMA.map(col =>
      Array.isArray(col.key) ? col.key[0] : col.key
    ),
    handler: this,
    showPaginator: false,
    addButtonShow: false,
    fullScreen: true,
  };

  ngOnInit() {
    // Obtener el ID de la escuela desde la ruta o input
    this.currentSiteId = this.siteId || +this.route.snapshot.paramMap.get('id')!;

    // Si no hay siteId, usar uno por defecto para pruebas
    if (!this.currentSiteId || this.currentSiteId === 0) {
      this.currentSiteId = 1;
    }


    // Configurar el idioma del calendario
    this.setCalendarLanguage();

    // Suscribirse a cambios de idioma
    this.translocoService.langChanges$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((lang) => {
        this.currentLanguage = lang;
        this.setCalendarLanguage();
      });

    // Suscribirse a cambios de tema
    this.fuseConfigService.config$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((config) => {
        this.isDarkMode = config.scheme === 'dark';
        this.updateDarkTheme();
      });

    // Obtener datos del resolver en lugar de cargar manualmente
    const resolvedData = this.route.snapshot.data['data'];

    if (resolvedData) {
      const apiDays = resolvedData.operatingDays?.operatingDays || [];
      this.operatingDays = this.mapApiResponseToOperatingDays(apiDays);
      this.events = this.transformToCalendarEvents(this.operatingDays);
      this.siteName = resolvedData.operatingDays.siteName;
      // Guardar información del sitio para determinar si es center o home
      this.currentSite = resolvedData.site;
      // Extraer fechas límite de funcionamiento
      if (resolvedData.operatingDays.operatingFromDate) {
        this.operatingFromDate = new Date(resolvedData.operatingDays.operatingFromDate);
      }
      if (resolvedData.operatingDays.operatingToDate) {
        this.operatingToDate = new Date(resolvedData.operatingDays.operatingToDate);
      }
      // Calcular el mes inicial basado en las fechas de funcionamiento
      this.calculateInitialViewDate();
      this.loading = false;
    } else {
      // Si no hay datos del resolver, cargar el sitio y los días de funcionamiento
      this.loadSiteAndOperatingDays();
    }
  }

  ngOnDestroy(): void {
    // Remover dark theme class del body
    this.document.body.classList.remove(this.darkThemeClass);

    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  private setCalendarLanguage() {
    const currentLang = this.translocoService.getActiveLang();
    this.currentLanguage = currentLang;

    // Forzar re-render del calendario para aplicar el idioma
    this.viewDate = new Date(this.viewDate.getTime());
  }

  private updateDarkTheme() {
    if (this.isDarkMode) {
      this.document.body.classList.add(this.darkThemeClass);
    } else {
      this.document.body.classList.remove(this.darkThemeClass);
    }
  }

  /**
   * Calcula el mes inicial correcto basado en las fechas de funcionamiento
   * - Si la fecha actual está dentro del rango → usar fecha actual
   * - Si la fecha actual está antes del rango → usar fecha de inicio
   * - Si la fecha actual está después del rango → usar fecha de fin (último mes)
   */
  private calculateInitialViewDate(): void {
    // Evitar bucles infinitos
    if (this.isCalculatingInitialDate) {
      return;
    }

    const today = new Date();

    // Si no hay fechas límite, usar fecha actual
    if (!this.operatingFromDate || !this.operatingToDate) {
      this.viewDate = new Date(today);
      this.hasCalculatedInitialDate = true;
      return;
    }

    // Normalizar fechas a medianoche para comparación
    const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const fromDate = new Date(this.operatingFromDate.getFullYear(), this.operatingFromDate.getMonth(), this.operatingFromDate.getDate());
    const toDate = new Date(this.operatingToDate.getFullYear(), this.operatingToDate.getMonth(), this.operatingToDate.getDate());

    // Determinar qué fecha usar
    let targetDate: Date;
    if (todayNormalized >= fromDate && todayNormalized <= toDate) {
      // Fecha actual está dentro del rango → usar fecha actual
      targetDate = new Date(today);
    } else if (todayNormalized < fromDate) {
      // Fecha actual está antes del rango → usar fecha de inicio
      targetDate = new Date(this.operatingFromDate);
    } else {
      // Fecha actual está después del rango → usar fecha de fin (último mes)
      targetDate = new Date(this.operatingToDate);
    }

    // Solo actualizar si el mes/año cambió
    const currentMonth = this.viewDate.getMonth();
    const currentYear = this.viewDate.getFullYear();
    const targetMonth = targetDate.getMonth();
    const targetYear = targetDate.getFullYear();

    if (currentMonth !== targetMonth || currentYear !== targetYear) {
      this.viewDate = targetDate;

      // Marcar que estamos calculando para evitar bucles
      this.isCalculatingInitialDate = true;
      this.hasCalculatedInitialDate = true;

      // Recargar datos para el mes calculado
      this.loadOperatingDays();

      // Resetear la bandera después de un breve delay para permitir que loadOperatingDays complete
      setTimeout(() => {
        this.isCalculatingInitialDate = false;
      }, 100);
    } else {
      // Si no cambió el mes, marcar como calculado de todas formas
      this.hasCalculatedInitialDate = true;
    }
  }

  onDayClick(event: any) {
    if (this.loading) return;

    let date: Date | null = null;

    // Manejar diferentes estructuras de evento según la vista
    if (this.view === CalendarView.Month) {
      // En vista de mes: {day: {…}, sourceEvent: PointerEvent}
      date = event?.day || event?.date || event;

    } else if (this.view === CalendarView.Week) {
      // En vista de semana: {date: Date, sourceEvent: PointerEvent}
      date = event?.date || event?.day || event;

    } else if (this.view === CalendarView.Day) {
      // En vista de día: {date: Date, sourceEvent: PointerEvent}
      date = event?.date || event?.day || event;

    }

    if (!date) {
      return;
    }

    // Asegurar que date es un objeto Date válido
    if (!(date instanceof Date)) {
      // Intentar diferentes formas de conversión
      if (typeof date === 'string') {
        // Si es string, intentar parsearlo
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.getTime())) {
          date = parsedDate;
        } else {
          return;
        }
      } else if (typeof date === 'number') {
        // Si es número (timestamp)
        date = new Date(date);
      } else if (date && typeof date === 'object') {
        // Si es objeto, intentar extraer propiedades de fecha
        const dateObj = date as any;
        if (dateObj.year && dateObj.month !== undefined && dateObj.day !== undefined) {
          date = new Date(dateObj.year, dateObj.month, dateObj.day);
        } else if (dateObj.date) {
          // Si tiene propiedad date (estructura de angular-calendar)
          date = new Date(dateObj.date);
        } else if ('getTime' in dateObj) {
          date = new Date(dateObj.getTime());
        } else {

          return;
        }
      } else {
        return;
      }
    }

    if (isNaN(date.getTime())) {
      return;
    }

    // Solo manejar clicks en la vista de mes
    if (this.view === CalendarView.Month) {
      // Buscar eventos para este día
      const dayEvents = this.events.filter(event =>
        this.isSameDate(event.start, date)
      );

      if (dayEvents.length > 0) {
        // Si hay eventos, abrir modal con tabla
        this.selectedDate = date;
        this.updateDayEventsTable(date);
        this.openDayEventsModal(date);
      } else {
        // Si no hay eventos, abrir modal para agregar
        this.openAddDayDialog(date);
      }
    } else {
      // Para otras vistas, mantener el comportamiento actual
      const dayData = this.findDayData(date);
      if (dayData) {
        this.openAddDayDialog(date);
      } else {
        this.openAddDayDialog(date);
      }
    }
  }

  onEventClick({ event }: { event: CalendarEvent }) {
    // Verificar si es un servicio o un día de funcionamiento
    const isService = event.meta?.isService === true;
    const isPlaceholderForHoliday = (event.meta as { isPlaceholderForHoliday?: boolean })?.isPlaceholderForHoliday === true;

    if (isService && !isPlaceholderForHoliday) {
      // Es un servicio real, abrir modal de edición de servicio
      const service = event.meta as SiteOperatingDayService;
      this.openEditServiceDialog(service);
    } else {
      // Es un día de funcionamiento, abrir modal de edición de día
      this.openEditEventDialog(event);
    }
  }

  onEventTimesChanged({ event, newStart, newEnd }: { event: CalendarEvent, newStart: Date, newEnd: Date }) {
    if (this.loading) return;

    // Solo permitir arrastrar días de funcionamiento, no servicios
    const isService = event.meta?.isService === true;
    if (isService) {
      return;
    }

    const operatingDay = event.meta as SiteOperatingDay;
    if (!operatingDay) {
      return;
    }

    // Actualizar el evento con los nuevos horarios
    const updatedOperatingDay: SiteOperatingDay = {
      ...operatingDay,
      date: newStart.toISOString().split('T')[0],
      startTime: this.formatTimeFromDate(newStart),
      endTime: this.formatTimeFromDate(newEnd),
      updatedAt: new Date()
    };
    this.updateOperatingDayFromDrag(updatedOperatingDay);
  }

  onEventResized({ event, newStart, newEnd }: { event: CalendarEvent, newStart: Date, newEnd: Date }) {
    if (this.loading) return;

    // Solo permitir redimensionar días de funcionamiento, no servicios
    const isService = event.meta?.isService === true;
    if (isService) {
      return;
    }

    const operatingDay = event.meta as SiteOperatingDay;
    if (!operatingDay) {
      return;
    }

    // Actualizar el evento con los nuevos horarios
    const updatedOperatingDay: SiteOperatingDay = {
      ...operatingDay,
      startTime: this.formatTimeFromDate(newStart),
      endTime: this.formatTimeFromDate(newEnd),
      updatedAt: new Date()
    };
    this.updateOperatingDayFromDrag(updatedOperatingDay);
  }

  onHourSegmentClicked(event: HourSegmentClickEvent) {
    if (this.loading) return;
    const date = event.date;
    const dayData = this.findDayData(date);
    if (dayData) {
      // Si el día ya tiene horario, permitir agregar otro evento
      this.openAddDayDialog(date);
    } else {
      // Si el día no tiene horario, abrir modal para agregar
      this.openAddDayDialog(date);
    }
  }

  openAddDayDialog(date: Date) {
    // Verificar si la agencia está restringida antes de continuar
    if (this.agencyStatusStorageService.isAgencyRestricted()) {
      const status = this.agencyStatusStorageService.getAgencyRestrictedStatus();
      let messageKey = '';

      if (status?.isCompleted) {
        messageKey = 'sites.calendar.errors.agency-completed';
      } else if (status?.isExpired) {
        messageKey = 'sites.calendar.errors.agency-expired';
      } else {
        messageKey = 'sites.calendar.errors.agency-restricted';
      }

      this.notificationService.showWarningDialog(messageKey);
      return;
    }

    // Validar que la fecha esté dentro del rango de días de funcionamiento
    if (!this.isDateWithinOperatingRange(date)) {
      this.notificationService.showWarningDialog('sites.calendar.date-out-of-range');
      return;
    }

    // Detectar si es fin de semana (sábado = 6, domingo = 0)
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Crear un día vacío para el modal
    const newDay: SiteOperatingDay = {
      id: 0,
      siteId: this.currentSiteId,
      date: date.toISOString().split('T')[0],
      startTime: '08:00',
      endTime: '18:00',
      isOperating: true,
      isWeekend: isWeekend, // Establecer automáticamente si es fin de semana
      isHoliday: false,
      comment: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const siteStart = this.normalizeTimeToHHmm(this.currentSite?.operatingStartTime);
    const siteEnd = this.normalizeTimeToHHmm(this.currentSite?.operatingEndTime);
    const defaultStart = siteStart ?? '08:00';
    const defaultEnd = siteEnd ?? '18:00';

    // Preparar el formulario con valores por defecto
    this.editForm.patchValue({
      startTime: defaultStart,
      endTime: defaultEnd,
      comment: '',
      isWeekend: isWeekend, // Establecer automáticamente si es fin de semana
      isHoliday: false
    });

    const dialogRef = this.dialog.open(SiteCalendarAddModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        form: this.editForm,
        operatingDay: newDay,
        siteId: this.currentSiteId,
        siteOperatingStartTime: this.currentSite?.operatingStartTime,
        siteOperatingEndTime: this.currentSite?.operatingEndTime
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addOperatingDay(newDay, result);
      }
    });
  }

  openEditDayDialog(dayData: SiteOperatingDay) {
    // Preparar el formulario con los datos actuales
    this.editForm.patchValue({
      startTime: dayData.startTime || '08:00',
      endTime: dayData.endTime || '18:00',
      comment: dayData.comment || '',
      isHoliday: dayData.isHoliday || false
    });

    const dialogRef = this.dialog.open(SiteCalendarEditModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        form: this.editForm,
        event: null, // No hay evento para días existentes
        operatingDay: dayData,
        siteId: this.currentSiteId,
        siteOperatingStartTime: this.currentSite?.operatingStartTime,
        siteOperatingEndTime: this.currentSite?.operatingEndTime
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.action === 'delete') {
          this.deleteOperatingDay(dayData);
        } else {
          this.updateOperatingDay(dayData, result);
        }
      }
    });
  }

  openEditEventDialog(event: CalendarEvent, fromTable: boolean = false) {
    const operatingDay = event.meta as SiteOperatingDay;

    // Preparar el formulario con los datos actuales
    this.editForm.patchValue({
      startTime: operatingDay.startTime || '08:00',
      endTime: operatingDay.endTime || '18:00',
      comment: operatingDay.comment || '',
      isWeekend: operatingDay.isWeekend || false,
      isHoliday: operatingDay.isHoliday || false
    });

    const dialogRef = this.dialog.open(SiteCalendarEditModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        form: this.editForm,
        event: event,
        operatingDay: operatingDay,
        siteId: this.currentSiteId,
        fromTable: fromTable,
        siteOperatingStartTime: this.currentSite?.operatingStartTime,
        siteOperatingEndTime: this.currentSite?.operatingEndTime
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.action === 'delete') {
          this.deleteOperatingDay(operatingDay);
        } else {
          this.updateOperatingDay(operatingDay, result, fromTable);
        }
      }
    });
  }

  // Método específico para editar desde la tabla
  openEditEventDialogFromTable(event: CalendarEvent, id: any) {
    const operatingDay = event.meta as SiteOperatingDay;

    // Preparar el formulario con los datos actuales
    this.editForm.patchValue({
      startTime: operatingDay.startTime || '08:00',
      endTime: operatingDay.endTime || '18:00',
      comment: operatingDay.comment || '',
      isWeekend: operatingDay.isWeekend || false,
      isHoliday: operatingDay.isHoliday || false
    });

    const dialogRef = this.dialog.open(SiteCalendarEditModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        form: this.editForm,
        event: event,
        operatingDay: operatingDay,
        siteId: this.currentSiteId,
        fromTable: true,
        siteOperatingStartTime: this.currentSite?.operatingStartTime,
        siteOperatingEndTime: this.currentSite?.operatingEndTime
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.action === 'delete') {
          this.deleteOperatingDayFromTable(operatingDay, id);
        } else {
          this.updateOperatingDayFromTable(operatingDay, result, id);
        }
      }
    });
  }

  /** Convierte "08:00:00" o "08:00" a "08:00" (HH:mm). */
  private normalizeTimeToHHmm(timeStr: string | undefined): string | null {
    if (!timeStr || typeof timeStr !== 'string') return null;
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})/);
    if (!match) return null;
    const h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    if (h < 0 || h > 23 || m < 0 || m > 59) return null;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  /** Convierte "HH:mm" o "HH:mm:ss" a minutos desde medianoche. */
  private timeToMinutes(timeStr: string | undefined): number | null {
    if (!timeStr || typeof timeStr !== 'string') return null;
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (!match) return null;
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
    return hours * 60 + minutes;
  }

  /** Retorna true si startTime y endTime (HH:mm o con segundos) están dentro del rango del sitio. Si el sitio no tiene rango, retorna true. */
  private isTimeWithinSiteOperatingRange(startTime: string, endTime: string): boolean {
    const siteStart = this.timeToMinutes(this.currentSite?.operatingStartTime);
    const siteEnd = this.timeToMinutes(this.currentSite?.operatingEndTime);
    if (siteStart == null || siteEnd == null) return true;
    const startMin = this.timeToMinutes(startTime) ?? 0;
    const endMin = this.timeToMinutes(endTime) ?? 0;
    return startMin >= siteStart && endMin <= siteEnd;
  }

  private updateOperatingDay(operatingDay: SiteOperatingDay, formData: any, fromTable: boolean = false) {
    // Convertir DateTime objects a strings para el backend (formato HH:mm:ss)
    const startTime = this.formatTimeForBackend(formData.startTime);
    const endTime = this.formatTimeForBackend(formData.endTime);

    if (!this.isTimeWithinSiteOperatingRange(startTime, endTime)) {
      this.notificationService.showWarningDialog('sites.calendar.modals.add-day.time-outside-site-hours');
      return;
    }

    // Obtener isWeekend del operatingDay original (se establece automáticamente)
    const isWeekend = operatingDay.isWeekend || false;

    const request: SiteOperatingDayRequest = {
      id: operatingDay.id,
      siteId: this.currentSiteId,
      operatingDate: operatingDay.date,
      startTime: startTime,
      endTime: endTime,
      isOperating: true,
      isWeekend: isWeekend,
      isHoliday: formData.isHoliday,
      comment: formData.comment
    };

    this.loading = true;
    this.siteCalendarService.updateOperatingDay(request, { siteId: this.siteId })
      .subscribe({
        next: () => {
          this.loadOperatingDays(); // Recargar datos
          // Si viene de la tabla, actualizar la tabla específicamente
          if (fromTable && this.selectedDate) {
            this.updateDayEventsTable(this.selectedDate);
          } else {
            this.refreshDayEventsTable(); // Actualizar tabla
          }
          this.loading = false;
        },
        error: () => {

          this.loading = false;
        }
      });
  }

  // Método específico para actualizar desde la tabla
  private updateOperatingDayFromTable(operatingDay: SiteOperatingDay, formData: any, id: any) {
    // Convertir DateTime objects a strings para el backend (formato HH:mm:ss)
    const startTime = this.formatTimeForBackend(formData.startTime);
    const endTime = this.formatTimeForBackend(formData.endTime);

    if (!this.isTimeWithinSiteOperatingRange(startTime, endTime)) {
      this.notificationService.showWarningDialog('sites.calendar.modals.add-day.time-outside-site-hours');
      return;
    }

    // Obtener isWeekend del operatingDay original (se establece automáticamente)
    const isWeekend = operatingDay.isWeekend || false;

    const request: SiteOperatingDayRequest = {
      id: operatingDay.id,
      siteId: this.currentSiteId,
      operatingDate: operatingDay.date,
      startTime: startTime,
      endTime: endTime,
      isOperating: true,
      isWeekend: isWeekend,
      isHoliday: formData.isHoliday,
      comment: formData.comment
    };

    this.loading = true;
    this.siteCalendarService.updateOperatingDay(request, { siteId: this.siteId })
      .subscribe({
        next: () => {
          // Recargar datos y luego actualizar el modal
          this.loadOperatingDaysAndUpdateModal().subscribe({
            next: () => {
              this.loading = false;
            },
            error: () => {
              this.loading = false;
            }
          });
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  // Método específico para eliminar desde la tabla
  private deleteOperatingDayFromTable(operatingDay: SiteOperatingDay, id: any) {
    this.loading = true;
    this.siteCalendarService.deleteOperatingDay({ id: operatingDay.id })
      .subscribe({
        next: () => {
          // Recargar datos y luego actualizar el modal
          this.loadOperatingDaysAndUpdateModal().subscribe({
            next: () => {
              this.loading = false;
            },
            error: () => {
              this.loading = false;
            }
          });
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  private addOperatingDay(operatingDay: SiteOperatingDay, formData: any) {
    // Validar que la fecha esté dentro del rango antes de enviar al backend
    const operatingDate = new Date(operatingDay.date);
    if (!this.isDateWithinOperatingRange(operatingDate)) {
      this.notificationService.showWarningDialog('sites.calendar.date-out-of-range');
      return;
    }

    // Convertir DateTime objects a strings para el backend (formato HH:mm:ss)
    const startTime = this.formatTimeForBackend(formData.startTime);
    const endTime = this.formatTimeForBackend(formData.endTime);

    if (!this.isTimeWithinSiteOperatingRange(startTime, endTime)) {
      this.notificationService.showWarningDialog('sites.calendar.modals.add-day.time-outside-site-hours');
      return;
    }

    // Obtener isWeekend del newDay (se establece automáticamente si es fin de semana)
    const isWeekend = operatingDay.isWeekend || false;

    const request: SiteOperatingDayRequest = {
      siteId: this.currentSiteId,
      operatingDate: operatingDay.date,
      startTime: startTime,
      endTime: endTime,
      isOperating: true,
      isWeekend: isWeekend,
      isHoliday: formData.isHoliday,
      comment: formData.comment
    };
    this.loading = true;
    this.siteCalendarService.createOperatingDay(request, { siteId: this.siteId })
      .subscribe({
        next: () => {
          this.loadOperatingDays(); // Recargar datos
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  private deleteOperatingDay(operatingDay: SiteOperatingDay) {
    this.loading = true;
    this.siteCalendarService.deleteOperatingDay({ id: operatingDay.id })
      .subscribe({
        next: () => {
          this.loadOperatingDays(); // Recargar datos
          this.refreshDayEventsTable(); // Actualizar tabla
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  setView(view: CalendarView) {
    this.view = view;
    // Recalcular eventos para actualizar draggable/resizable
    this.events = this.transformToCalendarEvents(this.operatingDays);
    // Limpiar selección al cambiar de vista
    this.selectedDate = null;
  }

  previous() {
    const newDate = new Date(this.viewDate);
    const oldMonth = this.viewDate.getMonth();
    const oldYear = this.viewDate.getFullYear();

    if (this.view === CalendarView.Month) {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (this.view === CalendarView.Week) {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    this.viewDate = newDate;

    // Recargar datos si cambió el mes o año (solo para vista de mes)
    if (this.view === CalendarView.Month) {
      const newMonth = this.viewDate.getMonth();
      const newYear = this.viewDate.getFullYear();
      if (oldMonth !== newMonth || oldYear !== newYear) {
        this.loadOperatingDays();
      }
    }
  }

  next() {
    const newDate = new Date(this.viewDate);
    const oldMonth = this.viewDate.getMonth();
    const oldYear = this.viewDate.getFullYear();

    if (this.view === CalendarView.Month) {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (this.view === CalendarView.Week) {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    this.viewDate = newDate;

    // Recargar datos si cambió el mes o año (solo para vista de mes)
    if (this.view === CalendarView.Month) {
      const newMonth = this.viewDate.getMonth();
      const newYear = this.viewDate.getFullYear();
      if (oldMonth !== newMonth || oldYear !== newYear) {
        this.loadOperatingDays();
      }
    }
  }

  today() {
    const oldMonth = this.viewDate.getMonth();
    const oldYear = this.viewDate.getFullYear();

    this.viewDate = new Date();

    // Recargar datos si cambió el mes o año (solo para vista de mes)
    if (this.view === CalendarView.Month) {
      const newMonth = this.viewDate.getMonth();
      const newYear = this.viewDate.getFullYear();
      if (oldMonth !== newMonth || oldYear !== newYear) {
        this.loadOperatingDays();
      }
    }
  }

  /**
   * Maneja el evento cuando cambia la fecha de visualización del calendario
   * Se dispara cuando el usuario interactúa directamente con el calendario
   */
  onViewDateChange(event: Date) {
    if (!event) return;

    const oldMonth = this.viewDate.getMonth();
    const oldYear = this.viewDate.getFullYear();

    // Actualizar viewDate
    this.viewDate = new Date(event);

    // Recargar datos si cambió el mes o año (solo para vista de mes)
    if (this.view === CalendarView.Month) {
      const newMonth = this.viewDate.getMonth();
      const newYear = this.viewDate.getFullYear();
      if (oldMonth !== newMonth || oldYear !== newYear) {
        this.loadOperatingDays();
      }
    }
  }

  getCurrentDateLabel(): string {
    const date = this.viewDate;
    const locale = this.currentLanguage === 'es' ? 'es-PR' : 'en-US';

    if (this.view === CalendarView.Month) {
      return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
    } else if (this.view === CalendarView.Week) {
      const startOfWeek = new Date(date);
      const dayOfWeek = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      startOfWeek.setDate(diff);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const year = date.getFullYear();

      if (startOfWeek.getMonth() === endOfWeek.getMonth() && startOfWeek.getFullYear() === endOfWeek.getFullYear()) {
        const monthName = endOfWeek.toLocaleDateString(locale, { month: 'long' });
        return `${monthName} ${startOfWeek.getDate()}-${endOfWeek.getDate()}, ${year}`;
      }
      const startStr = startOfWeek.toLocaleDateString(locale, { month: 'long', day: 'numeric' });
      const endStr = endOfWeek.toLocaleDateString(locale, { month: 'long', day: 'numeric' });
      return `${startStr} - ${endStr}, ${year}`;
    } else {
      return date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
    }
  }

  /**
   * Obtiene el label formateado para las fechas límite de funcionamiento
   * @returns String con las fechas formateadas o mensaje de no disponibles
   */
  getOperatingDatesLabel(): string {
    if (!this.operatingFromDate || !this.operatingToDate) {
      return this.translocoService.translate('sites.calendar.operating-dates.not-available') || 'No disponibles';
    }

    // Formatear fechas según el idioma activo
    const fromDateStr = this.formatDateForDisplay(this.operatingFromDate);
    const toDateStr = this.formatDateForDisplay(this.operatingToDate);

    const rangeTemplate = this.translocoService.translate('sites.calendar.operating-dates.range');
    if (rangeTemplate && rangeTemplate.includes('{{from}}') && rangeTemplate.includes('{{to}}')) {
      return rangeTemplate
        .replace('{{from}}', fromDateStr)
        .replace('{{to}}', toDateStr);
    }

    // Fallback si la traducción no tiene el formato esperado
    return `${fromDateStr} - ${toDateStr}`;
  }

  /**
   * Formatea una fecha para mostrar según el idioma activo
   * @param date Fecha a formatear
   * @returns String con la fecha formateada
   */
  private formatDateForDisplay(date: Date): string {
    if (!date || isNaN(date.getTime())) {
      return '';
    }

    // Usar formato de fecha localizado
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    const locale = this.currentLanguage === 'es' ? 'es-PR' : 'en-US';
    return date.toLocaleDateString(locale, options);
  }

  /**
   * Carga la información del sitio y los días de funcionamiento
   * Se usa cuando no hay datos del resolver
   */
  private loadSiteAndOperatingDays(): void {
    this.loading = true;

    // Cargar información del sitio primero
    this.siteService.getSiteById({ id: this.currentSiteId })
      .subscribe({
        next: (siteResponse: any) => {
          this.currentSite = siteResponse?.body;
          // Luego cargar los días de funcionamiento
          this.loadOperatingDays();
        },
        error: () => {
          // Si falla cargar el sitio, intentar cargar los días de funcionamiento de todas formas
          this.loadOperatingDays();
        }
      });
  }

  private loadOperatingDays() {

    this.loading = true;

    // Obtener mes y año del viewDate actual
    const month = this.viewDate.getMonth() + 1; // getMonth() retorna 0-11, necesitamos 1-12
    const year = this.viewDate.getFullYear();

    const queryParameters: QueryParameters = {
      siteId: this.currentSiteId,
      month: month,
      year: year
    };

    this.siteCalendarService.getOperatingDays(queryParameters)
      .subscribe({
        next: (response: any) => {

          const data = response?.body || response;

          this.operatingDays = this.mapApiResponseToOperatingDays(data?.operatingDays || data?.data?.operatingDays || []);
          this.events = this.transformToCalendarEvents(this.operatingDays);
          // Extraer fechas límite de funcionamiento

          if (data?.operatingFromDate) {
            this.operatingFromDate = new Date(data.operatingFromDate);
          }

          if (data?.operatingToDate) {
            this.operatingToDate = new Date(data.operatingToDate);
          }

          // Calcular el mes inicial solo la primera vez que se cargan las fechas límite
          if (!this.hasCalculatedInitialDate && this.operatingFromDate && this.operatingToDate) {
            this.calculateInitialViewDate();
          }

          this.loading = false;
        },
        error: () => {

          this.loading = false;
        }
      });
  }

  /** Carga días de funcionamiento y actualiza el modal de tabla si está abierto. Retorna Observable para que el caller pueda esperar. */
  loadOperatingDaysAndUpdateModal(): Observable<unknown> {

    const month = this.viewDate.getMonth() + 1;

    const year = this.viewDate.getFullYear();

    const queryParameters: QueryParameters = {
      siteId: this.currentSiteId,
      month,
      year
    };

    return this.siteCalendarService.getOperatingDays(queryParameters).pipe(
      tap({
        next: (response: unknown) => {
          const data = (response as { body?: unknown })?.body ?? response;
          const raw = (data as { operatingDays?: unknown; data?: { operatingDays?: unknown }; operatingFromDate?: string; operatingToDate?: string }) ?? {};
          const days = raw.operatingDays ?? (raw.data?.operatingDays ?? []);
          this.operatingDays = this.mapApiResponseToOperatingDays(Array.isArray(days) ? days : []);
          this.events = this.transformToCalendarEvents(this.operatingDays);
          if (raw.operatingFromDate) {
            this.operatingFromDate = new Date(raw.operatingFromDate);
          }
          if (raw.operatingToDate) {
            this.operatingToDate = new Date(raw.operatingToDate);
          }
          if (this.currentTableModal && this.selectedDate) {
            const newEvents = this.getDayEvents(this.selectedDate);
            this.currentTableModal.updateTableData(newEvents);
          } else if (this.selectedDate) {
            this.updateDayEventsTable(this.selectedDate);
          }
        }
      })
    );
  }

  private transformToCalendarEvents(days: SiteOperatingDay[]): CalendarEvent[] {
    if (!days || !Array.isArray(days) || days.length === 0) {
      return [];
    }

    const dayEvents: CalendarEvent[] = [];
    const serviceEvents: CalendarEvent[] = [];

    days.forEach(day => {
      // Transformar día de funcionamiento en evento
      // Crear fecha de manera segura para evitar problemas de zona horaria
      const operatingDate = this.parseDateSafe(day.date);
      const startDate = new Date(operatingDate);
      const endDate = new Date(operatingDate);

      // Formatear horarios para el título
      const startTimeStr = this.formatTimeValue(day.startTime);
      const endTimeStr = this.formatTimeValue(day.endTime);

      // Si hay horarios, usarlos; si no, usar horarios por defecto
      if (day.startTime && day.endTime) {
        if (startTimeStr && endTimeStr) {
          // Convertir formato 12h a 24h para Date
          const startTime = this.parseTime12To24(startTimeStr);
          const endTime = this.parseTime12To24(endTimeStr);

          startDate.setHours(startTime.hours, startTime.minutes, 0, 0);
          endDate.setHours(endTime.hours, endTime.minutes, 0, 0);
        } else {
          // Horarios por defecto si no se pueden parsear
          startDate.setHours(8, 0, 0, 0);
          endDate.setHours(16, 0, 0, 0);
        }
      } else {
        // Horarios por defecto
        startDate.setHours(8, 0, 0, 0);
        endDate.setHours(16, 0, 0, 0);
      }

      const draggable = this.view === CalendarView.Week ? true : false;
      const resizable = this.view === CalendarView.Week ? { beforeStart: true, afterEnd: true } : { beforeStart: false, afterEnd: false };

      // Evento del día de funcionamiento
      dayEvents.push({
        start: startDate,
        end: endDate,
        title: day.isHoliday ? this.translocoService.translate('sites.calendar.day-events.day-types.holiday') :
               day.isWeekend ? this.translocoService.translate('sites.calendar.day-events.day-types.weekend-operating') :
               this.translocoService.translate('sites.calendar.day-events.day-types.operating-day'),
        color: this.getEventColor(day),
        draggable: draggable,
        resizable: resizable,
        meta: { ...day, isService: false }
      });

      // Transformar servicios del día en eventos
      const hasServices = day.services && day.services.length > 0;
      if (hasServices) {
        day.services.forEach((service: SiteOperatingDayService) => {
          // Mostrar todos los servicios: los deshabilitados en feriados se muestran con tono apagado (opacity-40)
          if (!service.isEnabled && !day.isHoliday) {
            return; // No mostrar servicios deshabilitados salvo en feriados
          }

          // Usar la misma fecha del día de funcionamiento para evitar problemas de zona horaria
          const serviceDate = new Date(operatingDate);
          const serviceStartDate = new Date(serviceDate);
          const serviceEndDate = new Date(serviceDate);

          // Parsear horarios del servicio
          const serviceStartTimeStr = this.formatTimeValue(service.startTime);
          const serviceEndTimeStr = this.formatTimeValue(service.endTime);

          if (serviceStartTimeStr && serviceEndTimeStr) {
            const serviceStartTime = this.parseTime12To24(serviceStartTimeStr);
            const serviceEndTime = this.parseTime12To24(serviceEndTimeStr);

            serviceStartDate.setHours(serviceStartTime.hours, serviceStartTime.minutes, 0, 0);
            serviceEndDate.setHours(serviceEndTime.hours, serviceEndTime.minutes, 0, 0);
          } else {
            // Usar horarios del día si el servicio no tiene horarios específicos
            serviceStartDate.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0);
            serviceEndDate.setHours(endDate.getHours(), endDate.getMinutes(), 0, 0);
          }

          // Obtener nombre del servicio
          const serviceName = this.currentLanguage === 'es'
            ? (service.serviceTypeName || this.translocoService.translate('sites.calendar.day-events.service-fallback'))
            : (service.serviceTypeNameEN || this.translocoService.translate('sites.calendar.day-events.service-fallback'));

          const title = service.childGroupName
            ? `${service.childGroupName} - ${serviceName}`
            : serviceName;

          serviceEvents.push({
            start: serviceStartDate,
            end: serviceEndDate,
            title,
            color: this.getServiceEventColor(service),
            draggable: false, // Los servicios no son arrastrables
            resizable: { beforeStart: false, afterEnd: false }, // Los servicios no son redimensionables
            meta: {
              ...service,
              isService: true,
              operatingDayId: day.id,
              operatingDate: day.date
            }
          });
        });
      } else if (day.isHoliday) {
        // Día feriado sin servicios en API: crear placeholders (childGroups o fallback desde otros días)
        this.createPlaceholderServiceEventsForHoliday(day, operatingDate, startDate, endDate, serviceEvents, days);
      }
    });

    // Combinar eventos: días primero, luego servicios
    return [...dayEvents, ...serviceEvents];
  }

  /**
   * Crea eventos placeholder de servicios para días feriados cuando la API no devuelve servicios.
   * 1) Intenta usar serviceSlots de childGroups del sitio.
   * 2) Si no hay childGroups/slots, usa servicios de otros días del mes como plantilla.
   */
  private createPlaceholderServiceEventsForHoliday(
    day: SiteOperatingDay,
    operatingDate: Date,
    startDate: Date,
    endDate: Date,
    serviceEvents: CalendarEvent[],
    allDays: SiteOperatingDay[]
  ): void {
    const countBefore = serviceEvents.length;

    // Estrategia 1: childGroups del sitio
    const site = this.currentSite;
    if (site?.childGroups?.length) {
      site.childGroups.forEach(childGroup => {
        const slots = childGroup.serviceSlots ?? [];
        slots
          .filter(slot => slot.isOffered)
          .forEach(slot => {
            this.addPlaceholderServiceEvent(day, operatingDate, startDate, endDate, serviceEvents, {
              serviceTypeId: slot.serviceTypeId,
              serviceTypeName: slot.serviceTypeName,
              serviceTypeNameEN: slot.serviceTypeNameEN,
              childGroupId: childGroup.id,
              childGroupName: this.currentLanguage === 'es' ? (childGroup.groupName ?? '') : (childGroup.groupNameEN ?? childGroup.groupName ?? '')
            });
          });
      });
    }

    // Estrategia 2: fallback desde servicios de otros días del mes
    if (serviceEvents.length === countBefore && allDays?.length) {
      const templateServices = allDays
        .filter(d => d !== day && d.services?.length)
        .flatMap(d => d.services!)
        .filter((s: SiteOperatingDayService) => s.isEnabled);

      const seen = new Set<string>();
      templateServices.forEach((service: SiteOperatingDayService) => {
        const key = `${service.childGroupId}-${service.serviceTypeId}`;
        if (seen.has(key)) return;
        seen.add(key);
        this.addPlaceholderServiceEvent(day, operatingDate, startDate, endDate, serviceEvents, {
          serviceTypeId: service.serviceTypeId,
          serviceTypeName: service.serviceTypeName,
          serviceTypeNameEN: service.serviceTypeNameEN,
          childGroupId: service.childGroupId,
          childGroupName: service.childGroupName ?? ''
        });
      });
    }
  }

  private addPlaceholderServiceEvent(
    day: SiteOperatingDay,
    operatingDate: Date,
    startDate: Date,
    endDate: Date,
    serviceEvents: CalendarEvent[],
    service: { serviceTypeId: number; serviceTypeName?: string; serviceTypeNameEN?: string; childGroupId: number; childGroupName: string }
  ): void {
    const serviceDate = new Date(operatingDate);
    const serviceStartDate = new Date(serviceDate);
    const serviceEndDate = new Date(serviceDate);
    serviceStartDate.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0);
    serviceEndDate.setHours(endDate.getHours(), endDate.getMinutes(), 0, 0);

    const serviceName = this.currentLanguage === 'es'
      ? (service.serviceTypeName ?? this.translocoService.translate('sites.calendar.day-events.service-fallback'))
      : (service.serviceTypeNameEN ?? service.serviceTypeName ?? this.translocoService.translate('sites.calendar.day-events.service-fallback'));
    const title = service.childGroupName ? `${service.childGroupName} - ${serviceName}` : serviceName;

    serviceEvents.push({
      start: serviceStartDate,
      end: serviceEndDate,
      title,
      color: getServiceEventColorByTypeId(service.serviceTypeId),
      draggable: false,
      resizable: { beforeStart: false, afterEnd: false },
      meta: {
        serviceTypeId: service.serviceTypeId,
        serviceTypeName: service.serviceTypeName,
        serviceTypeNameEN: service.serviceTypeNameEN,
        childGroupId: service.childGroupId,
        childGroupName: service.childGroupName,
        isService: true,
        isPlaceholderForHoliday: true,
        operatingDayId: day.id,
        operatingDate: day.date
      }
    });
  }

  /**
   * Parsea una fecha de manera segura, evitando problemas de zona horaria
   * Si la fecha viene como string "YYYY-MM-DD" o "YYYY-MM-DDTHH:mm:ss",
   * la parsea manualmente para preservar el día exacto
   */
  private parseDateSafe(dateString: string | Date): Date {
    if (!dateString) {
      return new Date();
    }

    // Si ya es un objeto Date, devolverlo
    if (dateString instanceof Date) {
      return new Date(dateString);
    }

    // Si es un string, parsearlo manualmente
    if (typeof dateString === 'string') {
      // Intentar parsear formato ISO "YYYY-MM-DD" o "YYYY-MM-DDTHH:mm:ss"
      const dateMatch = dateString.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (dateMatch) {
        const year = parseInt(dateMatch[1], 10);
        const month = parseInt(dateMatch[2], 10) - 1; // Los meses en Date son 0-indexed
        const day = parseInt(dateMatch[3], 10);

        // Crear fecha en hora local (medianoche local) para preservar el día
        return new Date(year, month, day, 0, 0, 0, 0);
      }
    }

    // Fallback: usar constructor de Date normal
    return new Date(dateString);
  }

  private getServiceEventColor(service: SiteOperatingDayService): any {
    return getServiceEventColorByTypeId(service?.serviceTypeId);
  }

  /** Icono del servicio para eventos en la vista de mes (reemplaza el punto de color). */
  getServiceIcon(event: CalendarEvent): string {
    const meta = event.meta as { isService?: boolean; serviceTypeId?: number } | undefined;
    if (meta?.isService && meta.serviceTypeId != null) {
      return getServiceTypeStyle(meta.serviceTypeId).icon;
    }
    return '';
  }

  /** Indica si el evento es de servicio (para mostrar icono en lugar de color). */
  isServiceEvent(event: CalendarEvent): boolean {
    const meta = event.meta as { isService?: boolean } | undefined;
    return !!meta?.isService;
  }

  /** Eventos de día (operación, fin de semana, festivo) para la barra superior de la celda. */
  getDayIndicatorEvents(day: { events?: CalendarEvent[] }): CalendarEvent[] {
    return (day?.events ?? []).filter(e => !this.isServiceEvent(e));
  }

  /** Eventos de servicio para los iconos en la fila inferior de la celda. */
  getServiceIconEvents(day: { events?: CalendarEvent[] }): CalendarEvent[] {
    return (day?.events ?? []).filter(e => this.isServiceEvent(e));
  }

  /** Ítems de leyenda de servicios: icono + nombre por cada tipo de servicio (siempre todos), ordenados por displayOrder. */
  get serviceTypeLegendItems(): { serviceTypeId: number; icon: string; name: string }[] {
    return ServiceTypes.map(option => {
      const style = getServiceTypeStyle(option.id);
      const name = this.currentLanguage === 'es' ? option.name : option.nameEN;
      return { serviceTypeId: option.id, icon: style.icon, name };
    });
  }

  /** Indica si el día es feriado (para aplicar tono deshabilitado a los iconos). */
  isDayHoliday(day: { events?: CalendarEvent[] }): boolean {
    return this.getDayIndicatorEvents(day).some(
      e => (e.meta as { isHoliday?: boolean })?.isHoliday === true
    );
  }

  /** Texto del tooltip para el indicador de tipo de día */
  getDayTypeTooltip(day: { events?: CalendarEvent[] }): string {
    const indicatorEvents = this.getDayIndicatorEvents(day);
    return indicatorEvents.length > 0 ? (indicatorEvents[0].title ?? '') : '';
  }

  /** Color de fondo del badge según el tipo de día de funcionamiento */
  getBadgeBackgroundColor(day: { events?: CalendarEvent[] }): string {
    const indicatorEvents = this.getDayIndicatorEvents(day);
    if (indicatorEvents.length > 0) {
      return indicatorEvents[0].color?.primary ?? '#b94a48';
    }
    return '#b94a48';
  }

  /** Color de borde para el grupo en la vista de mes (por childGroupId). */
  getGroupColor(childGroupId: number | undefined): string {
    if (childGroupId == null) return '#9e9e9e';
    const groups = this.currentSite?.childGroups ?? [];
    const index = groups.findIndex(g => g.id === childGroupId);
    return getGroupBorderColor(index >= 0 ? index : 0);
  }

  private getEventColor(day: SiteOperatingDay): any {
    if (day.isHoliday) {
      return { primary: '#9c27b0', secondary: '#e1bee7' }; // Morado para días feriados
    }
    // Explicación de "Sobrescribir fin de semana":
    // ¿Para qué sirve?
    // - Marcar fines de semana que sí operan (excepción)
    // - Diferenciarlos de los fines de semana cerrados
    // - Permitir horarios específicos en sábados/domingos
    if (day.isWeekend) {
      return { primary: '#ff9800', secondary: '#ffcc80' }; // Naranja para fines de semana
    }
    return { primary: '#4caf50', secondary: '#c8e6c9' }; // Verde para días normales
  }

  private formatTimeValue(timeValue: any): string {
    if (!timeValue) return '';

    // Si es un string, convertir de 24h a 12h si es necesario
    if (typeof timeValue === 'string') {
      // Si ya está en formato 12h (contiene AM/PM), devolverlo tal como está
      if (timeValue.includes('AM') || timeValue.includes('PM')) {
        return timeValue;
      }
      // Si está en formato 24h, convertir a 12h
      const time24Match = timeValue.match(/(\d{1,2}):(\d{2})/);
      if (time24Match) {
        const hours = parseInt(time24Match[1]);
        const minutes = time24Match[2];
        return this.convert24To12(hours, minutes);
      }
      return timeValue;
    }

    // Si es un objeto DateTime (Luxon), convertir a string
    if (timeValue && typeof timeValue === 'object' && timeValue.toFormat) {
      return timeValue.toFormat('hh:mm a'); // Formato 12h con AM/PM
    }

    // Si es un objeto Date, convertir a string
    if (timeValue instanceof Date) {
      return timeValue.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }); // Formato 12h con AM/PM
    }

    // Fallback: convertir a string
    return String(timeValue);
  }

  private formatTimeFromDate(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }); // Formato 12h con AM/PM
  }

  private formatTimeForBackend(timeValue: any): string {
    if (!timeValue) return '';

    // Si es un string en formato 12h (contiene AM/PM), convertir a 24h
    if (typeof timeValue === 'string') {
      if (timeValue.includes('AM') || timeValue.includes('PM')) {
        const time12Match = timeValue.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (time12Match) {
          let hours = parseInt(time12Match[1]);
          const minutes = time12Match[2];
          const ampm = time12Match[3].toUpperCase();

          if (ampm === 'PM' && hours !== 12) {
            hours += 12;
          } else if (ampm === 'AM' && hours === 12) {
            hours = 0;
          }

          return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
        }
      }
      // Si ya está en formato 24h, agregar segundos
      const time24Match = timeValue.match(/(\d{1,2}):(\d{2})/);
      if (time24Match) {
        return `${time24Match[1].padStart(2, '0')}:${time24Match[2]}:00`;
      }
      return timeValue;
    }

    // Si es un objeto Date, convertir a formato 24h con segundos
    if (timeValue instanceof Date) {
      const hours = timeValue.getHours().toString().padStart(2, '0');
      const minutes = timeValue.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}:00`;
    }

    return String(timeValue);
  }

  private convert24To12(hours24: number, minutes: string): string {
    let hours12 = hours24;
    let period = 'AM';

    if (hours24 === 0) {
      hours12 = 12;
    } else if (hours24 === 12) {
      period = 'PM';
    } else if (hours24 > 12) {
      hours12 = hours24 - 12;
      period = 'PM';
    }

    return `${hours12}:${minutes} ${period}`;
  }

  private parseTime12To24(time12: string): { hours: number, minutes: number } {
    // Parsear formato 12h (ej: "8:00 AM", "4:30 PM")
    const match = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) {
      // Si no coincide con formato 12h, intentar formato 24h como fallback
      const match24 = time12.match(/(\d{1,2}):(\d{2})/);
      if (match24) {
        return {
          hours: parseInt(match24[1]),
          minutes: parseInt(match24[2])
        };
      }
      return { hours: 8, minutes: 0 }; // Fallback por defecto
    }

    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();

    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    return { hours, minutes };
  }

  private updateOperatingDayFromDrag(operatingDay: SiteOperatingDay) {
    // Enviar al backend
    const request: SiteOperatingDayRequest = {
      id: operatingDay.id,
      siteId: this.currentSiteId,
      operatingDate: operatingDay.date,
      startTime: operatingDay.startTime,
      endTime: operatingDay.endTime,
      isOperating: operatingDay.isOperating,
      isWeekend: operatingDay.isWeekend,
      isHoliday: operatingDay.isHoliday,
      comment: operatingDay.comment
    };

    this.loading = true;
    this.siteCalendarService.updateOperatingDay(request, { siteId: this.siteId })
      .subscribe({
        next: () => {

          this.loadOperatingDays(); // Recargar datos
          this.loading = false;
        },
        error: () => {

          this.loading = false;
        }
      });
  }

  private findDayData(date: Date): SiteOperatingDay | undefined {
    // Asegurar que date es un objeto Date válido
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return undefined;
    }

    const found = this.operatingDays.find(d => {
      if (!d.date) {
        return false;
      }

      try {
        const operatingDate = new Date(d.date);
        if (!operatingDate || isNaN(operatingDate.getTime())) {
          return false;
        }

        const isMatch = this.isSameDate(operatingDate, date);

        return isMatch;
      } catch (error) {
        return false;
      }
    });


    return found;
  }

  private isSameDate(date1: Date, date2: Date): boolean {
    if (!date1 || !date2) return false;

    try {
      return date1.getFullYear() === date2.getFullYear() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getDate() === date2.getDate();
    } catch (error) {

      return false;
    }
  }

  /**
   * Valida si una fecha está dentro del rango de días de funcionamiento del sitio
   * @param date Fecha a validar
   * @returns true si la fecha está dentro del rango, false si está fuera o si no hay fechas límite definidas
   */
  isDateWithinOperatingRange(date: Date): boolean {
    if (!date || isNaN(date.getTime())) {
      return false;
    }

    // Si no hay fechas límite definidas, permitir todas las fechas (comportamiento actual)
    if (!this.operatingFromDate || !this.operatingToDate) {
      return true;
    }

    // Normalizar fechas a medianoche para comparación
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const fromDate = new Date(this.operatingFromDate.getFullYear(), this.operatingFromDate.getMonth(), this.operatingFromDate.getDate());
    const toDate = new Date(this.operatingToDate.getFullYear(), this.operatingToDate.getMonth(), this.operatingToDate.getDate());

    return checkDate >= fromDate && checkDate <= toDate;
  }

  /**
   * Filtro de fechas para el calendario
   * Retorna false para fechas que deben ser deshabilitadas (fuera del rango)
   * @param date Fecha a evaluar
   * @returns true si la fecha debe estar habilitada, false si debe estar deshabilitada
   */
  dateFilter(date: Date | null): boolean {
    if (!date) {
      return true; // Permitir fechas nulas para que el calendario funcione normalmente
    }

    // Si no hay fechas límite definidas, permitir todas las fechas
    if (!this.operatingFromDate || !this.operatingToDate) {
      return true;
    }

    // Validar que la fecha esté dentro del rango
    return this.isDateWithinOperatingRange(date);
  }

  // Métodos para manejar eventos de la tabla
  getDayEvents(date: Date): CalendarEvent[] {
    return this.events.filter(event =>
      this.isSameDate(event.start, date)
    );
  }

  updateDayEventsTable(date: Date): void {
    const dayEvents = this.getDayEvents(date);

    // Separar días de funcionamiento de servicios
    const operatingDayEvents = dayEvents.filter(event => !event.meta?.isService);
    const serviceEvents = dayEvents.filter(event => event.meta?.isService === true);

    // Para días de funcionamiento, asegurarse de que solo haya uno por fecha
    // Si hay múltiples eventos del mismo día, usar solo el primero
    const uniqueOperatingDayEvents = operatingDayEvents.filter((event, index, self) => {
      const eventId = event.meta?.id;
      return index === self.findIndex(e => e.meta?.id === eventId);
    });

    // Transformar CalendarEvent a formato de tabla (días de funcionamiento)
    // Solo incluir días de funcionamiento, no servicios
    const dayTableData = uniqueOperatingDayEvents.map(event => ({
      id: event.meta?.id,
      title: this.getDayTitle(event.meta, date), // Usar fecha formateada
      groupName: (event.meta as any)?.childGroupName ?? '',
      startTime: event.meta?.startTime ? this.formatTimeValue(event.meta.startTime) : 'N/A',
      endTime: event.meta?.endTime ? this.formatTimeValue(event.meta.endTime) : 'N/A',
      type: this.getEventTypeLabel(event.meta),
      comment: event.meta?.comment || '',
      meta: event.meta,
      isService: false // Identificar que es un día de funcionamiento
    }));

    // Transformar servicios de eventos del calendario
    const servicesTableData = serviceEvents.map(event => {
      const service = event.meta as SiteOperatingDayService;
      return {
        id: service.id,
        title: this.getServiceTitle(service),
        groupName: service.childGroupName ?? '',
        startTime: service.startTime ? this.formatTimeValue(service.startTime) : 'N/A',
        endTime: service.endTime ? this.formatTimeValue(service.endTime) : 'N/A',
        type: this.getServiceTypeLabel(service),
        comment: service.comment || '',
        meta: service,
        isService: true, // Identificar que es un servicio
        isEnabled: service.isEnabled
      };
    });

    // También agregar servicios desde operatingDays por si no están en los eventos del calendario
    const operatingDay = this.operatingDays.find(day => {
      const dayDate = new Date(day.date);
      return this.isSameDate(dayDate, date);
    });

    // Si el día tiene servicios que no están en los eventos del calendario, agregarlos
    if (operatingDay?.services && operatingDay.services.length > 0) {
      const existingServiceIds = new Set(servicesTableData.map(s => s.id));
      operatingDay.services.forEach(service => {
        if (!existingServiceIds.has(service.id)) {
          servicesTableData.push({
            id: service.id,
            title: this.getServiceTitle(service),
            groupName: service.childGroupName ?? '',
            startTime: service.startTime ? this.formatTimeValue(service.startTime) : 'N/A',
            endTime: service.endTime ? this.formatTimeValue(service.endTime) : 'N/A',
            type: this.getServiceTypeLabel(service),
            comment: service.comment || '',
            meta: service,
            isService: true,
            isEnabled: service.isEnabled
          });
        }
      });
    }

    // Combinar días de funcionamiento primero, luego servicios
    const tableData = [...dayTableData, ...servicesTableData];

    // Actualizar el dataSource existente en lugar de crear uno nuevo
    this.tableConfig.dataSourceList = tableData;
    this.tableConfig.dataSource.data = tableData;
  }

  private getDayTitle(operatingDay: any, date: Date): string {
    // Verificar si es feriado primero
    if (operatingDay.isHoliday) {
      return this.translocoService.translate('sites.calendar.day-events.day-types.holiday');
    }
    // Usar la traducción para el título del día de funcionamiento
    return this.translocoService.translate('sites.calendar.day-events.operating-day-title');
  }

  // Método para obtener el día de funcionamiento para una fecha específica
  getOperatingDayForDate(date: Date): SiteOperatingDay | undefined {
    return this.operatingDays.find(day => {
      const dayDate = this.parseDateSafe(day.date);
      return this.isSameDate(dayDate, date);
    });
  }

  // Método para obtener el día de funcionamiento por ID
  getOperatingDayById(operatingDayId: number): SiteOperatingDay | undefined {
    return this.operatingDays.find(day => day.id === operatingDayId);
  }

  // Método para abrir modal de servicios desde la tabla (ya no se usa, los servicios se muestran en la tabla principal)
  openServicesModalFromTable(date: Date): void {
    const operatingDay = this.operatingDays.find(day => {
      const dayDate = new Date(day.date);
      return this.isSameDate(dayDate, date);
    });
    // Ya no se abre el modal de servicios porque los servicios se muestran en la tabla principal
    // Este método se mantiene por compatibilidad pero no hace nada
  }

  private getServiceTitle(service: any): string {
    // Usar el nombre del servicio según el idioma actual
    const serviceName = this.currentLanguage === 'es' ? service.serviceTypeName : service.serviceTypeNameEN;
    const baseName = serviceName || this.translocoService.translate('sites.calendar.day-events.service-fallback');
    if (service?.childGroupName) {
      return `${service.childGroupName} - ${baseName}`;
    }
    return baseName;
  }

  private getServiceTypeLabel(service: any): string {
    return service.serviceTypeName || this.translocoService.translate('sites.calendar.day-events.service-fallback');
  }

  getEventTypeLabel(operatingDay: SiteOperatingDay): string {
    if (operatingDay.isHoliday) {
      return this.translocoService.translate('sites.calendar.day-events.day-types.holiday');
    }
    if (operatingDay.isWeekend) {
      return this.translocoService.translate('sites.calendar.day-events.day-types.weekend');
    }
    return this.translocoService.translate('sites.calendar.day-events.day-types.normal');
  }


  private deleteService(serviceId: number): void {
    const confirmMessage = this.translocoService.translate('sites.calendar.day-events.confirm-delete-service');

    this.notificationService.showConfirmationDialogWithCallback({
      message: confirmMessage,
      icon: {
        show: true,
        name: 'heroicons_outline:trash',
        color: 'warn'
      },
      actions: {
        confirm: {
          label: 'users.list.actions.delete',
          color: 'warn'
        }
      }
    }, (result) => {
      if (result === 'confirmed') {
        this.siteOperatingDayServiceService.deleteService(serviceId).subscribe({
          next: () => {
            this.loadOperatingDays();
            if (this.selectedDate) {
              this.updateDayEventsTable(this.selectedDate);
            }
          },
          error: (error) => {
            console.error('Error al eliminar servicio:', error);
          }
        });
      }
    });
  }

  // Método para abrir modal de edición de servicio
  openEditServiceDialog(service: SiteOperatingDayService): void {
    // Obtener el operatingDay para verificar si es feriado
    // Priorizar búsqueda por ID, que es más preciso y evita errores de comparación de fechas
    let operatingDay: SiteOperatingDay | undefined;

    // Prioridad 1: Buscar por operatingDayId (más preciso)
    if (service.operatingDayId) {
      operatingDay = this.getOperatingDayById(service.operatingDayId);
    }

    // Prioridad 2: Si no se encontró por ID, buscar por fecha del servicio
    if (!operatingDay && service.operatingDate) {
      const serviceDate = new Date(service.operatingDate);
      operatingDay = this.getOperatingDayForDate(serviceDate);
    }

    // Prioridad 3: Si aún no se encontró, usar la fecha seleccionada como último recurso
    if (!operatingDay && this.selectedDate) {
      operatingDay = this.getOperatingDayForDate(this.selectedDate);
    }

    // Validación adicional: verificar que el operatingDay obtenido corresponde al servicio
    // Si se obtuvo por ID, ya está validado. Si se obtuvo por fecha, verificar que el ID coincida
    if (operatingDay && service.operatingDayId && operatingDay.id !== service.operatingDayId) {
      // Si hay discrepancia, intentar buscar nuevamente por ID
      operatingDay = this.getOperatingDayById(service.operatingDayId);
    }

    // Si el día es feriado, no permitir editar servicios
    // if (operatingDay && operatingDay.isHoliday) {
    //   const message = this.translocoService.translate('sites.calendar.day-events.cannot-edit-holiday');
    //   alert(message || 'No se pueden editar servicios en días feriados');
    //   return;
    // }

    // Preparar el formulario con los datos actuales del servicio
    const serviceForm = this.fb.group({
      startTime: [service.startTime || '', Validators.required],
      endTime: [service.endTime || '', Validators.required],
      comment: [service.comment || ''],
      isEnabled: [service.isEnabled !== undefined ? service.isEnabled : true]
    });

    // También verificar si el servicio tiene dayStartTime y dayEndTime directamente
    // Si no hay operatingDay pero el servicio tiene los horarios del día, crear un objeto temporal
    if (!operatingDay && service.dayStartTime && service.dayEndTime) {
      // Los horarios ya están en el servicio, no necesitamos el operatingDay completo
      operatingDay = undefined; // Ya tenemos los horarios en el servicio
    }

    const dialogRef = this.dialog.open(SiteCalendarServiceEditModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        form: serviceForm,
        service: service,
        siteId: this.currentSiteId,
        operatingDay: operatingDay
      } as SiteCalendarServiceEditModalData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.action === 'delete') {
          this.deleteService(service.id);
        } else {
          // Incluir el serviceTypeId del servicio original en el formData
          this.updateService(service.id, { ...result, serviceTypeId: service.serviceTypeId });
        }
      }
    });
  }

  private updateService(serviceId: number, formData: any): void {
    // Obtener el servicio actual para mantener los campos que no se editan
    this.siteOperatingDayServiceService.getServiceById(serviceId).subscribe({
      next: (currentService: SiteOperatingDayService) => {
        // Convertir horarios a formato 24h con segundos para el backend
        const startTime = this.formatTimeForBackend(formData.startTime);
        const endTime = this.formatTimeForBackend(formData.endTime);

        // Usar serviceTypeId del formData si está disponible, si no del servicio actual
        const serviceTypeId = formData.serviceTypeId || currentService.serviceTypeId;

        const request = {
          operatingDayId: currentService.operatingDayId,
          serviceTypeId: serviceTypeId,
          childGroupId: currentService.childGroupId,
          startTime: startTime,
          endTime: endTime,
          isEnabled: formData.isEnabled !== undefined ? formData.isEnabled : true,
          comment: formData.comment || ''
        };

        console.log('Updating service with request:', request);

        this.loading = true;
        this.siteOperatingDayServiceService.updateService(serviceId, request).subscribe({
          next: () => {
            this.loadOperatingDaysAndUpdateModal().subscribe({
              next: () => {
                this.loading = false;
              },
              error: () => {
                this.loading = false;
              }
            });
          },
          error: (error) => {
            console.error('Error al actualizar servicio:', error);
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error al obtener servicio:', error);
      }
    });
  }

  private toggleService(serviceId: number): void {
    // Obtener el servicio actual para conocer su estado actual
    this.siteOperatingDayServiceService.getServiceById(serviceId).subscribe({
      next: (currentService: SiteOperatingDayService) => {
        // Cambiar el estado al opuesto
        const newState = !currentService.isEnabled;

        this.loading = true;
        this.siteOperatingDayServiceService.toggleService(serviceId, newState).subscribe({
          next: () => {
            this.loadOperatingDaysAndUpdateModal().subscribe({
              next: () => {
                this.loading = false;
              },
              error: () => {
                this.loading = false;
              }
            });
          },
          error: (error) => {
            console.error('Error al cambiar estado del servicio:', error);
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error al obtener servicio:', error);
      }
    });
  }

  // Implementación de OnGenericTableHandler
  onTableEdit(event: Event, id: any): void {
    // Verificar si es un servicio o un día de funcionamiento
    const tableData = this.tableConfig.dataSourceList.find(item => item.id === id);
    if (tableData?.isService) {
      // Es un servicio, abrir modal de edición de servicio
      const service = tableData.meta as SiteOperatingDayService;

      // Obtener el operatingDay usando el operatingDayId del servicio (más preciso)
      let operatingDay: SiteOperatingDay | undefined;
      if (service.operatingDayId) {
        // Priorizar búsqueda por ID, que es más preciso
        operatingDay = this.getOperatingDayById(service.operatingDayId);
      } else if (service.operatingDate) {
        // Fallback: buscar por fecha si no hay operatingDayId
        const serviceDate = new Date(service.operatingDate);
        operatingDay = this.getOperatingDayForDate(serviceDate);
      } else if (this.selectedDate) {
        // Último fallback: usar la fecha seleccionada
        operatingDay = this.getOperatingDayForDate(this.selectedDate);
      }

      // Crear servicio con operatingDay si está disponible
      const serviceWithDay = operatingDay ? { ...service, operatingDay } : service;
      this.openEditServiceDialog(serviceWithDay as SiteOperatingDayService);
    } else {
      // Es un día de funcionamiento, abrir modal de edición
      const calendarEvent = this.events.find(e => e.meta?.id === id);
      if (calendarEvent) {
        this.openEditEventDialogFromTable(calendarEvent, id);
      }
    }
  }

  onTableEditModal(event: Event, id: any): void {
    // Mismo comportamiento que onTableEdit para mantener consistencia
    this.onTableEdit(event, id);
  }

  onTableDelete(event: Event, id: any): void {
    // Verificar si es un servicio o un día de funcionamiento
    const tableData = this.tableConfig.dataSourceList.find(item => item.id === id);
    if (tableData?.isService) {
      // Es un servicio, eliminarlo
      this.deleteService(id);
    } else {
      // Es un día de funcionamiento, eliminarlo
      const calendarEvent = this.events.find(e => e.meta?.id === id);
      if (calendarEvent) {
        this.deleteOperatingDay(calendarEvent.meta.id);
      }
    }
  }

  onTableAction(event: Event, action: string, id: any): void {
    const tableData = this.tableConfig.dataSourceList.find(item => item.id === id);
    if (tableData?.isService) {
      if (action === 'toggle') {
        this.toggleService(id);
      } else if (action === 'edit') {
        this.onTableEdit(event, id);
      } else if (action === 'delete') {
        this.onTableDelete(event, id);
      }
    } else {
      // Fila de día de funcionamiento
      if (action === 'edit') {
        this.onTableEdit(event, id);
      } else if (action === 'toggle-holiday') {
        this.toggleOperatingDayHoliday(id);
      }
    }
  }

  /**
   * Cambia el estado feriado de un día de funcionamiento (marca como feriado o quita feriado).
   */
  private toggleOperatingDayHoliday(operatingDayId: number): void {
    const operatingDay = this.getOperatingDayById(operatingDayId);
    if (!operatingDay) {
      return;
    }
    const startTime = this.formatTimeForBackend(operatingDay.startTime);
    const endTime = this.formatTimeForBackend(operatingDay.endTime);
    const isWeekend = operatingDay.isWeekend ?? false;
    const request: SiteOperatingDayRequest = {
      id: operatingDay.id,
      siteId: this.currentSiteId,
      operatingDate: operatingDay.date,
      startTime,
      endTime,
      isOperating: true,
      isWeekend,
      isHoliday: !operatingDay.isHoliday,
      comment: operatingDay.comment ?? ''
    };
    this.loading = true;
    this.siteCalendarService.updateOperatingDay(request, { siteId: this.siteId }).subscribe({
      next: () => {
        this.loadOperatingDaysAndUpdateModal().subscribe({
          next: () => {
            this.loading = false;
          },
          error: () => {
            this.loading = false;
          }
        });
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onAddButtonClick(event?: Event): void {
    // Abrir modal para agregar evento al día seleccionado
    if (this.selectedDate) {
      this.openAddDayDialog(this.selectedDate);
    }
  }

  // Abrir modal con tabla de eventos del día
  openDayEventsModal(date: Date): void {
    const modalData: SiteCalendarTableModalData = {
      date: date,
      events: this.getDayEvents(date),
      tableConfig: this.tableConfig,
      handler: this,
      siteId: this.currentSiteId,
      childGroups: this.currentSite?.childGroups ?? [],
      onEventAdded: () => {
        // Callback para actualizar la tabla cuando se agrega un evento
        // No recargar aquí para evitar llamadas duplicadas
      },
      onEventUpdated: () => {
        // Callback para actualizar la tabla cuando se edita un evento
        this.updateDayEventsTable(date);
      }
    };

    const dialogRef = this.dialog.open(SiteCalendarTableModalComponent, {
      width: '80%',
      maxWidth: '1200px',
      data: modalData
    });

    // Guardar referencia al modal para poder actualizarlo directamente
    dialogRef.afterOpened().subscribe(() => {
      const modalData = dialogRef.componentInstance.data;
      if (modalData.modalComponent) {
        // Guardar referencia al modal para actualizaciones directas
        this.currentTableModal = modalData.modalComponent;
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'refresh') {
        this.loadOperatingDays(); // Recargar datos si hubo cambios
      }
      // Limpiar referencia al modal
      this.currentTableModal = null;
      // Ya no necesitamos manejar 'add-event' aquí porque se maneja en el modal hijo
    });
  }

  // Actualizar tabla después de agregar/editar/eliminar eventos
  private refreshDayEventsTable(): void {
    if (this.view === CalendarView.Month && this.selectedDate) {
      this.updateDayEventsTable(this.selectedDate);
    }
  }

  /**
   * Mapea la respuesta de la API a la interfaz del componente
   */
  private mapApiResponseToOperatingDays(apiDays: OperatingDayApiResponse[]): SiteOperatingDay[] {
    if (!apiDays || !Array.isArray(apiDays)) {
      return [];
    }

    // Aplanar el array si viene anidado (array de arrays)
    const daysArray = apiDays.length > 0 && Array.isArray(apiDays[0])
      ? apiDays.flat()
      : apiDays;

    return daysArray.map(day => ({
      id: day.id,
      siteId: day.siteId,
      date: day.operatingDate ? new Date(day.operatingDate).toISOString().split('T')[0] : '',
      startTime: day.startTime || '',
      endTime: day.endTime || '',
      isOperating: true,
      comment: day.comment || '',
      isWeekend: day.isWeekend || false,
      isHoliday: day.isHoliday || false,
      createdAt: day.createdAt ? new Date(day.createdAt) : new Date(),
      updatedAt: day.updatedAt ? new Date(day.updatedAt) : new Date(),
      services: day.services || []
    }));
  }

  /**
   * Navega al sitio correspondiente.
   * Usa la ruta actual para determinar el programa (PDAM, PSAV, PACNA) y navegar al edit correcto.
   */
  navigateToSite(): void {
    if (!this.currentSiteId || this.currentSiteId === 0) {
      return;
    }

    const url = this.router.url;
    const segments = url.split('/').filter(Boolean);

    // Encontrar el segmento del programa: sites-pdam, sites-pacna o sites-psav
    const programSegment = segments.find(
      (s) => s === 'sites-pdam' || s === 'sites-pacna' || s === 'sites-psav'
    );

    let targetRoute: string;

    if (programSegment === 'sites-pdam' || programSegment === 'sites-psav') {
      targetRoute = `${programSegment}/edit/${this.currentSiteId}`;
    } else if (programSegment === 'sites-pacna') {
      const isDayCareHome =
        this.currentSite?.isDayCareHomeId === 1 ||
        this.currentSite?.isDayCareHome?.booleanValue === true;
      if (isDayCareHome) {
        targetRoute = `sites-pacna/homes/edit/${this.currentSiteId}`;
      } else {
        targetRoute = `sites-pacna/centers/edit/${this.currentSiteId}`;
      }
    } else {
      return;
    }

    this.customRouterService.navigate([targetRoute]);
  }

}
