import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { SiteCalendarServiceEditModalData } from './site-calendar-service-edit-modal-data.interface';

@Component({
  selector: 'app-site-calendar-service-edit-modal',
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
  templateUrl: './site-calendar-service-edit-modal.component.html'
})
export class SiteCalendarServiceEditModalComponent {
  timeOptions: { value: string; display: string }[] = [];
  startTimeOptions: { value: string; display: string }[] = [];
  endTimeOptions: { value: string; display: string }[] = [];
  dayStartTime: string = '';
  dayEndTime: string = '';

  constructor(
    public dialogRef: MatDialogRef<SiteCalendarServiceEditModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SiteCalendarServiceEditModalData,
    private translocoService: TranslocoService
  ) {
    console.log('Service edit modal constructor - data:', this.data);
    this.initializeTimeConstraints();
    this.generateTimeOptions();
    this.convertFormValuesTo24h();
    
    // Suscribirse a cambios en startTime para actualizar las opciones de endTime
    this.data.form.get('startTime')?.valueChanges.subscribe(() => {
      this.updateEndTimeOptions();
    });
  }

  private initializeTimeConstraints(): void {
    // Obtener los horarios del día de funcionamiento
    // Prioridad: 1) operatingDay pasado al modal, 2) dayStartTime/dayEndTime del servicio, 3) valores por defecto
    if (this.data.operatingDay) {
      this.dayStartTime = this.data.operatingDay.startTime || '00:00';
      this.dayEndTime = this.data.operatingDay.endTime || '23:59';
    } else if (this.data.service.dayStartTime && this.data.service.dayEndTime) {
      this.dayStartTime = this.data.service.dayStartTime;
      this.dayEndTime = this.data.service.dayEndTime;
    } else {
      // Si no hay información del día, usar un rango amplio como fallback
      this.dayStartTime = '00:00';
      this.dayEndTime = '23:59';
    }
    
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

  private convertFormValuesTo24h(): void {
    // Convertir startTime de 12h a 24h si es necesario
    const startTime = this.data.form.get('startTime')?.value;
    if (startTime && typeof startTime === 'string') {
      let time24: string;

      if (startTime.includes('AM') || startTime.includes('PM')) {
        time24 = this.convert12To24(startTime);
      } else if (startTime.includes(':')) {
        time24 = this.removeSeconds(startTime);
      } else {
        time24 = '08:00';
      }

      this.data.form.get('startTime')?.setValue(time24);
    }

    // Convertir endTime de 12h a 24h si es necesario
    const endTime = this.data.form.get('endTime')?.value;
    if (endTime && typeof endTime === 'string') {
      let time24: string;

      if (endTime.includes('AM') || endTime.includes('PM')) {
        time24 = this.convert12To24(endTime);
      } else if (endTime.includes(':')) {
        time24 = this.removeSeconds(endTime);
      } else {
        time24 = '16:00';
      }

      this.data.form.get('endTime')?.setValue(time24);
    }
    
    // Actualizar las opciones de endTime después de convertir los valores
    setTimeout(() => {
      this.updateEndTimeOptions();
    }, 0);
  }

  private convert12To24(time12: string): string {
    const match = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) {
      return time12;
    }

    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();

    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  private removeSeconds(timeString: string): string {
    const match = timeString.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (match) {
      return `${match[1].padStart(2, '0')}:${match[2]}`;
    }
    return timeString;
  }

  getServiceName(): string {
    const currentLang = this.translocoService.getActiveLang() || 'es';
    const serviceName = currentLang === 'es' 
      ? (this.data.service.serviceTypeName || this.translocoService.translate('sites.calendar.day-events.service-fallback'))
      : (this.data.service.serviceTypeNameEN || this.translocoService.translate('sites.calendar.day-events.service-fallback'));
    const groupName = this.data.service.childGroupName ? ` (${this.data.service.childGroupName})` : '';
    return `${serviceName}${groupName}`;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.data.form.valid) {
      this.dialogRef.close(this.data.form.value);
    }
  }

  onDelete(): void {
    const confirmMessage = this.translocoService.translate('sites.calendar.day-events.confirm-delete-service');
    if (confirm(confirmMessage)) {
      this.dialogRef.close({ action: 'delete' });
    }
  }
}
