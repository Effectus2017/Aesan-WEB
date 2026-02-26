import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AgencyAppointmentAddModalComponent } from '../agency-appointment-add-modal/agency-appointment-add-modal.component';
import { AgencyAppointmentEditModalComponent } from '../agency-appointment-edit-modal/agency-appointment-edit-modal.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Location } from '@angular/common';
import { CalendarEvent, CalendarModule, CalendarView } from 'angular-calendar';
import { AgencyCalendarService } from '../agency-calendar.service';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { AgencyAppointment } from 'app/shared/models/AgencyAppointment';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'aesan-agency-calendar',
  templateUrl: './agency-calendar.component.html',
  styleUrls: ['./agency-calendar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    TranslocoModule,
    MatTooltipModule,
    CalendarModule
  ]
})
export class AgencyCalendarComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _agencyCalendarService = inject(AgencyCalendarService);
  private _customRouterService = inject(CustomRouterService);
  private _route = inject(ActivatedRoute);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _snackBar = inject(MatSnackBar);
  private _dialog = inject(MatDialog);
  private _location = inject(Location);

  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  
  agencyId: number;
  agencyName: string = '';
  appointments: AgencyAppointment[] = [];
  events: CalendarEvent[] = [];

  ngOnInit(): void {
    this._route.params.pipe(takeUntil(this._unsubscribeAll)).subscribe((params) => {
      this.agencyId = +params['id'];
      if (this.agencyId) {
        this.loadAppointments();
      }
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  loadAppointments(): void {
    const month = this.viewDate.getMonth() + 1;
    const year = this.viewDate.getFullYear();

    this._agencyCalendarService.getAppointments(this.agencyId, month, year)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response) => {
          this.agencyName = response.agencyName;
          this.appointments = response.appointments;
          this.mapToCalendarEvents();
          this._changeDetectorRef.markForCheck();
        },
        error: (error) => {
          this._snackBar.open('Error al cargar las citas', 'Cerrar', { duration: 3000 });
        }
      });
  }

  mapToCalendarEvents(): void {
    this.events = this.appointments.map(app => {
      const [year, month, day] = app.date.split('T')[0].split('-').map(Number);
      const [startH, startM] = app.startTime.split(':').map(Number);
      const [endH, endM] = app.endTime.split(':').map(Number);

      return {
        id: app.id,
        title: app.comment || 'Appointment',
        start: new Date(year, month - 1, day, startH, startM),
        end: new Date(year, month - 1, day, endH, endM),
        color: { primary: '#1e293b', secondary: '#e2e8f0' },
        meta: { appointment: app }
      };
    });
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  close(): void {
    this._location.back();
  }

  onDayClick(event: { day: { date: Date } }): void {
    const dialogRef = this._dialog.open(AgencyAppointmentAddModalComponent, {
      width: '500px',
      data: { agencyId: this.agencyId, date: event.day.date }
    });

    dialogRef.afterClosed().pipe(takeUntil(this._unsubscribeAll)).subscribe((request) => {
      if (request) {
        this._agencyCalendarService.createAppointment(request).pipe(takeUntil(this._unsubscribeAll)).subscribe({
          next: () => {
            this._snackBar.open('Cita agregada exitosamente', 'Cerrar', { duration: 3000 });
            this.loadAppointments();
          },
          error: () => this._snackBar.open('Error al agregar cita', 'Cerrar', { duration: 3000 })
        });
      }
    });
  }

  onEventClick(event: CalendarEvent): void {
    const appointment = event.meta?.appointment;
    if (!appointment) return;

    const dialogRef = this._dialog.open(AgencyAppointmentEditModalComponent, {
      width: '500px',
      data: { appointment }
    });

    dialogRef.afterClosed().pipe(takeUntil(this._unsubscribeAll)).subscribe((result) => {
      if (!result) return;

      if (result.action === 'save') {
        this._agencyCalendarService.updateAppointment(result.request).pipe(takeUntil(this._unsubscribeAll)).subscribe({
          next: () => {
             this._snackBar.open('Cita actualizada exitosamente', 'Cerrar', { duration: 3000 });
             this.loadAppointments();
          },
          error: () => this._snackBar.open('Error al actualizar cita', 'Cerrar', { duration: 3000 })
        });
      } else if (result.action === 'delete') {
         this._agencyCalendarService.deleteAppointment(result.id).pipe(takeUntil(this._unsubscribeAll)).subscribe({
          next: () => {
             this._snackBar.open('Cita eliminada exitosamente', 'Cerrar', { duration: 3000 });
             this.loadAppointments();
          },
          error: () => this._snackBar.open('Error al eliminar cita', 'Cerrar', { duration: 3000 })
        });
      }
    });
  }
}
