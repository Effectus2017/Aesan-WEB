import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@ngneat/transloco';
import { SiteCalendarComponent } from 'app/modules/agency-portal/calendar/site-calendar/site-calendar.component';
import { SiteServicesCalendarViewModalData } from './site-services-calendar-view-modal-data.interface';

/**
 * Modal de solo lectura: calendario de días de funcionamiento y servicios del sitio (misma vista que portal agencia).
 */
@Component({
  selector: 'app-site-services-calendar-view-modal',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TranslocoModule,
    SiteCalendarComponent,
  ],
  templateUrl: './site-services-calendar-view-modal.component.html',
})
export class SiteServicesCalendarViewModalComponent {
  // -----
  // @ Constructor
  // -----
  constructor(
    public dialogRef: MatDialogRef<SiteServicesCalendarViewModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SiteServicesCalendarViewModalData,
  ) {}

  // -----
  // @ Funciones públicas
  // -----
  /** Cierra el diálogo. */
  onClose(): void {
    this.dialogRef.close();
  }
}
