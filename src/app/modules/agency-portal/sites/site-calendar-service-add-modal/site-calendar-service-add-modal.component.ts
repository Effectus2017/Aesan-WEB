import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';
import { SiteCalendarServiceAddModalData } from './site-calendar-service-add-modal-data.interface';
import { ServiceTypes } from 'app/shared/constants/service-type.constants';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-site-calendar-service-add-modal',
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
  templateUrl: './site-calendar-service-add-modal.component.html'
})
export class SiteCalendarServiceAddModalComponent {
  timeOptions: { value: string; display: string }[] = [];
  serviceTypes = ServiceTypes;
  currentLanguage: string = 'es';

  constructor(
    public dialogRef: MatDialogRef<SiteCalendarServiceAddModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SiteCalendarServiceAddModalData,
    private translocoService: TranslocoService
  ) {
    this.generateTimeOptions();
    this.currentLanguage = this.translocoService.getActiveLang() || 'es';
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

  getServiceTypeName(serviceTypeId: number): string {
    const serviceType = this.serviceTypes.find(st => st.id === serviceTypeId);
    if (!serviceType) return '';
    return this.currentLanguage === 'es' ? serviceType.name : serviceType.nameEN;
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

