import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';
import { SiteOperatingDay } from '../school-calendar.service';

export interface SchoolCalendarAddModalData {
  form: FormGroup;
  operatingDay: SiteOperatingDay;
  schoolId: number;
}

@Component({
  selector: 'app-school-calendar-add-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatTimepickerModule,
    ReactiveFormsModule,
    TranslocoModule
  ],
  templateUrl: './school-calendar-add-modal.component.html',
  styles: []
})
export class SchoolCalendarAddModalComponent {
  constructor(
    public dialogRef: MatDialogRef<SchoolCalendarAddModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SchoolCalendarAddModalData
  ) {}

  getFormattedDate(): string {
    const date = new Date(this.data.operatingDay.OperatingDate);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.data.form.valid) {
      this.dialogRef.close(this.data.form.value);
    }
  }
}
