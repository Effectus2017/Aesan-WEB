import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { TranslocoModule } from '@ngneat/transloco';
import { AgencyAppointmentRequest } from 'app/shared/models/agency/AgencyAppointmentRequest';

@Component({
  selector: 'aesan-agency-appointment-add-modal',
  templateUrl: './agency-appointment-add-modal.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatIconModule,
    MatSelectModule,
    TranslocoModule
  ]
})
export class AgencyAppointmentAddModalComponent implements OnInit {
  form: FormGroup;
  agencyId: number;
  date: Date;
  timeOptions: { value: string; display: string }[] = [];

  constructor(
    private _fb: FormBuilder,
    private _dialogRef: MatDialogRef<AgencyAppointmentAddModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { agencyId: number, date: Date }
  ) {
    this.agencyId = data.agencyId;
    this.date = data.date;
  }

  ngOnInit(): void {
    this.form = this._fb.group({
      startTime: ['', [Validators.required, Validators.pattern('^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')]],
      endTime: ['', [Validators.required, Validators.pattern('^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')]],
      comment: ['']
    });
    this.generateTimeOptions();
  }

  private generateTimeOptions(): void {
    const all: { value: string; display: string }[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        all.push({ value: time24, display: this.convert24To12(hour, minute) });
      }
    }
    this.timeOptions = all;
  }

  private convert24To12(hour: number, minute: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const minuteStr = minute.toString().padStart(2, '0');
    return `${displayHour}:${minuteStr} ${period}`;
  }

  getFormattedDate(): string {
    if (!this.date) return '';
    return this.date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  onSave(): void {
    if (this.form.invalid) {
      return;
    }

    const value = this.form.value;

    // Format Date to YYYY-MM-DD using local time
    // Get month and day carefully matching local time.
    const year = this.date.getFullYear();
    const month = String(this.date.getMonth() + 1).padStart(2, '0');
    const day = String(this.date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const request: AgencyAppointmentRequest = {
      agencyId: this.agencyId,
      appointmentDate: dateStr,
      startTime: value.startTime + ':00', // API expects timespan
      endTime: value.endTime + ':00',
      comment: value.comment
    };

    this._dialogRef.close(request);
  }

  onClose(): void {
    this._dialogRef.close(null);
  }
}
