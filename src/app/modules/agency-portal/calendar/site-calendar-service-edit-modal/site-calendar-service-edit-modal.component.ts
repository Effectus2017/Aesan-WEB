import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { SiteCalendarServiceEditModalData } from './site-calendar-service-edit-modal-data.interface';
import { 
  generateTimeOptions, 
  filterEndTimeOptions, 
  normalizeTime, 
  timeToMinutes,
  TimeOption
} from 'app/shared/utils';
import { NotificationService } from 'app/shared/services/notification.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-site-calendar-service-edit-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    ReactiveFormsModule,
    TranslocoModule
  ],
  templateUrl: './site-calendar-service-edit-modal.component.html',
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
export class SiteCalendarServiceEditModalComponent {
  timeOptions: TimeOption[] = [];
  startTimeOptions: TimeOption[] = [];
  endTimeOptions: TimeOption[] = [];
  dayStartTime: string = '';
  dayEndTime: string = '';
  isSubmitting = false;

  constructor(
    public dialogRef: MatDialogRef<SiteCalendarServiceEditModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SiteCalendarServiceEditModalData,
    private translocoService: TranslocoService,
    private notificationService: NotificationService,
    private _cdr: ChangeDetectorRef
  ) {
    console.log('Service edit modal constructor - data:', this.data);
    this.initializeTimeConstraints();
    this.generateTimeOptions();
    this.convertFormValuesTo24h();
    
    // Si el día es feriado, deshabilitar todos los campos
    if (this.isHolidayDay()) {
      this.data.form.disable();
    }
    
    // Suscribirse a cambios en startTime para actualizar las opciones de endTime
    this.data.form.get('startTime')?.valueChanges.subscribe(() => {
      this.updateEndTimeOptions();
    });
  }

  // ... (rest of the methods) ...

  onDelete(): void {
    const confirmMessage = this.translocoService.translate('sites.calendar.day-events.confirm-delete-service');
    
    this.notificationService.showConfirmationDialogWithCallback({
      message: confirmMessage,
      icon: {
        show: true,
        name: 'heroicons_outline:trash',
        color: 'warn'
      },
      actions: {
        confirm: {
          label: 'users.list.actions.delete',
          color: 'warn'
        }
      }
    }, (result) => {
      if (result !== 'confirmed' || this.isSubmitting) return;
      if (this.data.commitDelete) {
        this.isSubmitting = true;
        this.data
          .commitDelete()
          .pipe(
            finalize(() => {
              this.isSubmitting = false;
              this._cdr.markForCheck();
            })
          )
          .subscribe({
            next: () => this.dialogRef.close({ action: 'delete' }),
            error: () => {}
          });
        return;
      }
      this.dialogRef.close({ action: 'delete' });
    });
  }

  isHolidayDay(): boolean {
    return this.data.operatingDay?.isHoliday === true;
  }

  private initializeTimeConstraints(): void {
    // Obtener los horarios del día de funcionamiento
    // Prioridad: 1) operatingStartTime/operatingEndTime del sitio (si están disponibles), 2) operatingDay pasado al modal, 3) dayStartTime/dayEndTime del servicio, 4) valores por defecto
    if (this.data.operatingStartTime && this.data.operatingEndTime) {
      // Usar las horas de funcionamiento del sitio como límites principales
      this.dayStartTime = this.data.operatingStartTime;
      this.dayEndTime = this.data.operatingEndTime;
    } else if (this.data.operatingDay) {
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
    this.dayStartTime = normalizeTime(this.dayStartTime);
    this.dayEndTime = normalizeTime(this.dayEndTime);
  }

  private generateTimeOptions(): void {
    this.timeOptions = generateTimeOptions(this.dayStartTime, this.dayEndTime);
    this.startTimeOptions = this.timeOptions;
    // Para endTime, solo mostrar opciones mayores o iguales a la hora de inicio seleccionada
    this.updateEndTimeOptions();
  }

  private updateEndTimeOptions(): void {
    const selectedStartTime = this.data.form.get('startTime')?.value;
    
    // Usar operatingStartTime y operatingEndTime del sitio si están disponibles
    const operatingStartTime = this.data.operatingStartTime || null;
    const operatingEndTime = this.data.operatingEndTime || null;
    this.endTimeOptions = filterEndTimeOptions(this.timeOptions, selectedStartTime, this.dayEndTime, operatingStartTime, operatingEndTime);

    // Validar y ajustar endTime si es necesario
    const currentEndTime = this.data.form.get('endTime')?.value;
    if (currentEndTime && selectedStartTime) {
      const endMinutes = timeToMinutes(currentEndTime);
      const startMinutes = timeToMinutes(selectedStartTime);
      // Si endTime es menor o igual a startTime, resetearlo a la primera opción válida
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

  isFormValid(): boolean {
    // No permitir guardar si es día feriado
    if (this.isHolidayDay()) {
      return false;
    }
    
    const startTime = this.data.form.get('startTime')?.value;
    const endTime = this.data.form.get('endTime')?.value;
    
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
        time24 = '18:00';
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
    // No permitir guardar si es día feriado
    if (this.isHolidayDay()) {
      return;
    }
    if (!this.data.form.valid || this.isEndTimeInvalid() || this.isSubmitting) {
      return;
    }
    const formValue = this.data.form.value as Record<string, unknown>;
    if (this.data.commitSave) {
      this.isSubmitting = true;
      this.data.commitSave(formValue).pipe(
        finalize(() => {
          this.isSubmitting = false;
          this._cdr.markForCheck();
        })
      ).subscribe({
        next: () => this.dialogRef.close({ ...formValue, serviceTypeId: this.data.service.serviceTypeId }),
        error: () => {}
      });
      return;
    }
    this.dialogRef.close(this.data.form.value);
  }


}
