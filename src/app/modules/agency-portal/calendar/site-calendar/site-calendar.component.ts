import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
  CalendarModule,
  DateAdapter
} from 'angular-calendar';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { SiteCalendarService, SiteOperatingDayRequest } from '../site-calendar.service';
import { SiteOperatingDay } from 'app/shared/models/SiteOperatingDay';
import { OperatingDayApiResponse } from 'app/shared/models/Response/OperatingDayApiResponse';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { GenericTableConfig, OnGenericTableHandler } from '../../../../shared/components/generic-table/generic-table.interface';
import { DAY_EVENTS_COLUMNS_SCHEMA } from './columns-schema';
import { Subject, takeUntil } from 'rxjs';
import { FuseConfigService } from '@fuse/services/config';
import { SiteCalendarEditModalComponent } from '../site-calendar-edit-modal/site-calendar-edit-modal.component';
import { SiteCalendarAddModalComponent } from '../site-calendar-add-modal/site-calendar-add-modal.component';
import { SiteCalendarTableModalComponent } from '../site-calendar-table-modal/site-calendar-table-modal.component';
import { SiteCalendarTableModalData } from '../site-calendar-table-modal/site-calendar-table-modal-data.interface';
import { SiteOperatingDayServiceService } from 'app/shared/services/site-operating-day-service.service';
import { SiteOperatingDayService } from 'app/shared/models/SiteOperatingDayService';
import { SiteCalendarServiceEditModalComponent } from '../site-calendar-service-edit-modal/site-calendar-service-edit-modal.component';
import { SiteCalendarServiceEditModalData } from '../site-calendar-service-edit-modal/site-calendar-service-edit-modal-data.interface';

@Component({
  selector: 'app-site-calendar',
  imports: [
    CommonModule,
    CalendarModule,
    MatButtonModule,
    MatIconModule,
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
  private siteOperatingDayServiceService: SiteOperatingDayServiceService = inject(SiteOperatingDayServiceService);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private translocoService: TranslocoService = inject(TranslocoService);
  private fuseConfigService: FuseConfigService = inject(FuseConfigService);
  private dialog: MatDialog = inject(MatDialog);
  private fb: FormBuilder = inject(FormBuilder);

  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private document = inject<Document>(DOCUMENT);
  private readonly darkThemeClass = 'dark-theme';
  private currentTableModal: any = null; // Referencia al modal de tabla actual


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
  editForm: FormGroup = this.fb.group({
    startTime: ['', Validators.required],
    endTime: ['', Validators.required],
    comment: [''],
    isWeekendOverride: [false],
    isExcluded: [false],
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
      this.loading = false;
    } else {
      this.loadOperatingDays();
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

    if (isService) {
      // Es un servicio, abrir modal de edición de servicio
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

  onHourSegmentClicked(event: { date: Date }) {
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

    // Crear un día vacío para el modal
    const newDay: SiteOperatingDay = {
      id: 0,
      siteId: this.currentSiteId,
      date: date.toISOString().split('T')[0],
      startTime: '08:00',
      endTime: '18:00',
      isOperating: true,
      isWeekendOverride: false,
      isExcluded: false,
      isHoliday: false,
      comment: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Preparar el formulario con valores por defecto
    this.editForm.patchValue({
      startTime: '08:00',
      endTime: '18:00',
      comment: '',
      isWeekendOverride: false,
      isExcluded: false,
      isHoliday: false
    });

      const dialogRef = this.dialog.open(SiteCalendarAddModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        form: this.editForm,
        operatingDay: newDay,
        siteId: this.currentSiteId
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
      isWeekendOverride: dayData.isWeekendOverride || false,
      isExcluded: dayData.isExcluded || false,
      isHoliday: dayData.isHoliday || false
    });

      const dialogRef = this.dialog.open(SiteCalendarEditModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        form: this.editForm,
        event: null, // No hay evento para días existentes
        operatingDay: dayData,
        siteId: this.currentSiteId
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
      isWeekendOverride: operatingDay.isWeekendOverride || false,
      isExcluded: operatingDay.isExcluded || false,
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
        fromTable: fromTable
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
      isWeekendOverride: operatingDay.isWeekendOverride || false,
      isExcluded: operatingDay.isExcluded || false,
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
        fromTable: true
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

  private updateOperatingDay(operatingDay: SiteOperatingDay, formData: any, fromTable: boolean = false) {

    // Convertir DateTime objects a strings para el backend (formato HH:mm:ss)
    const startTime = this.formatTimeForBackend(formData.startTime);
    const endTime = this.formatTimeForBackend(formData.endTime);


    const request: SiteOperatingDayRequest = {
      id: operatingDay.id,
      siteId: this.currentSiteId,
      operatingDate: operatingDay.date,
      startTime: formData.isExcluded ? null : startTime,
      endTime: formData.isExcluded ? null : endTime,
      isOperating: !formData.isExcluded,
      isWeekendOverride: formData.isWeekendOverride,
      isExcluded: formData.isExcluded,
      isHoliday: formData.isHoliday,
      comment: formData.comment
    };

    this.loading = true;
    this.siteCalendarService.toggleOperatingDay(request, { siteId: this.siteId })
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

    const request: SiteOperatingDayRequest = {
      id: operatingDay.id,
      siteId: this.currentSiteId,
      operatingDate: operatingDay.date,
      startTime: startTime,
      endTime: endTime,
      isOperating: !formData.isExcluded,
      isWeekendOverride: formData.isWeekendOverride,
      isExcluded: formData.isExcluded,
      isHoliday: formData.isHoliday,
      comment: formData.comment
    };

    this.loading = true;
    this.siteCalendarService.toggleOperatingDay(request, { siteId: this.siteId })
      .subscribe({
        next: () => {
          // Recargar datos y luego actualizar el modal
          this.loadOperatingDaysAndUpdateModal();
          this.loading = false;
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
          this.loadOperatingDaysAndUpdateModal();
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  private addOperatingDay(operatingDay: SiteOperatingDay, formData: any) {
    // Convertir DateTime objects a strings para el backend (formato HH:mm:ss)
    const startTime = this.formatTimeForBackend(formData.startTime);
    const endTime = this.formatTimeForBackend(formData.endTime);

    const request: SiteOperatingDayRequest = {
      siteId: this.currentSiteId,
      operatingDate: operatingDay.date,
      startTime: formData.isExcluded ? null : startTime,
      endTime: formData.isExcluded ? null : endTime,
      isOperating: !formData.isExcluded,
      isWeekendOverride: formData.isWeekendOverride,
      isExcluded: formData.isExcluded,
      isHoliday: formData.isHoliday,
      comment: formData.comment
    };
    this.loading = true;
    this.siteCalendarService.toggleOperatingDay(request, { siteId: this.siteId })
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
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const monthName = monthNames[date.getMonth()];
    const year = date.getFullYear();

    if (this.view === CalendarView.Month) {
      return `${monthName} ${year}`;
    } else if (this.view === CalendarView.Week) {
      // Calcular el rango de la semana
      const startOfWeek = new Date(date);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para que la semana empiece en lunes
      startOfWeek.setDate(diff);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const startMonth = monthNames[startOfWeek.getMonth()];
      const endMonth = monthNames[endOfWeek.getMonth()];

      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${startMonth} ${startOfWeek.getDate()}-${endOfWeek.getDate()}, ${year}`;
      } else {
        return `${startMonth} ${startOfWeek.getDate()} - ${endMonth} ${endOfWeek.getDate()}, ${year}`;
      }
    } else {
      // Vista de día
      const day = date.getDate();
      return `${day} de ${monthName}, ${year}`;
    }
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
          this.loading = false;
        },
        error: () => {

          this.loading = false;
        }
      });
  }

  // Método para cargar datos y actualizar el modal de tabla
  private loadOperatingDaysAndUpdateModal() {
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

          // Actualizar la tabla del modal directamente si está abierto
          if (this.currentTableModal && this.selectedDate) {
            const newEvents = this.getDayEvents(this.selectedDate);
            this.currentTableModal.updateTableData(newEvents);

          } else if (this.selectedDate) {
            this.updateDayEventsTable(this.selectedDate);
          }
        },
        error: () => {

        }
      });
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
        title: day.isExcluded ? this.translocoService.translate('sites.calendar.day-events.day-types.closed') :
               day.isWeekendOverride ? this.translocoService.translate('sites.calendar.day-events.day-types.weekend-operating') :
               this.translocoService.translate('sites.calendar.day-events.day-types.operating-day'),
        color: this.getEventColor(day),
        draggable: draggable,
        resizable: resizable,
        meta: { ...day, isService: false }
      });

      // Transformar servicios del día en eventos
      if (day.services && day.services.length > 0) {
        day.services.forEach((service: SiteOperatingDayService) => {
          if (!service.isEnabled) {
            return; // No mostrar servicios deshabilitados
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

          serviceEvents.push({
            start: serviceStartDate,
            end: serviceEndDate,
            title: serviceName,
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
      }
    });

    // Combinar eventos: días primero, luego servicios
    return [...dayEvents, ...serviceEvents];
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
    // Color azul para servicios
    return { primary: '#2196f3', secondary: '#bbdefb' };
  }

  private getEventColor(day: SiteOperatingDay): any {
    if (day.isExcluded) {
      return { primary: '#f44336', secondary: '#ffcdd2' }; // Rojo para días excluidos
    }
    // Explicación de "Sobrescribir fin de semana":
    // ¿Para qué sirve?
    // - Marcar fines de semana que sí operan (excepción)
    // - Diferenciarlos de los fines de semana cerrados
    // - Permitir horarios específicos en sábados/domingos
    if (day.isWeekendOverride) {
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
      isWeekendOverride: operatingDay.isWeekendOverride,
      isExcluded: operatingDay.isExcluded,
      isHoliday: operatingDay.isHoliday,
      comment: operatingDay.comment
    };

    this.loading = true;
    this.siteCalendarService.toggleOperatingDay(request, { siteId: this.siteId })
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
    return serviceName || this.translocoService.translate('sites.calendar.day-events.service-fallback');
  }

  private getServiceTypeLabel(service: any): string {
    return service.serviceTypeName || this.translocoService.translate('sites.calendar.day-events.service-fallback');
  }

  getEventTypeLabel(operatingDay: SiteOperatingDay): string {
    if (operatingDay.isExcluded) {
      return this.translocoService.translate('sites.calendar.day-events.day-types.closed');
    }
    if (operatingDay.isWeekendOverride) {
      return this.translocoService.translate('sites.calendar.day-events.day-types.weekend');
    }
    return this.translocoService.translate('sites.calendar.day-events.day-types.normal');
  }


  private deleteService(serviceId: number): void {
    const confirmMessage = this.translocoService.translate('sites.calendar.day-events.confirm-delete-service');
    if (!confirm(confirmMessage)) {
      return;
    }

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

  // Método para abrir modal de edición de servicio
  openEditServiceDialog(service: SiteOperatingDayService): void {
    // Preparar el formulario con los datos actuales del servicio
    const serviceForm = this.fb.group({
      startTime: [service.startTime || '', Validators.required],
      endTime: [service.endTime || '', Validators.required],
      comment: [service.comment || ''],
      isEnabled: [service.isEnabled !== undefined ? service.isEnabled : true]
    });

    // Obtener el operatingDay para tener los horarios del día
    let operatingDay: SiteOperatingDay | undefined;

    // Intentar obtenerlo desde diferentes fuentes
    if (service.operatingDate) {
      const serviceDate = new Date(service.operatingDate);
      operatingDay = this.getOperatingDayForDate(serviceDate);
    } else if (this.selectedDate) {
      operatingDay = this.getOperatingDayForDate(this.selectedDate);
    }

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
            this.loadOperatingDaysAndUpdateModal();
            this.loading = false;
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
            this.loadOperatingDaysAndUpdateModal();
            this.loading = false;
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

      // Obtener el operatingDay para tener los horarios del día
      let operatingDay: SiteOperatingDay | undefined;
      if (service.operatingDate) {
        const serviceDate = new Date(service.operatingDate);
        operatingDay = this.getOperatingDayForDate(serviceDate);
      } else if (this.selectedDate) {
        // Si no hay operatingDate en el servicio, usar la fecha seleccionada
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
    }
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
      isOperating: !day.isExcluded,
      comment: day.comment || '',
      isWeekendOverride: day.isWeekendOverride || false,
      isExcluded: day.isExcluded || false,
      isHoliday: day.isHoliday || false,
      createdAt: day.createdAt ? new Date(day.createdAt) : new Date(),
      updatedAt: day.updatedAt ? new Date(day.updatedAt) : new Date(),
      services: day.services || []
    }));
  }

}
