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
import { AgencyAppointmentRequest } from 'app/shared/models/Request/AgencyAppointmentRequest';
import { AgencyAppointment } from 'app/shared/models/AgencyAppointment';

@Component({
  selector: 'aesan-agency-appointment-edit-modal',
  templateUrl: './agency-appointment-edit-modal.component.html',
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
export class AgencyAppointmentEditModalComponent implements OnInit {
  form: FormGroup;
  appointment: AgencyAppointment;
  date: Date;
  timeOptions: { value: string; display: string }[] = [];

  constructor(
    private _fb: FormBuilder,
    private _dialogRef: MatDialogRef<AgencyAppointmentEditModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { appointment: AgencyAppointment }
  ) {
    this.appointment = data.appointment;
    
    // Parse date for Title
    const [year, month, day] = this.appointment.date.split('T')[0].split('-').map(Number);
    this.date = new Date(year, month - 1, day);
  }

  ngOnInit(): void {
    // Format start/endTime for Time Input HH:mm
    const startTimeFormat = this.appointment.startTime.substring(0, 5);
    const endTimeFormat = this.appointment.endTime.substring(0, 5);

    this.form = this._fb.group({
      startTime: [startTimeFormat, [Validators.required, Validators.pattern('^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')]],
      endTime: [endTimeFormat, [Validators.required, Validators.pattern('^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')]],
      comment: [this.appointment.comment || '']
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
    
    const year = this.date.getFullYear();
    const month = String(this.date.getMonth() + 1).padStart(2, '0');
    const day = String(this.date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const request: AgencyAppointmentRequest = {
      id: this.appointment.id,
      agencyId: this.appointment.agencyId,
      appointmentDate: dateStr,
      startTime: value.startTime + ':00',
      endTime: value.endTime + ':00',
      comment: value.comment
    };

    this._dialogRef.close({ action: 'save', request });
  }

  onDelete(): void {
    this._dialogRef.close({ action: 'delete', id: this.appointment.id });
  }

  onClose(): void {
    this._dialogRef.close(null);
  }
}
