import { CommonModule } from '@angular/common';
import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@ngneat/transloco';
import { Staff } from 'app/shared/models/staff/Staff';

/** Datos del modal de solo lectura de ficha de personal. */
export interface StaffDetailViewModalData {
  staff: Staff;
}

@Component({
  selector: 'app-staff-detail-view-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, TranslocoModule],
  templateUrl: './staff-detail-view-modal.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class StaffDetailViewModalComponent {
  // -----
  // @ Constructor
  // -----
  constructor(
    public dialogRef: MatDialogRef<StaffDetailViewModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StaffDetailViewModalData,
  ) {}

  // -----
  // @ Otras funciones públicas
  // -----
  /** Cierra el diálogo. */
  onClose(): void {
    this.dialogRef.close();
  }

  /** Devuelve el nombre completo a partir de los campos del staff. */
  getFullName(): string {
    const s = this.data.staff;
    return [s.firstName, s.middleName, s.fatherLastName, s.motherLastName].filter(Boolean).join(' ').trim();
  }
}
