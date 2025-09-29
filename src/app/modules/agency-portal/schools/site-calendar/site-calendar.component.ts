import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  CalendarView,
  CalendarEvent,
  CalendarModule,
  DateAdapter
} from 'angular-calendar';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { SiteCalendarService, SiteOperatingDay, SiteOperatingDayRequest } from '../site-calendar.service';
import { Subject, takeUntil } from 'rxjs';
import { FuseConfigService } from '@fuse/services/config';

@Component({
  selector: 'app-site-calendar',
  imports: [CommonModule, CalendarModule, MatButtonModule, MatIconModule, TranslocoModule],
  templateUrl: './site-calendar.component.html'
})
export class SiteCalendarComponent implements OnInit, OnDestroy {
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
  currentLanguage: string = 'es';
  isDarkMode: boolean = false;

  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private document = inject<Document>(DOCUMENT);
  private readonly darkThemeClass = 'dark-theme';

  private dateAdapter = inject(DateAdapter);

  constructor(
    private siteCalendarService: SiteCalendarService,
    private route: ActivatedRoute,
    private router: Router,
    private translocoService: TranslocoService,
    private fuseConfigService: FuseConfigService
  ) {}

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

  onDayClick({ date }: { date: Date }) {
    if (this.loading) return;

    const dayData = this.operatingDays.find(d =>
      this.isSameDate(new Date(d.OperatingDate), date)
    );

    const isCurrentlyOperating = dayData ? !dayData.IsExcluded : false;
    const newOperatingStatus = !isCurrentlyOperating;

    this.toggleOperatingDay(date, newOperatingStatus);
  }

  onEventClick({ event }: { event: CalendarEvent }) {
    console.log('Event clicked:', event);
    // TODO: Implementar modal para editar horarios y comentarios
  }


  setView(view: CalendarView) {
    this.view = view;
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
    this.siteCalendarService.getOperatingDays(this.currentSchoolId)
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

    this.siteCalendarService.toggleOperatingDay(request)
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
      .filter(day => !day.IsExcluded)
      .map(day => {
        // Asegurar que OperatingDate sea un objeto Date
        const operatingDate = day.OperatingDate instanceof Date ? day.OperatingDate : new Date(day.OperatingDate);

        // Crear fechas de inicio y fin
        const startDate = new Date(operatingDate);
        const endDate = new Date(operatingDate);

        // Si hay horarios, usarlos; si no, usar horarios por defecto
        if (day.StartTime && day.EndTime) {
          const [startHour, startMin] = day.StartTime.split(':');
          const [endHour, endMin] = day.EndTime.split(':');

          startDate.setHours(parseInt(startHour), parseInt(startMin), 0, 0);
          endDate.setHours(parseInt(endHour), parseInt(endMin), 0, 0);
        } else {
          // Horarios por defecto
          startDate.setHours(8, 0, 0, 0);
          endDate.setHours(16, 0, 0, 0);
        }

        return {
          start: startDate,
          end: endDate,
          title: day.Comment || 'Día de funcionamiento',
          color: this.getEventColor(day),
          meta: { ...day }
        };
      });

    console.log('Events created:', events);
    return events;
  }

  private getEventColor(day: SiteOperatingDay): any {
    if (day.IsWeekendOverride) {
      return { primary: '#ff9800', secondary: '#ffcc80' }; // Naranja para fines de semana
    }
    return { primary: '#4caf50', secondary: '#c8e6c9' }; // Verde para días normales
  }

  private isSameDate(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }
}
