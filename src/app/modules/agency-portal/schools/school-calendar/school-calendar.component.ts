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
import { SchoolCalendarService, SiteOperatingDay, SiteOperatingDayRequest } from '../school-calendar.service';
import { GenericTableComponent } from '../../../../shared/components/generic-table/generic-table.component';
import { GenericTableConfig, OnGenericTableHandler } from '../../../../shared/components/generic-table/generic-table.interface';
import { DAY_EVENTS_COLUMNS_SCHEMA } from './columns-schema';
import { Subject, takeUntil } from 'rxjs';
import { FuseConfigService } from '@fuse/services/config';
import { SchoolCalendarEditModalComponent } from '../school-calendar-edit-modal/school-calendar-edit-modal.component';
import { SchoolCalendarAddModalComponent } from '../school-calendar-add-modal/school-calendar-add-modal.component';
import { DayEventsModalComponent } from '../day-events-modal/day-events-modal.component';

@Component({
  selector: 'app-school-calendar',
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
  templateUrl: './school-calendar.component.html'
})
export class SchoolCalendarComponent implements OnInit, OnDestroy, OnGenericTableHandler {
  @Input() schoolId?: number;
  @Input() schoolName: string = '';
  @Output() dayToggled = new EventEmitter<{date: Date, isOperating: boolean}>();

  // Exponer CalendarView para uso en template
  CalendarView = CalendarView;

  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  operatingDays: SiteOperatingDay[] = [];
  loading = false;
  currentSchoolId: number = 0;
  activeDayIsOpen: boolean = false;
  selectedDate: Date | null = null;
  currentLanguage: string = 'es';
  isDarkMode: boolean = false;
  editForm: FormGroup;

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
    addButtonShow: false // Deshabilitar botón agregar de la tabla
  };

  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private document = inject<Document>(DOCUMENT);
  private readonly darkThemeClass = 'dark-theme';

  private dateAdapter = inject(DateAdapter);

  constructor(
    private schoolCalendarService: SchoolCalendarService,
    private route: ActivatedRoute,
    private router: Router,
    private translocoService: TranslocoService,
    private fuseConfigService: FuseConfigService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      comment: [''],
      isWeekendOverride: [false],
      isExcluded: [false]
    });
  }

  ngOnInit() {
    // Obtener el ID de la escuela desde la ruta o input
    this.currentSchoolId = this.schoolId || +this.route.snapshot.paramMap.get('id')!;

    // Si no hay schoolId, usar uno por defecto para pruebas
    if (!this.currentSchoolId || this.currentSchoolId === 0) {
      this.currentSchoolId = 1;
    }

    console.log('SiteCalendarComponent initialized with schoolId:', this.currentSchoolId);

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

    // Cargar datos
    this.loadOperatingDays();
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

    console.log('Day clicked event:', event);
    console.log('Current view:', this.view);
    console.log('Available operating days:', this.operatingDays.length);
    console.log('Event structure:', JSON.stringify(event, null, 2));

    let date: Date | null = null;

    // Manejar diferentes estructuras de evento según la vista
    if (this.view === CalendarView.Month) {
      // En vista de mes: {day: {…}, sourceEvent: PointerEvent}
      date = event?.day || event?.date || event;
      console.log('Month view - extracted date:', date);
    } else if (this.view === CalendarView.Week) {
      // En vista de semana: {date: Date, sourceEvent: PointerEvent}
      date = event?.date || event?.day || event;
      console.log('Week view - extracted date:', date);
    } else if (this.view === CalendarView.Day) {
      // En vista de día: {date: Date, sourceEvent: PointerEvent}
      date = event?.date || event?.day || event;
      console.log('Day view - extracted date:', date);
    }

    if (!date) {
      console.error('Date parameter is undefined in onDayClick, event:', event);
      return;
    }

    console.log('Raw date value:', date, 'Type:', typeof date);

    // Asegurar que date es un objeto Date válido
    if (!(date instanceof Date)) {
      console.log('Converting date to Date object:', date);

      // Intentar diferentes formas de conversión
      if (typeof date === 'string') {
        // Si es string, intentar parsearlo
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.getTime())) {
          date = parsedDate;
        } else {
          console.error('Failed to parse date string:', date);
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
          console.error('Cannot convert object to date:', date);
          return;
        }
      } else {
        console.error('Unknown date type:', typeof date, date);
        return;
      }
    }

    if (isNaN(date.getTime())) {
      console.error('Invalid date after conversion:', date);
      console.error('Original event:', event);
      return;
    }

    console.log('Extracted date:', date);

    // Solo manejar clicks en la vista de mes
    if (this.view === CalendarView.Month) {
      // Buscar eventos para este día
      const dayEvents = this.events.filter(event =>
        this.isSameDate(event.start, date)
      );

      console.log('Events for this day:', dayEvents);

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
    console.log('Event clicked:', event);
    this.openEditEventDialog(event);
  }

  onEventTimesChanged({ event, newStart, newEnd }: { event: CalendarEvent, newStart: Date, newEnd: Date }) {
    console.log('Event times changed:', { event, newStart, newEnd });

    if (this.loading) return;

    const operatingDay = event.meta as SiteOperatingDay;
    if (!operatingDay) {
      console.error('No operating day data found for event');
      return;
    }

    // Actualizar el evento con los nuevos horarios
    const updatedOperatingDay: SiteOperatingDay = {
      ...operatingDay,
      OperatingDate: newStart,
      StartTime: this.formatTimeFromDate(newStart),
      EndTime: this.formatTimeFromDate(newEnd),
      UpdatedAt: new Date()
    };

    console.log('Updated operating day:', updatedOperatingDay);
    this.updateOperatingDayFromDrag(updatedOperatingDay);
  }

  onEventResized({ event, newStart, newEnd }: { event: CalendarEvent, newStart: Date, newEnd: Date }) {
    console.log('Event resized:', { event, newStart, newEnd });

    if (this.loading) return;

    const operatingDay = event.meta as SiteOperatingDay;
    if (!operatingDay) {
      console.error('No operating day data found for event');
      return;
    }

    // Actualizar el evento con los nuevos horarios
    const updatedOperatingDay: SiteOperatingDay = {
      ...operatingDay,
      StartTime: this.formatTimeFromDate(newStart),
      EndTime: this.formatTimeFromDate(newEnd),
      UpdatedAt: new Date()
    };

    console.log('Updated operating day from resize:', updatedOperatingDay);
    this.updateOperatingDayFromDrag(updatedOperatingDay);
  }

  onHourSegmentClicked(event: { date: Date }) {
    if (this.loading) return;

    console.log('Hour segment clicked:', event);
    console.log('Current view:', this.view);
    console.log('Available operating days:', this.operatingDays.length);

    const date = event.date;
    console.log('Extracted date from hour segment:', date);

    const dayData = this.findDayData(date);
    console.log('Found day data:', dayData);

    if (dayData) {
      // Si el día ya tiene horario, permitir agregar otro evento
      console.log('Day has existing data, but allowing to add another event');
      this.openAddDayDialog(date);
    } else {
      // Si el día no tiene horario, abrir modal para agregar
      console.log('Day has no data, opening add dialog');
      this.openAddDayDialog(date);
    }
  }

  openAddDayDialog(date: Date) {
    console.log('Opening add day dialog for date:', date);

    // Crear un día vacío para el modal
    const newDay: SiteOperatingDay = {
      Id: 0,
      SchoolId: this.currentSchoolId,
      OperatingDate: date,
      StartTime: '08:00:00',
      EndTime: '16:00:00',
      IsWeekendOverride: false,
      IsExcluded: false,
      Comment: '',
      CreatedAt: new Date(),
      UpdatedAt: new Date()
    };

    // Preparar el formulario con valores por defecto
    this.editForm.patchValue({
      startTime: '08:00',
      endTime: '16:00',
      comment: 'Explicación de "Sobrescribir fin de semana"\n¿Para qué sirve?\nMarcar fines de semana que sí operan (excepción).\nDiferenciarlos de los fines de semana cerrados.\nPermitir horarios específicos en sábados/domingos.',
      isWeekendOverride: false,
      isExcluded: false
    });

    const dialogRef = this.dialog.open(SchoolCalendarAddModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        form: this.editForm,
        operatingDay: newDay,
        schoolId: this.currentSchoolId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addOperatingDay(newDay, result);
      }
    });
  }

  openEditDayDialog(date: Date, dayData: SiteOperatingDay) {
    console.log('Opening edit day dialog for date:', date, 'with data:', dayData);

    // Preparar el formulario con los datos actuales
    this.editForm.patchValue({
      startTime: dayData.StartTime || '08:00',
      endTime: dayData.EndTime || '16:00',
      comment: dayData.Comment || 'Explicación de "Sobrescribir fin de semana"\n¿Para qué sirve?\nMarcar fines de semana que sí operan (excepción).\nDiferenciarlos de los fines de semana cerrados.\nPermitir horarios específicos en sábados/domingos.',
      isWeekendOverride: dayData.IsWeekendOverride || false,
      isExcluded: dayData.IsExcluded || false
    });

    const dialogRef = this.dialog.open(SchoolCalendarEditModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        form: this.editForm,
        event: null, // No hay evento para días existentes
        operatingDay: dayData,
        schoolId: this.currentSchoolId
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

  openEditEventDialog(event: CalendarEvent) {
    const operatingDay = event.meta as SiteOperatingDay;

    // Preparar el formulario con los datos actuales
    this.editForm.patchValue({
      startTime: operatingDay.StartTime || '08:00',
      endTime: operatingDay.EndTime || '16:00',
      comment: operatingDay.Comment || 'Explicación de "Sobrescribir fin de semana"\n¿Para qué sirve?\nMarcar fines de semana que sí operan (excepción).\nDiferenciarlos de los fines de semana cerrados.\nPermitir horarios específicos en sábados/domingos.',
      isWeekendOverride: operatingDay.IsWeekendOverride || false,
      isExcluded: operatingDay.IsExcluded || false
    });

    const dialogRef = this.dialog.open(SchoolCalendarEditModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        form: this.editForm,
        event: event,
        operatingDay: operatingDay,
        schoolId: this.currentSchoolId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.action === 'delete') {
          this.deleteOperatingDay(operatingDay);
        } else {
          this.updateOperatingDay(operatingDay, result);
        }
      }
    });
  }

  private updateOperatingDay(operatingDay: SiteOperatingDay, formData: any) {
    console.log('Updating operating day with form data:', formData);
    console.log('Original operating day:', operatingDay);

    // Convertir DateTime objects a strings si es necesario
    const startTime = this.formatTimeValue(formData.startTime);
    const endTime = this.formatTimeValue(formData.endTime);

    // Para múltiples eventos, actualizar el evento específico
    if (this.schoolCalendarService['mockData']) {
      const mockData = this.schoolCalendarService['mockData'];
      const eventIndex = mockData.OperatingDays.findIndex(day => day.Id === operatingDay.Id);
      if (eventIndex !== -1) {
        mockData.OperatingDays[eventIndex] = {
          ...operatingDay,
          StartTime: startTime,
          EndTime: endTime,
          IsWeekendOverride: formData.isWeekendOverride,
          IsExcluded: formData.isExcluded,
          Comment: formData.comment,
          UpdatedAt: new Date()
        };
        console.log('Event updated in mock data:', mockData.OperatingDays[eventIndex]);
        this.loadOperatingDays(); // Recargar datos
        return;
      }
    }

    const request: SiteOperatingDayRequest = {
      SchoolId: this.currentSchoolId,
      OperatingDate: new Date(operatingDay.OperatingDate),
      StartTime: startTime,
      EndTime: endTime,
      IsWeekendOverride: formData.isWeekendOverride,
      IsExcluded: formData.isExcluded,
      Comment: formData.comment
    };

    console.log('Request to send:', request);

    this.loading = true;
    this.schoolCalendarService.toggleOperatingDay(request)
      .subscribe({
        next: (response) => {
          console.log('Operating day updated successfully:', response);
          console.log('Reloading operating days...');
          this.loadOperatingDays(); // Recargar datos
          this.refreshDayEventsTable(); // Actualizar tabla
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating operating day:', error);
          this.loading = false;
        }
      });
  }

  private addOperatingDay(operatingDay: SiteOperatingDay, formData: any) {
    console.log('Adding new operating day with form data:', formData);
    console.log('New operating day:', operatingDay);

    // Convertir DateTime objects a strings si es necesario
    const startTime = this.formatTimeValue(formData.startTime);
    const endTime = this.formatTimeValue(formData.endTime);

    const request: SiteOperatingDayRequest = {
      SchoolId: this.currentSchoolId,
      OperatingDate: new Date(operatingDay.OperatingDate),
      StartTime: startTime,
      EndTime: endTime,
      IsWeekendOverride: formData.isWeekendOverride,
      IsExcluded: formData.isExcluded,
      Comment: formData.comment
    };

    console.log('Request to send:', request);

    this.loading = true;
    this.schoolCalendarService.toggleOperatingDay(request)
      .subscribe({
        next: (response) => {
          console.log('Operating day added successfully:', response);
          console.log('Reloading operating days...');
          this.loadOperatingDays(); // Recargar datos
          this.refreshDayEventsTable(); // Actualizar tabla
          this.loading = false;
        },
        error: (error) => {
          console.error('Error adding operating day:', error);
          this.loading = false;
        }
      });
  }

  private deleteOperatingDay(operatingDay: SiteOperatingDay) {
    console.log('Deleting operating day:', operatingDay);

    this.loading = true;
    this.schoolCalendarService.deleteOperatingDay(operatingDay.Id)
      .subscribe({
        next: (response) => {
          console.log('Operating day deleted successfully:', response);
          console.log('Reloading operating days...');
          this.loadOperatingDays(); // Recargar datos
          this.refreshDayEventsTable(); // Actualizar tabla
          this.loading = false;
        },
        error: (error) => {
          console.error('Error deleting operating day:', error);
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
    if (this.view === CalendarView.Month) {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (this.view === CalendarView.Week) {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    this.viewDate = newDate;
  }

  next() {
    const newDate = new Date(this.viewDate);
    if (this.view === CalendarView.Month) {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (this.view === CalendarView.Week) {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    this.viewDate = newDate;
  }

  today() {
    this.viewDate = new Date();
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
    console.log('Loading operating days for schoolId:', this.currentSchoolId);
    this.loading = true;
    this.schoolCalendarService.getOperatingDays(this.currentSchoolId)
      .subscribe({
        next: (response) => {
          console.log('Operating days loaded:', response);
          this.operatingDays = response.OperatingDays;
          this.events = this.transformToCalendarEvents(response.OperatingDays);
          this.schoolName = response.SchoolName;
          console.log('Events transformed:', this.events);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading operating days:', error);
          this.loading = false;
        }
      });
  }

  private toggleOperatingDay(date: Date, isOperating: boolean) {
    this.loading = true;

    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const request: SiteOperatingDayRequest = {
      SchoolId: this.currentSchoolId,
      OperatingDate: date,
      StartTime: isOperating ? '08:00:00' : undefined,
      EndTime: isOperating ? '16:00:00' : undefined,
      IsWeekendOverride: isWeekend && isOperating,
      IsExcluded: !isOperating,
      Comment: isOperating ? 'Día de funcionamiento' : 'Día no operativo'
    };

    this.schoolCalendarService.toggleOperatingDay(request)
      .subscribe({
        next: (success) => {
          if (success) {
            this.loadOperatingDays(); // Recargar datos
            this.dayToggled.emit({ date, isOperating });
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error toggling operating day:', error);
          this.loading = false;
        }
      });
  }

  private transformToCalendarEvents(days: SiteOperatingDay[]): CalendarEvent[] {
    console.log('Transforming days to events:', days);
    const events = days
      .map(day => {
        // Asegurar que OperatingDate sea un objeto Date
        const operatingDate = day.OperatingDate instanceof Date ? day.OperatingDate : new Date(day.OperatingDate);

        // Crear fechas de inicio y fin
        const startDate = new Date(operatingDate);
        const endDate = new Date(operatingDate);

        // Si hay horarios, usarlos; si no, usar horarios por defecto
        if (day.StartTime && day.EndTime) {
          const startTimeStr = this.formatTimeValue(day.StartTime);
          const endTimeStr = this.formatTimeValue(day.EndTime);

          if (startTimeStr && endTimeStr) {
            const [startHour, startMin] = startTimeStr.split(':');
            const [endHour, endMin] = endTimeStr.split(':');

            startDate.setHours(parseInt(startHour), parseInt(startMin), 0, 0);
            endDate.setHours(parseInt(endHour), parseInt(endMin), 0, 0);
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

        return {
          start: startDate,
          end: endDate,
          title: day.IsExcluded ? 'Día cerrado' : (day.Comment || `Horario ${day.StartTime}-${day.EndTime}`),
          color: this.getEventColor(day),
          draggable: draggable,
          resizable: resizable,
          meta: { ...day }
        };
      });

    console.log('Events created:', events);
    return events;
  }

  private getEventColor(day: SiteOperatingDay): any {
    if (day.IsExcluded) {
      return { primary: '#f44336', secondary: '#ffcdd2' }; // Rojo para días excluidos
    }
    // Explicación de "Sobrescribir fin de semana":
    // ¿Para qué sirve?
    // - Marcar fines de semana que sí operan (excepción)
    // - Diferenciarlos de los fines de semana cerrados
    // - Permitir horarios específicos en sábados/domingos
    if (day.IsWeekendOverride) {
      return { primary: '#ff9800', secondary: '#ffcc80' }; // Naranja para fines de semana
    }
    return { primary: '#4caf50', secondary: '#c8e6c9' }; // Verde para días normales
  }

  private formatTimeValue(timeValue: any): string {
    if (!timeValue) return '';

    // Si es un string, devolverlo tal como está
    if (typeof timeValue === 'string') {
      return timeValue;
    }

    // Si es un objeto DateTime (Luxon), convertir a string
    if (timeValue && typeof timeValue === 'object' && timeValue.toFormat) {
      return timeValue.toFormat('HH:mm');
    }

    // Si es un objeto Date, convertir a string
    if (timeValue instanceof Date) {
      return timeValue.toTimeString().substring(0, 5); // HH:mm
    }

    // Fallback: convertir a string
    return String(timeValue);
  }

  private formatTimeFromDate(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private updateOperatingDayFromDrag(operatingDay: SiteOperatingDay) {
    console.log('Updating operating day from drag/resize:', operatingDay);

    // Para múltiples eventos, actualizar el evento específico
    if (this.schoolCalendarService['mockData']) {
      const mockData = this.schoolCalendarService['mockData'];
      const eventIndex = mockData.OperatingDays.findIndex(day => day.Id === operatingDay.Id);
      if (eventIndex !== -1) {
        mockData.OperatingDays[eventIndex] = {
          ...operatingDay,
          UpdatedAt: new Date()
        };
        console.log('Event updated in mock data from drag/resize:', mockData.OperatingDays[eventIndex]);
        this.loadOperatingDays(); // Recargar datos
        return;
      }
    }

    // Si no es mock data, enviar al backend
    const request: SiteOperatingDayRequest = {
      SchoolId: this.currentSchoolId,
      OperatingDate: new Date(operatingDay.OperatingDate),
      StartTime: operatingDay.StartTime,
      EndTime: operatingDay.EndTime,
      IsWeekendOverride: operatingDay.IsWeekendOverride,
      IsExcluded: operatingDay.IsExcluded,
      Comment: operatingDay.Comment
    };

    console.log('Request to send for drag/resize:', request);

    this.loading = true;
    this.schoolCalendarService.toggleOperatingDay(request)
      .subscribe({
        next: (response) => {
          console.log('Operating day updated from drag/resize successfully:', response);
          this.loadOperatingDays(); // Recargar datos
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating operating day from drag/resize:', error);
          this.loading = false;
        }
      });
  }

  private findDayData(date: Date): SiteOperatingDay | undefined {
    console.log('Searching for day data for date:', date);
    console.log('Operating days to search:', this.operatingDays);

    // Asegurar que date es un objeto Date válido
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      console.error('Invalid date parameter:', date);
      return undefined;
    }

    const found = this.operatingDays.find(d => {
      if (!d.OperatingDate) {
        console.log('Day has no OperatingDate:', d);
        return false;
      }

      try {
        const operatingDate = new Date(d.OperatingDate);
        if (!operatingDate || isNaN(operatingDate.getTime())) {
          console.log('Invalid OperatingDate:', d.OperatingDate);
          return false;
        }

        const isMatch = this.isSameDate(operatingDate, date);
        console.log(`Comparing ${operatingDate.toDateString()} with ${date.toDateString()}: ${isMatch}`);
        return isMatch;
      } catch (error) {
        console.error('Error processing OperatingDate:', d.OperatingDate, error);
        return false;
      }
    });

    console.log('Found day data:', found);
    return found;
  }

  private isSameDate(date1: Date, date2: Date): boolean {
    if (!date1 || !date2) return false;

    try {
      return date1.getFullYear() === date2.getFullYear() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getDate() === date2.getDate();
    } catch (error) {
      console.error('Error comparing dates:', error, { date1, date2 });
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

    // Transformar CalendarEvent a formato de tabla
    const tableData = dayEvents.map(event => ({
      id: event.meta?.Id,
      title: event.title,
      startTime: event.meta?.StartTime || '',
      endTime: event.meta?.EndTime || '',
      type: this.getEventTypeLabel(event.meta),
      comment: event.meta?.Comment || '',
      meta: event.meta
    }));

    this.tableConfig.dataSource = new MatTableDataSource(tableData);
    this.tableConfig.dataSourceList = tableData;
  }

  getEventTypeLabel(operatingDay: SiteOperatingDay): string {
    if (operatingDay.IsExcluded) {
      return 'Día cerrado';
    }
    if (operatingDay.IsWeekendOverride) {
      return 'Fin de semana';
    }
    return 'Día normal';
  }

  // Implementación de OnGenericTableHandler
  onTableEdit(event: Event, id: any): void {
    // Encontrar el evento por ID y abrir modal de edición
    const calendarEvent = this.events.find(e => e.meta?.Id === id);
    if (calendarEvent) {
      this.openEditEventDialog(calendarEvent);
    }
  }

  onTableDelete(event: Event, id: any): void {
    // Encontrar el evento por ID y eliminarlo
    const calendarEvent = this.events.find(e => e.meta?.Id === id);
    if (calendarEvent) {
      this.deleteOperatingDay(calendarEvent.meta.Id);
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
    const dialogRef = this.dialog.open(DayEventsModalComponent, {
      width: '80%',
      maxWidth: '1200px',
      data: {
        date: date,
        events: this.getDayEvents(date),
        tableConfig: this.tableConfig,
        handler: this,
        schoolId: this.schoolId,
        onEventAdded: () => {
          // Callback para actualizar la tabla cuando se agrega un evento
          this.loadOperatingDays();
        }
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'refresh') {
        this.loadOperatingDays(); // Recargar datos si hubo cambios
      }
      // Ya no necesitamos manejar 'add-event' aquí porque se maneja en el modal hijo
    });
  }

  // Actualizar tabla después de agregar/editar/eliminar eventos
  private refreshDayEventsTable(): void {
    if (this.view === CalendarView.Month && this.selectedDate) {
      this.updateDayEventsTable(this.selectedDate);
    }
  }

  // Métodos requeridos por OnGenericTableHandler (no utilizados)
  onTableAdd?(event: Event, element: any): void {}
  onTableEditElement?(event: Event, element: any): void {}
  onTableDownload?(event: Event, id: any): void {}
  onTableCalendar?(event: Event, id: any): void {}
  onTableCheckChange?(event: any, element: any): void {}
  getPaginator?(event?: any): void {}
  getById?(id: number): void {}
}
