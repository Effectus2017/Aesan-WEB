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
  startTimeOptions: { value: string; display: string }[] = [];
  endTimeOptions: { value: string; display: string }[] = [];
  serviceTypes = ServiceTypes;
  currentLanguage: string = 'es';
  dayStartTime: string = '';
  dayEndTime: string = '';

  constructor(
    public dialogRef: MatDialogRef<SiteCalendarServiceAddModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SiteCalendarServiceAddModalData,
    private translocoService: TranslocoService
  ) {
    this.currentLanguage = this.translocoService.getActiveLang() || 'es';
    this.initializeTimeConstraints();
    this.generateTimeOptions();
  }

  private initializeTimeConstraints(): void {
    // Obtener los horarios del día de funcionamiento
    this.dayStartTime = this.data.operatingDay.startTime || '00:00';
    this.dayEndTime = this.data.operatingDay.endTime || '23:59';
    
    // Normalizar formato (remover segundos si existen)
    this.dayStartTime = this.normalizeTime(this.dayStartTime);
    this.dayEndTime = this.normalizeTime(this.dayEndTime);
  }

  private normalizeTime(time: string): string {
    if (!time) return '00:00';
    // Si tiene formato HH:mm:ss, remover los segundos
    const parts = time.split(':');
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
    return time;
  }

  private timeToMinutes(time: string): number {
    const parts = time.split(':');
    if (parts.length < 2) return 0;
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    return hours * 60 + minutes;
  }

  private generateTimeOptions(): void {
    const allOptions: { value: string; display: string }[] = [];
    const dayStartMinutes = this.timeToMinutes(this.dayStartTime);
    const dayEndMinutes = this.timeToMinutes(this.dayEndTime);

    // Generar todas las opciones de tiempo (cada 30 minutos)
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const time12 = this.convert24To12(hour, minute);
        const timeMinutes = hour * 60 + minute;
        
        // Solo incluir horarios dentro del rango del día de funcionamiento
        if (timeMinutes >= dayStartMinutes && timeMinutes <= dayEndMinutes) {
          allOptions.push({
            value: time24,
            display: time12
          });
        }
      }
    }

    this.timeOptions = allOptions;
    this.startTimeOptions = allOptions;
    // Para endTime, solo mostrar opciones mayores o iguales a la hora de inicio seleccionada
    this.updateEndTimeOptions();
    
    // Suscribirse a cambios en startTime para actualizar las opciones de endTime
    this.data.form.get('startTime')?.valueChanges.subscribe(() => {
      this.updateEndTimeOptions();
    });
  }

  private updateEndTimeOptions(): void {
    const selectedStartTime = this.data.form.get('startTime')?.value;
    if (!selectedStartTime) {
      this.endTimeOptions = this.timeOptions;
      return;
    }

    const startMinutes = this.timeToMinutes(selectedStartTime);
    const dayEndMinutes = this.timeToMinutes(this.dayEndTime);

    this.endTimeOptions = this.timeOptions.filter(option => {
      const optionMinutes = this.timeToMinutes(option.value);
      return optionMinutes > startMinutes && optionMinutes <= dayEndMinutes;
    });
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

