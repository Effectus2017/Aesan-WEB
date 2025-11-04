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
import { ServiceTypes, ServiceTypeOption } from 'app/shared/constants/service-type.constants';
import { TranslocoService } from '@ngneat/transloco';
import { PROGRAM_IDS } from 'app/shared/const';

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
  serviceTypes: ServiceTypeOption[] = [];
  filteredServiceTypes: ServiceTypeOption[] = [];
  currentLanguage: string = 'es';
  dayStartTime: string = '';
  dayEndTime: string = '';
  displayDate: Date;

  constructor(
    public dialogRef: MatDialogRef<SiteCalendarServiceAddModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SiteCalendarServiceAddModalData,
    private translocoService: TranslocoService
  ) {
    this.currentLanguage = this.translocoService.getActiveLang() || 'es';
    this.serviceTypes = ServiceTypes;
    this.filterServiceTypes();
    this.initializeTimeConstraints();
    this.generateTimeOptions();
    
    // Normalizar la fecha para evitar problemas de zona horaria
    this.displayDate = this.parseDateSafe(this.data.operatingDay.date);
  }

  private parseDateSafe(dateString: string | Date): Date {
    if (!dateString) {
      return new Date();
    }

    // Si ya es un objeto Date, devolverlo
    if (dateString instanceof Date) {
      return new Date(dateString);
    }

    // Si es un string, parsearlo manualmente
    if (typeof dateString === 'string') {
      // Intentar parsear formato ISO "YYYY-MM-DD" o "YYYY-MM-DDTHH:mm:ss"
      const dateMatch = dateString.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (dateMatch) {
        const year = parseInt(dateMatch[1], 10);
        const month = parseInt(dateMatch[2], 10) - 1; // Los meses en Date son 0-indexed
        const day = parseInt(dateMatch[3], 10);

        // Crear fecha en hora local (medianoche local) para preservar el día
        return new Date(year, month, day, 0, 0, 0, 0);
      }
    }

    // Fallback: usar constructor de Date normal
    return new Date(dateString);
  }

  private filterServiceTypes(): void {
    const programs = this.data.programs || [];
    const isDayCareHome = this.data.isDayCareHome || false;
    
    // Obtener programas desde localStorage si no están en data
    let agencyPrograms: number[] = programs;
    if (!programs || programs.length === 0) {
      const programsJson = localStorage.getItem('agencyPrograms');
      if (programsJson) {
        const parsedPrograms = JSON.parse(programsJson);
        agencyPrograms = parsedPrograms.map((p: any) => p.id);
      }
    }

    const hasPSAV = agencyPrograms.includes(PROGRAM_IDS.PSAV);
    const hasPACNA = agencyPrograms.includes(PROGRAM_IDS.PACNA);
    const hasPDAM = agencyPrograms.includes(PROGRAM_IDS.PDAM);

    // Servicios básicos disponibles para todos los programas
    const basicServices: number[] = [
      1, // Breakfast
      2, // Lunch
      3, // SnackAM
      5  // SnackPM
    ];

    // Servicios específicos de PSAV
    const psavServices: number[] = [
      4,  // Dinner
      6,  // SnackNight
      7,  // DinnerExtended
      8,  // DinnerAtRisk
      9,  // SnackExtended
      10  // SnackAtRisk
    ];

    // Filtrar servicios según programa y day care
    this.filteredServiceTypes = this.serviceTypes.filter(service => {
      // Servicios básicos: disponibles para todos
      if (basicServices.includes(service.id)) {
        return true;
      }

      // Servicios PSAV: solo si tiene PSAV
      if (psavServices.includes(service.id)) {
        return hasPSAV;
      }

      // Por defecto, no mostrar servicios no reconocidos
      return false;
    });

    // Ordenar por displayOrder
    this.filteredServiceTypes.sort((a, b) => a.displayOrder - b.displayOrder);
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
    const serviceType = this.filteredServiceTypes.find(st => st.id === serviceTypeId) || 
                       this.serviceTypes.find(st => st.id === serviceTypeId);
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

