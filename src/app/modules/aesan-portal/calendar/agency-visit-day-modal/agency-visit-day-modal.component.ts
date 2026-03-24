import { CommonModule } from '@angular/common';
import { Component, Inject, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@ngneat/transloco';
import { SiteVisit } from 'app/shared/models/agency/SiteVisit';
import { AgencyAppointmentAddModalComponent } from '../agency-appointment-add-modal/agency-appointment-add-modal.component';
import { AgencyAppointmentEditModalComponent } from '../agency-appointment-edit-modal/agency-appointment-edit-modal.component';
import { AgencyAppointmentAddModalData, AgencyAppointmentEditModalData } from '../agency-appointment-modals-data.interface';
import { AgencyVisitDayModalData } from './agency-visit-day-modal-data.interface';

@Component({
  selector: 'aesan-agency-visit-day-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatCardModule, TranslocoModule],
  templateUrl: './agency-visit-day-modal.component.html',
  styles: [
    `
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      .animate-slide-in {
        animation: fadeIn 0.35s ease-out;
      }
      .day-visit-edit-icon {
        color: var(--fuse-primary) !important;
      }
    `,
  ],
})
export class AgencyVisitDayModalComponent implements OnInit {
  // -----
  // @ Inyecciones privadas
  // -----
  private _dialog = inject(MatDialog);

  // -----
  // @ Variables
  // -----
  visitsForDay: SiteVisit[] = [];

  // -----
  // @ Constructor
  // -----
  constructor(
    public dialogRef: MatDialogRef<AgencyVisitDayModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AgencyVisitDayModalData
  ) {}

  // -----
  // @ ngOnInit / ngOnDestroy
  // -----
  ngOnInit(): void {
    this._refreshVisitsList();
  }

  // -----
  // @ Otras funciones públicas
  // -----
  /** Convierte hora API (HH:mm:ss) a formato 12 h para la tabla. */
  formatTimeForDisplay(time: string): string {
    const part = (time ?? '00:00:00').substring(0, 5);
    const [hStr, mStr] = part.split(':');
    const hour = parseInt(hStr, 10);
    const minute = parseInt(mStr, 10);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return time ?? '';
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  }

  /** Abre el modal de alta para la fecha de este listado. */
  onAddVisit(): void {
    const addData: AgencyAppointmentAddModalData = {
      agencyId: this.data.agencyId,
      siteId: this.data.siteId,
      visitTypes: this.data.visitTypes,
      date: this.data.date,
      commitSave: (request) => this.data.commitCreateVisit$(request),
    };
    const ref = this._dialog.open(AgencyAppointmentAddModalComponent, {
      width: '500px',
      data: addData,
    });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this._refreshVisitsList();
      }
    });
  }

  /** Abre el modal de edición para una fila. */
  onEditVisit(visit: SiteVisit): void {
    const editData: AgencyAppointmentEditModalData = {
      visit,
      agencyId: this.data.agencyId,
      siteId: this.data.siteId,
      visitTypes: this.data.visitTypes,
      commitSave: (request) => this.data.commitUpdateVisit$(request),
      commitDelete: () => this.data.commitDeleteVisit$(visit.id),
    };
    const ref = this._dialog.open(AgencyAppointmentEditModalComponent, {
      width: '500px',
      data: editData,
    });
    ref.afterClosed().subscribe((result) => {
      if (result?.action === 'save' || result?.action === 'delete') {
        this._refreshVisitsList();
      }
    });
  }

  // -----
  // @ Funciones privadas
  // -----
  /** Sincroniza filas con el padre (tras crear/editar/borrar). */
  private _refreshVisitsList(): void {
    this.visitsForDay = this.data.getVisitsForDay();
  }
}
