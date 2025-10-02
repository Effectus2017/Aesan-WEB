import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';
import { SchoolOperatingDay } from '../school-calendar.service';

export interface SchoolCalendarAddModalData {
  form: FormGroup;
  operatingDay?: SchoolOperatingDay;
  date?: Date;
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
    ReactiveFormsModule,
    TranslocoModule
  ],
  templateUrl: './school-calendar-add-modal.component.html',
  styles: [`
    .time-picker-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .time-picker-label {
      font-size: 12px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.6);
      margin-bottom: 4px;
    }

    .dark .time-picker-label {
      color: rgba(255, 255, 255, 0.6);
    }

    .error-message {
      font-size: 12px;
      color: #f44336;
      margin-top: 4px;
    }
  `]
})
export class SchoolCalendarAddModalComponent {
  timeOptions: { value: string; display: string }[] = [];

  constructor(
    public dialogRef: MatDialogRef<SchoolCalendarAddModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SchoolCalendarAddModalData
  ) {
    this.generateTimeOptions();
  }

  private generateTimeOptions(): void {
    const options: { value: string; display: string }[] = [];

    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const time12 = this.convert24To12(hour, minute);
        options.push({
          value: time24,
          display: time12
        });
      }
    }

    this.timeOptions = options;
  }

  private convert24To12(hour: number, minute: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const minuteStr = minute.toString().padStart(2, '0');
    return `${displayHour}:${minuteStr} ${period}`;
  }

  getFormattedDate(): string {
    const date = this.data.operatingDay?.operatingDate ?
      new Date(this.data.operatingDay.operatingDate) :
      this.data.date || new Date();
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
