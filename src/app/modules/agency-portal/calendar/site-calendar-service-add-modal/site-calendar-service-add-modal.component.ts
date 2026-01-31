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
import { 
  generateTimeOptions, 
  filterEndTimeOptions, 
  normalizeTime, 
  timeToMinutes,
  TimeOption
} from 'app/shared/utils';

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
  templateUrl: './site-calendar-service-add-modal.component.html',
  styles: [`
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .animate-slide-in {
      animation: fadeIn 1.0s ease-out;
    }
  `]
})
export class SiteCalendarServiceAddModalComponent {
  timeOptions: TimeOption[] = [];
  startTimeOptions: TimeOption[] = [];
  endTimeOptions: TimeOption[] = [];
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
    // Prioridad: 1) operatingStartTime/operatingEndTime del sitio (si están disponibles), 2) operatingDay.startTime/endTime, 3) valores por defecto
    if (this.data.operatingStartTime && this.data.operatingEndTime) {
      // Usar las horas de funcionamiento del sitio como límites principales
      this.dayStartTime = this.data.operatingStartTime;
      this.dayEndTime = this.data.operatingEndTime;
    } else {
      // Fallback a las horas del día específico
      this.dayStartTime = this.data.operatingDay.startTime || '00:00';
      this.dayEndTime = this.data.operatingDay.endTime || '23:59';
    }
    
    // Normalizar formato (remover segundos si existen)
    this.dayStartTime = normalizeTime(this.dayStartTime);
    this.dayEndTime = normalizeTime(this.dayEndTime);
  }

  private generateTimeOptions(): void {
    this.timeOptions = generateTimeOptions(this.dayStartTime, this.dayEndTime);
    this.startTimeOptions = this.timeOptions;
    // Para endTime, solo mostrar opciones mayores o iguales a la hora de inicio seleccionada
    this.updateEndTimeOptions();
    
    // Suscribirse a cambios en startTime para actualizar las opciones de endTime
    this.data.form.get('startTime')?.valueChanges.subscribe(() => {
      this.updateEndTimeOptions();
    });
  }

  private updateEndTimeOptions(): void {
    const selectedStartTime = this.data.form.get('startTime')?.value;
    
    // Usar operatingStartTime y operatingEndTime del sitio si están disponibles
    const operatingStartTime = this.data.operatingStartTime || null;
    const operatingEndTime = this.data.operatingEndTime || null;
    this.endTimeOptions = filterEndTimeOptions(this.timeOptions, selectedStartTime, this.dayEndTime, operatingStartTime, operatingEndTime);

    // Si no hay hora de inicio seleccionada, no hacer nada
    if (!selectedStartTime) {
      return;
    }

    const currentEndTime = this.data.form.get('endTime')?.value;
    
    // Si no hay hora de fin seleccionada, asignar automáticamente la primera opción válida
    if (!currentEndTime) {
      if (this.endTimeOptions.length > 0) {
        // Establecer la primera opción válida (la más cercana después de startTime)
        this.data.form.get('endTime')?.setValue(this.endTimeOptions[0].value, { emitEvent: false });
      }
      return;
    }

    // Si hay hora de fin pero es inválida (menor o igual a startTime), ajustarla automáticamente
    const endMinutes = timeToMinutes(currentEndTime);
    const startMinutes = timeToMinutes(selectedStartTime);
    
    if (endMinutes <= startMinutes) {
      if (this.endTimeOptions.length > 0) {
        // Establecer la primera opción válida (la más cercana después de startTime)
        this.data.form.get('endTime')?.setValue(this.endTimeOptions[0].value, { emitEvent: false });
      } else {
        // Si no hay opciones válidas, limpiar el valor
        this.data.form.get('endTime')?.setValue('', { emitEvent: false });
      }
    }
  }

  isEndTimeInvalid(): boolean {
    const startTime = this.data.form.get('startTime')?.value;
    const endTime = this.data.form.get('endTime')?.value;
    
    if (!startTime || !endTime) {
      return false;
    }
    
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    
    return endMinutes <= startMinutes;
  }

  /** Grupos del sitio para el selector (childGroupId obligatorio) */
  get childGroups(): { id: number; groupName: string; groupNameEN?: string }[] {
    return this.data.childGroups ?? [];
  }

  isFormValid(): boolean {
    const childGroupId = this.data.form.get('childGroupId')?.value;
    const startTime = this.data.form.get('startTime')?.value;
    const endTime = this.data.form.get('endTime')?.value;
    
    // childGroupId es obligatorio: los servicios siempre están asociados a un grupo
    if (childGroupId === null || childGroupId === undefined || childGroupId === '') {
      return false;
    }
    
    // Verificar que startTime tenga un valor válido
    if (!startTime || startTime === '' || startTime === null || startTime === undefined) {
      return false;
    }
    
    // Verificar que endTime tenga un valor válido
    if (!endTime || endTime === '' || endTime === null || endTime === undefined) {
      return false;
    }
    
    // Verificar que el formulario sea válido
    if (!this.data.form.valid) {
      return false;
    }
    
    // Verificar que endTime no sea inválido (debe ser mayor que startTime)
    if (this.isEndTimeInvalid()) {
      return false;
    }
    
    return true;
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
    if (this.data.form.valid && !this.isEndTimeInvalid()) {
      this.dialogRef.close(this.data.form.value);
    }
  }
}

