import { CommonModule, Location } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { CalendarEvent, CalendarModule, CalendarView } from 'angular-calendar';
import { EMPTY, Subject, takeUntil } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { SiteVisit, SiteVisitCalendarResponse, VisitTypeDropdownItem } from 'app/shared/models/agency/SiteVisit';
import { SiteVisitRequest } from 'app/shared/models/agency/SiteVisitRequest';
import { VisitCalendarService } from 'app/shared/services/visit-calendar.service';
import { AgencyAppointmentEditModalComponent } from '../agency-appointment-edit-modal/agency-appointment-edit-modal.component';
import { AgencyAppointmentEditModalData } from '../agency-appointment-modals-data.interface';
import { AgencyVisitDayModalComponent } from '../agency-visit-day-modal/agency-visit-day-modal.component';
import { VisitCalendarPageData } from '../visit-calendar-page-data.interface';

@Component({
  selector: 'aesan-agency-calendar',
  templateUrl: './agency-calendar.component.html',
  styleUrls: ['./agency-calendar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, TranslocoModule, MatTooltipModule, CalendarModule],
})
export class AgencyCalendarComponent implements OnInit, OnDestroy {
  // -----
  // @ Subject de desuscripción
  // -----
  private _unsubscribeAll = new Subject<any>();

  // -----
  // @ Inyecciones privadas
  // -----
  private _visitCalendarService = inject(VisitCalendarService);
  private _translocoService = inject(TranslocoService);
  private _route = inject(ActivatedRoute);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _snackBar = inject(MatSnackBar);
  private _dialog = inject(MatDialog);
  private _location = inject(Location);

  // -----
  // @ Variables
  // -----
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  agencyId!: number;
  selectedSiteId!: number;
  siteName: string = '';
  agencyName: string = '';
  visitTypes: VisitTypeDropdownItem[] = [];
  visits: SiteVisit[] = [];
  events: CalendarEvent[] = [];

  // -----
  // @ Constructor
  // -----
  constructor() {}

  // -----
  // @ ngOnInit / ngOnDestroy
  // -----
  /** Lee `route.snapshot.data['data']` (resolver) y arranca la carga de visitas, igual que site-calendar. */
  ngOnInit(): void {
    const resolved = this._route.snapshot.data['data'] as VisitCalendarPageData | undefined;
    const siteIdParam = Number(this._route.snapshot.paramMap.get('siteId'));

    if (!resolved || !siteIdParam || resolved.siteId !== siteIdParam) {
      this._snackBar.open(
        this._translocoService.translate('sponsor-evaluation.visitCalendar.errors.invalidRoute'),
        this._translocoService.translate('global.buttons.close'),
        { duration: 4000 }
      );
      this._location.back();
      return;
    }

    if (!resolved.site?.agencyId) {
      this._snackBar.open(
        this._translocoService.translate('sponsor-evaluation.visitCalendar.errors.invalidSiteForAgency'),
        this._translocoService.translate('global.buttons.close'),
        { duration: 5000 }
      );
      this._location.back();
      return;
    }

    this.selectedSiteId = resolved.siteId;
    this.agencyId = resolved.site.agencyId;
    this.siteName = resolved.site.name ?? '';
    this.visitTypes = resolved.visitTypes ?? [];
    this.loadVisits();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // -----
  // @ Funciones On (componentes genéricos / UI)
  // -----
  /** Vista mes: clic en celda del día. */
  onDayClick(event: { day: { date: Date } }): void {
    this._openVisitDayModal(event.day.date);
  }

  /** Vista semana: clic en cabecera del día (angular-calendar no expone `dayClicked` aquí). */
  onWeekDayHeaderClick(event: { day: { date: Date } }): void {
    this._openVisitDayModal(event.day.date);
  }

  /** Vista semana: clic en franja horaria. */
  onWeekHourSegmentClick(event: { date: Date }): void {
    this._openVisitDayModal(this._toCalendarDateOnly(event.date));
  }

  /** Vista día: clic en franja horaria. */
  onDayViewHourSegmentClick(event: { date: Date }): void {
    this._openVisitDayModal(this._toCalendarDateOnly(event.date));
  }

  /** Abre el modal «Visitas del día» (lista + agregar). */
  private _openVisitDayModal(day: Date): void {
    if (!this.visitTypes.length) {
      this._snackBar.open(
        this._translocoService.translate('sponsor-evaluation.visitCalendar.errors.visitTypesNotLoaded'),
        this._translocoService.translate('global.buttons.close'),
        { duration: 4000 }
      );
      return;
    }
    const dayRef = this._toCalendarDateOnly(day);
    this._dialog.open(AgencyVisitDayModalComponent, {
      width: '80%',
      maxWidth: '1200px',
      data: {
        date: dayRef,
        getVisitsForDay: () => this._getVisitsForCalendarDay(dayRef),
        visitTypes: this.visitTypes,
        agencyId: this.agencyId,
        siteId: this.selectedSiteId,
        commitCreateVisit$: (request) => this.commitCreateVisit$(request),
        commitUpdateVisit$: (request) => this.commitUpdateVisit$(request),
        commitDeleteVisit$: (id) => this.commitDeleteVisit$(id),
      },
    });
  }

  /** Normaliza a medianoche local para filtrar visitas por fecha calendario. */
  private _toCalendarDateOnly(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  /** Abre el modal de edición/borrado para el evento seleccionado en el calendario. */
  onEventClick(event: CalendarEvent): void {
    const visit = event.meta?.visit as SiteVisit | undefined;
    if (!visit) return;

    const data: AgencyAppointmentEditModalData = {
      visit,
      agencyId: this.agencyId,
      siteId: this.selectedSiteId,
      visitTypes: this.visitTypes,
      commitSave: (request) => this.commitUpdateVisit$(request),
      commitDelete: () => this.commitDeleteVisit$(visit.id),
    };
    this._dialog.open(AgencyAppointmentEditModalComponent, {
      width: '500px',
      data,
    });
  }

  // -----
  // @ Otras funciones públicas
  // -----
  /** Recarga las visitas del mes visible desde la API. */
  loadVisits(): void {
    this._loadVisits$().pipe(takeUntil(this._unsubscribeAll)).subscribe({
      error: () => {
        this._snackBar.open(
          this._translocoService.translate('sponsor-evaluation.visitCalendar.errors.loadVisits'),
          this._translocoService.translate('global.buttons.close'),
          { duration: 4000 }
        );
      },
    });
  }

  /** Cambia la vista del calendario (mes / semana / día). */
  setView(view: CalendarView): void {
    this.view = view;
  }

  /** Vuelve a la pantalla anterior (evaluación patrocinio). */
  close(): void {
    this._location.back();
  }

  /** Persiste una visita nueva y refresca el calendario; usado por el modal de alta. */
  commitCreateVisit$(request: SiteVisitRequest) {
    return this._visitCalendarService.createVisit(request).pipe(
      switchMap(() => this._loadVisits$()),
      tap(() =>
        this._snackBar.open(
          this._translocoService.translate('sponsor-evaluation.visitCalendar.messages.visitAdded'),
          this._translocoService.translate('global.buttons.close'),
          { duration: 3000 }
        )
      ),
      catchError(() => {
        this._snackBar.open(
          this._translocoService.translate('sponsor-evaluation.visitCalendar.errors.addVisit'),
          this._translocoService.translate('global.buttons.close'),
          { duration: 4000 }
        );
        return EMPTY;
      })
    );
  }

  /** Actualiza una visita y refresca el calendario; usado por el modal de edición. */
  commitUpdateVisit$(request: SiteVisitRequest) {
    return this._visitCalendarService.updateVisit(request).pipe(
      switchMap(() => this._loadVisits$()),
      tap(() =>
        this._snackBar.open(
          this._translocoService.translate('sponsor-evaluation.visitCalendar.messages.visitUpdated'),
          this._translocoService.translate('global.buttons.close'),
          { duration: 3000 }
        )
      ),
      catchError(() => {
        this._snackBar.open(
          this._translocoService.translate('sponsor-evaluation.visitCalendar.errors.updateVisit'),
          this._translocoService.translate('global.buttons.close'),
          { duration: 4000 }
        );
        return EMPTY;
      })
    );
  }

  /** Elimina una visita y refresca el calendario; usado por el modal de edición. */
  commitDeleteVisit$(id: number) {
    return this._visitCalendarService.deleteVisit(id, { agencyId: this.agencyId }).pipe(
      switchMap(() => this._loadVisits$()),
      tap(() =>
        this._snackBar.open(
          this._translocoService.translate('sponsor-evaluation.visitCalendar.messages.visitDeleted'),
          this._translocoService.translate('global.buttons.close'),
          { duration: 3000 }
        )
      ),
      catchError(() => {
        this._snackBar.open(
          this._translocoService.translate('sponsor-evaluation.visitCalendar.errors.deleteVisit'),
          this._translocoService.translate('global.buttons.close'),
          { duration: 4000 }
        );
        return EMPTY;
      })
    );
  }

  // -----
  // @ Funciones privadas
  // -----
  /** Obtiene visitas del mes/año actual y actualiza `events` usando el cuerpo de la respuesta HTTP si aplica. */
  private _loadVisits$() {
    const month = this.viewDate.getMonth() + 1;
    const year = this.viewDate.getFullYear();
    return this._visitCalendarService
      .getSiteVisitsFromDb({
        agencyId: this.agencyId,
        siteId: this.selectedSiteId,
        month,
        year,
      })
      .pipe(
        tap((response: SiteVisitCalendarResponse | HttpResponse<SiteVisitCalendarResponse>) => {
          const data = response instanceof HttpResponse ? response.body : response;
          this.agencyName = data?.agencyName ?? '';
          this.visits = data?.visits ?? [];
          this._mapToCalendarEvents();
          this._changeDetectorRef.markForCheck();
        }),
        map(() => void 0)
      );
  }

  /** Visitas cuya fecha calendario coincide con `d` (mes cargado en API). */
  private _getVisitsForCalendarDay(d: Date): SiteVisit[] {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayNum = String(d.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${dayNum}`;
    return this.visits
      .filter((v) => v.date.split('T')[0] === key)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  /** Construye los `CalendarEvent` a partir de `visits`. */
  private _mapToCalendarEvents(): void {
    this.events = this.visits.map((v) => {
      const [year, month, day] = v.date.split('T')[0].split('-').map(Number);
      const [startH, startM] = v.startTime.split(':').map(Number);
      const [endH, endM] = v.endTime.split(':').map(Number);
      const titleParts = [v.visitTypeNameEs, v.comment].filter(Boolean);
      return {
        id: v.id,
        title: titleParts.length ? titleParts.join(' — ') : v.visitTypeNameEs,
        start: new Date(year, month - 1, day, startH, startM),
        end: new Date(year, month - 1, day, endH, endM),
        color: { primary: '#1e293b', secondary: '#e2e8f0' },
        meta: { visit: v },
      };
    });
  }
}
