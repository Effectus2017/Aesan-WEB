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
import { SchoolCalendarService, SchoolOperatingDay, SchoolOperatingDayRequest } from '../school-calendar.service';
import { GenericTableComponent } from '../../../../shared/components/generic-table/generic-table.component';
import { GenericTableConfig, OnGenericTableHandler } from '../../../../shared/components/generic-table/generic-table.interface';
import { DAY_EVENTS_COLUMNS_SCHEMA } from './columns-schema';
import { Subject, takeUntil } from 'rxjs';
import { FuseConfigService } from '@fuse/services/config';
import { SchoolCalendarEditModalComponent } from '../school-calendar-edit-modal/school-calendar-edit-modal.component';
import { SchoolCalendarAddModalComponent } from '../school-calendar-add-modal/school-calendar-add-modal.component';
import { SchoolCalendarTableModalComponent } from '../school-calendar-table-modal/school-calendar-table-modal.component';

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

  private schoolCalendarService: SchoolCalendarService = inject(SchoolCalendarService);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  private translocoService: TranslocoService = inject(TranslocoService);
  private fuseConfigService: FuseConfigService = inject(FuseConfigService);
  private dialog: MatDialog = inject(MatDialog);
  private fb: FormBuilder = inject(FormBuilder);

  // Exponer CalendarView para uso en template
  CalendarView = CalendarView;

  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  operatingDays: SchoolOperatingDay[] = [];
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
  private currentTableModal: any = null; // Referencia al modal de tabla actual

  private dateAdapter = inject(DateAdapter);

  constructor() {
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

    // Obtener datos del resolver en lugar de cargar manualmente
    const resolvedData = this.route.snapshot.data['data'];

    if (resolvedData) {
      console.log('Operating days loaded from resolver:', resolvedData.operatingDays);
      this.operatingDays = resolvedData.operatingDays.operatingDays || [];
      this.events = this.transformToCalendarEvents(this.operatingDays);
      this.schoolName = resolvedData.operatingDays.schoolName;
      this.loading = false;
    } else {
      console.error('No data found in resolver, falling back to manual load');
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

    console.log('Day clicked event:', event);
    console.log('Current view:', this.view);
    console.log('Available operating days:', this.operatingDays?.length || 0);
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

    const operatingDay = event.meta as SchoolOperatingDay;
    if (!operatingDay) {
      console.error('No operating day data found for event');
      return;
    }

    // Actualizar el evento con los nuevos horarios
    const updatedOperatingDay: SchoolOperatingDay = {
      ...operatingDay,
      operatingDate: newStart,
      startTime: this.formatTimeFromDate(newStart),
      endTime: this.formatTimeFromDate(newEnd),
      updatedAt: new Date()
    };

    console.log('Updated operating day:', updatedOperatingDay);
    this.updateOperatingDayFromDrag(updatedOperatingDay);
  }

  onEventResized({ event, newStart, newEnd }: { event: CalendarEvent, newStart: Date, newEnd: Date }) {
    console.log('Event resized:', { event, newStart, newEnd });

    if (this.loading) return;

    const operatingDay = event.meta as SchoolOperatingDay;
    if (!operatingDay) {
      console.error('No operating day data found for event');
      return;
    }

    // Actualizar el evento con los nuevos horarios
    const updatedOperatingDay: SchoolOperatingDay = {
      ...operatingDay,
      startTime: this.formatTimeFromDate(newStart),
      endTime: this.formatTimeFromDate(newEnd),
      updatedAt: new Date()
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
    const newDay: SchoolOperatingDay = {
      id: 0,
      schoolId: this.currentSchoolId,
      operatingDate: date,
      startTime: '08:00',
      endTime: '16:00',
      isWeekendOverride: false,
      isExcluded: false,
      comment: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Preparar el formulario con valores por defecto
    this.editForm.patchValue({
      startTime: '08:00',
      endTime: '16:00',
      comment: '',
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

  openEditDayDialog(date: Date, dayData: SchoolOperatingDay) {
    console.log('Opening edit day dialog for date:', date, 'with data:', dayData);

    // Preparar el formulario con los datos actuales
    this.editForm.patchValue({
      startTime: dayData.startTime || '08:00',
      endTime: dayData.endTime || '16:00',
      comment: dayData.comment || '',
      isWeekendOverride: dayData.isWeekendOverride || false,
      isExcluded: dayData.isExcluded || false
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

  openEditEventDialog(event: CalendarEvent, fromTable: boolean = false) {
    const operatingDay = event.meta as SchoolOperatingDay;

    // Preparar el formulario con los datos actuales
    this.editForm.patchValue({
      startTime: operatingDay.startTime || '08:00',
      endTime: operatingDay.endTime || '16:00',
      comment: operatingDay.comment || '',
      isWeekendOverride: operatingDay.isWeekendOverride || false,
      isExcluded: operatingDay.isExcluded || false
    });

    const dialogRef = this.dialog.open(SchoolCalendarEditModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        form: this.editForm,
        event: event,
        operatingDay: operatingDay,
        schoolId: this.currentSchoolId,
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
    const operatingDay = event.meta as SchoolOperatingDay;

    // Preparar el formulario con los datos actuales
    this.editForm.patchValue({
      startTime: operatingDay.startTime || '08:00',
      endTime: operatingDay.endTime || '16:00',
      comment: operatingDay.comment || '',
      isWeekendOverride: operatingDay.isWeekendOverride || false,
      isExcluded: operatingDay.isExcluded || false
    });

    const dialogRef = this.dialog.open(SchoolCalendarEditModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        form: this.editForm,
        event: event,
        operatingDay: operatingDay,
        schoolId: this.currentSchoolId,
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

  private updateOperatingDay(operatingDay: SchoolOperatingDay, formData: any, fromTable: boolean = false) {
    console.log('Updating operating day with form data:', formData);
    console.log('Original operating day:', operatingDay);
    console.log('From table:', fromTable);

    // Convertir DateTime objects a strings para el backend (formato HH:mm:ss)
    const startTime = this.formatTimeForBackend(formData.startTime);
    const endTime = this.formatTimeForBackend(formData.endTime);


    const request: SchoolOperatingDayRequest = {
      schoolId: this.currentSchoolId,
      operatingDate: new Date(operatingDay.operatingDate),
      startTime: formData.isExcluded ? null : startTime,
      endTime: formData.isExcluded ? null : endTime,
      isWeekendOverride: formData.isWeekendOverride,
      isExcluded: formData.isExcluded,
      comment: formData.comment
    };

    console.log('Request to send:', request);

    this.loading = true;
    this.schoolCalendarService.toggleOperatingDay(request, { schoolId: this.schoolId })
      .subscribe({
        next: (response) => {
          console.log('Operating day updated successfully:', response);
          console.log('Reloading operating days...');
          this.loadOperatingDays(); // Recargar datos

          // Si viene de la tabla, actualizar la tabla específicamente
          if (fromTable && this.selectedDate) {
            this.updateDayEventsTable(this.selectedDate);
          } else {
            this.refreshDayEventsTable(); // Actualizar tabla
          }

          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating operating day:', error);
          this.loading = false;
        }
      });
  }

  // Método específico para actualizar desde la tabla
  private updateOperatingDayFromTable(operatingDay: SchoolOperatingDay, formData: any, id: any) {
    console.log('Updating operating day from table with form data:', formData);
    console.log('Original operating day:', operatingDay);
    console.log('Event ID:', id);

    // Convertir DateTime objects a strings para el backend (formato HH:mm:ss)
    const startTime = this.formatTimeForBackend(formData.startTime);
    const endTime = this.formatTimeForBackend(formData.endTime);

    const request: SchoolOperatingDayRequest = {
      schoolId: this.currentSchoolId,
      operatingDate: new Date(operatingDay.operatingDate),
      startTime: startTime,
      endTime: endTime,
      isWeekendOverride: formData.isWeekendOverride,
      isExcluded: formData.isExcluded,
      comment: formData.comment
    };

    console.log('Request to send from table:', request);

    this.loading = true;
    this.schoolCalendarService.toggleOperatingDay(request, { schoolId: this.schoolId })
      .subscribe({
        next: (response) => {
          console.log('Operating day updated from table successfully:', response);
          console.log('Reloading operating days...');

          // Recargar datos y luego actualizar el modal
          this.loadOperatingDaysAndUpdateModal();

          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating operating day from table:', error);
          this.loading = false;
        }
      });
  }

  // Método específico para eliminar desde la tabla
  private deleteOperatingDayFromTable(operatingDay: SchoolOperatingDay, id: any) {
    console.log('Deleting operating day from table:', operatingDay);
    console.log('Event ID:', id);

    this.loading = true;
    this.schoolCalendarService.deleteOperatingDay({ id: operatingDay.id })
      .subscribe({
        next: (response) => {
          console.log('Operating day deleted from table successfully:', response);
          console.log('Reloading operating days...');

          // Recargar datos y luego actualizar el modal
          this.loadOperatingDaysAndUpdateModal();

          this.loading = false;
        },
        error: (error) => {
          console.error('Error deleting operating day from table:', error);
          this.loading = false;
        }
      });
  }

  private addOperatingDay(operatingDay: SchoolOperatingDay, formData: any) {
    console.log('Adding new operating day with form data:', formData);
    console.log('New operating day:', operatingDay);

    // Convertir DateTime objects a strings para el backend (formato HH:mm:ss)
    const startTime = this.formatTimeForBackend(formData.startTime);
    const endTime = this.formatTimeForBackend(formData.endTime);

    const request: SchoolOperatingDayRequest = {
      schoolId: this.currentSchoolId,
      operatingDate: new Date(operatingDay.operatingDate),
      startTime: formData.isExcluded ? null : startTime,
      endTime: formData.isExcluded ? null : endTime,
      isWeekendOverride: formData.isWeekendOverride,
      isExcluded: formData.isExcluded,
      comment: formData.comment
    };

    console.log('Request to send:', request);

    this.loading = true;
    this.schoolCalendarService.toggleOperatingDay(request, { schoolId: this.schoolId })
      .subscribe({
        next: (response) => {
          console.log('Operating day added successfully:', response);
          console.log('Reloading operating days...');
          this.loadOperatingDays(); // Recargar datos
          this.loading = false;
        },
        error: (error) => {
          console.error('Error adding operating day:', error);
          this.loading = false;
        }
      });
  }

  private deleteOperatingDay(operatingDay: SchoolOperatingDay) {
    console.log('Deleting operating day:', operatingDay);

    this.loading = true;
    this.schoolCalendarService.deleteOperatingDay({ id: operatingDay.id })
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
    this.schoolCalendarService.getOperatingDays({ schoolId: this.currentSchoolId })
      .subscribe({
        next: (response) => {
          console.log('Operating days loaded:', response);
          this.operatingDays = response.body.operatingDays || [];
          this.events = this.transformToCalendarEvents(this.operatingDays);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading operating days:', error);
          this.loading = false;
        }
      });
  }

  // Método para cargar datos y actualizar el modal de tabla
  private loadOperatingDaysAndUpdateModal() {
    console.log('Loading operating days and updating modal for schoolId:', this.currentSchoolId);
    this.schoolCalendarService.getOperatingDays({ schoolId: this.currentSchoolId })
      .subscribe({
        next: (response) => {
          console.log('Operating days loaded for modal update:', response);
          this.operatingDays = response.body.operatingDays || [];
          this.events = this.transformToCalendarEvents(this.operatingDays);

          // Actualizar la tabla del modal directamente si está abierto
          if (this.currentTableModal && this.selectedDate) {
            const newEvents = this.getDayEvents(this.selectedDate);
            this.currentTableModal.updateTableData(newEvents);
            console.log('Modal table updated with fresh data:', newEvents);
          } else if (this.selectedDate) {
            this.updateDayEventsTable(this.selectedDate);
          }
        },
        error: (error) => {
          console.error('Error loading operating days for modal update:', error);
        }
      });
  }

  private transformToCalendarEvents(days: SchoolOperatingDay[]): CalendarEvent[] {
    console.log('Transforming days to events:', days);

    if (!days || !Array.isArray(days)) {
      console.warn('No days provided or days is not an array:', days);
      return [];
    }

    const events = days
      .map(day => {
        // Asegurar que operatingDate sea un objeto Date
        const operatingDate = day.operatingDate instanceof Date ? day.operatingDate : new Date(day.operatingDate);

        // Crear fechas de inicio y fin
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

        return {
          start: startDate,
          end: endDate,
          title: day.isExcluded ? 'Día cerrado' :
                 day.isWeekendOverride ? 'Fin de semana operativo' :
                 'Día operativo',
          color: this.getEventColor(day),
          draggable: draggable,
          resizable: resizable,
          meta: { ...day }
        };
      });

    console.log('Events created:', events);
    return events;
  }

  private getEventColor(day: SchoolOperatingDay): any {
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

  private updateOperatingDayFromDrag(operatingDay: SchoolOperatingDay) {
    console.log('Updating operating day from drag/resize:', operatingDay);


    // Enviar al backend
    const request: SchoolOperatingDayRequest = {
      schoolId: this.currentSchoolId,
      operatingDate: new Date(operatingDay.operatingDate),
      startTime: operatingDay.startTime,
      endTime: operatingDay.endTime,
      isWeekendOverride: operatingDay.isWeekendOverride,
      isExcluded: operatingDay.isExcluded,
      comment: operatingDay.comment
    };

    console.log('Request to send for drag/resize:', request);

    this.loading = true;
    this.schoolCalendarService.toggleOperatingDay(request, { schoolId: this.schoolId })
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

  private findDayData(date: Date): SchoolOperatingDay | undefined {
    console.log('Searching for day data for date:', date);
    console.log('Operating days to search:', this.operatingDays);

    // Asegurar que date es un objeto Date válido
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      console.error('Invalid date parameter:', date);
      return undefined;
    }

    const found = this.operatingDays.find(d => {
      if (!d.operatingDate) {
        console.log('Day has no OperatingDate:', d);
        return false;
      }

      try {
        const operatingDate = new Date(d.operatingDate);
        if (!operatingDate || isNaN(operatingDate.getTime())) {
          console.log('Invalid OperatingDate:', d.operatingDate);
          return false;
        }

        const isMatch = this.isSameDate(operatingDate, date);
        console.log(`Comparing ${operatingDate.toDateString()} with ${date.toDateString()}: ${isMatch}`);
        return isMatch;
      } catch (error) {
        console.error('Error processing OperatingDate:', d.operatingDate, error);
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
      id: event.meta?.id,
      title: event.title,
      startTime: event.meta?.startTime ? this.formatTimeValue(event.meta.startTime) : 'N/A',
      endTime: event.meta?.endTime ? this.formatTimeValue(event.meta.endTime) : 'N/A',
      type: this.getEventTypeLabel(event.meta),
      comment: event.meta?.comment || '',
      meta: event.meta
    }));

    // Actualizar el dataSource existente en lugar de crear uno nuevo
    this.tableConfig.dataSourceList = tableData;
    this.tableConfig.dataSource.data = tableData;

    console.log('Table updated with data:', tableData);
  }

  getEventTypeLabel(operatingDay: SchoolOperatingDay): string {
    if (operatingDay.isExcluded) {
      return 'Día cerrado';
    }
    if (operatingDay.isWeekendOverride) {
      return 'Fin de semana';
    }
    return 'Día normal';
  }

  // Implementación de OnGenericTableHandler
  onTableEdit(event: Event, id: any): void {
    // Encontrar el evento por ID y abrir modal de edición
    const calendarEvent = this.events.find(e => e.meta?.id === id);
    if (calendarEvent) {
      this.openEditEventDialogFromTable(calendarEvent, id);
    }
  }

  onTableDelete(event: Event, id: any): void {
    // Encontrar el evento por ID y eliminarlo
    const calendarEvent = this.events.find(e => e.meta?.id === id);
    if (calendarEvent) {
      this.deleteOperatingDay(calendarEvent.meta.id);
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
    const dialogRef = this.dialog.open(SchoolCalendarTableModalComponent, {
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
          // No recargar aquí para evitar llamadas duplicadas
        },
        onEventUpdated: () => {
          // Callback para actualizar la tabla cuando se edita un evento
          this.updateDayEventsTable(date);
        }
      }
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

  // Métodos requeridos por OnGenericTableHandler (no utilizados)
  onTableAdd?(event: Event, element: any): void {}
  onTableEditElement?(event: Event, element: any): void {}
  onTableDownload?(event: Event, id: any): void {}
  onTableCalendar?(event: Event, id: any): void {}
  onTableCheckChange?(event: any, element: any): void {}
  getPaginator?(event?: any): void {}
  getById?(id: number): void {}
}
