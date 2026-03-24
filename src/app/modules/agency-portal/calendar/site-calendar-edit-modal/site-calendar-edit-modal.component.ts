import { ChangeDetectorRef, Component, Inject, OnInit, OnDestroy, inject } from '@angular/core';
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
import { SiteCalendarEditModalData } from 'app/shared/models/response/SiteCalendarEditModalData';
import { SiteOperatingDayService } from 'app/shared/models/site/SiteOperatingDayService';
import { Subject, takeUntil } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { NotificationService } from 'app/shared/services/notification.service';

@Component({
  selector: 'app-school-calendar-edit-modal',
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
  templateUrl: './site-calendar-edit-modal.component.html',
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
export class SiteCalendarEditModalComponent implements OnInit, OnDestroy {
  timeOptions: { value: string; display: string }[] = [];
  conflictingServices: SiteOperatingDayService[] = [];
  timeOutsideSiteRangeError: string | null = null;
  isSubmitting = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private translocoService: TranslocoService = inject(TranslocoService);
  private _cdr = inject(ChangeDetectorRef);

  constructor(
    public dialogRef: MatDialogRef<SiteCalendarEditModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SiteCalendarEditModalData
  ) {
    this.generateTimeOptions();
    this.convertFormValuesTo24h();
  }

  /** Convierte "08:00" o "08:00:00" a minutos desde medianoche. */
  private timeToMinutes(timeStr: string | undefined): number | null {
    if (!timeStr || typeof timeStr !== 'string') return null;
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (!match) return null;
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
    return hours * 60 + minutes;
  }

  private timeValueToMinutes(value: string): number {
    const m = this.timeToMinutes(value);
    return m ?? 0;
  }

  ngOnInit(): void {
    this.setupTimeRangeValidation();
    this.data.form.get('startTime')?.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.checkStartTimeConflict();
        this.timeOutsideSiteRangeError = this.getTimeOutsideSiteRangeError();
      });
    this.data.form.get('endTime')?.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.timeOutsideSiteRangeError = this.getTimeOutsideSiteRangeError();
      });

    this.checkStartTimeConflict();
    this.timeOutsideSiteRangeError = this.getTimeOutsideSiteRangeError();
  }

  private setupTimeRangeValidation(): void {
    this.timeOutsideSiteRangeError = this.getTimeOutsideSiteRangeError();
  }

  getTimeOutsideSiteRangeError(): string | null {
    const siteStart = this.timeToMinutes(this.data.siteOperatingStartTime);
    const siteEnd = this.timeToMinutes(this.data.siteOperatingEndTime);
    if (siteStart == null || siteEnd == null) return null;
    const startVal = this.data.form.get('startTime')?.value;
    const endVal = this.data.form.get('endTime')?.value;
    if (!startVal || !endVal) return null;
    const startMin = this.timeValueToMinutes(startVal);
    const endMin = this.timeValueToMinutes(endVal);
    if (startMin < siteStart || endMin > siteEnd) {
      return this.translocoService.translate('sites.calendar.modals.edit-day.time-outside-site-hours') ?? null;
    }
    return null;
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  private generateTimeOptions(): void {
    const all: { value: string; display: string }[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        all.push({ value: time24, display: this.convert24To12(hour, minute) });
      }
    }
    const siteStart = this.timeToMinutes(this.data.siteOperatingStartTime);
    const siteEnd = this.timeToMinutes(this.data.siteOperatingEndTime);
    if (siteStart != null && siteEnd != null && siteStart <= siteEnd) {
      this.timeOptions = all.filter((opt) => {
        const min = this.timeValueToMinutes(opt.value);
        return min >= siteStart && min <= siteEnd;
      });
    } else {
      this.timeOptions = all;
    }
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
        // Formato 12h, convertir a 24h
        time24 = this.convert12To24(startTime);
      } else if (startTime.includes(':')) {
        // Formato 24h, remover segundos si existen
        time24 = this.removeSeconds(startTime);
      } else {
        // Formato desconocido, usar por defecto
        time24 = '08:00';
      }

      this.data.form.get('startTime')?.setValue(time24);
    }

    // Convertir endTime de 12h a 24h si es necesario
    const endTime = this.data.form.get('endTime')?.value;
    if (endTime && typeof endTime === 'string') {
      let time24: string;

      if (endTime.includes('AM') || endTime.includes('PM')) {
        // Formato 12h, convertir a 24h
        time24 = this.convert12To24(endTime);
      } else if (endTime.includes(':')) {
        // Formato 24h, remover segundos si existen
        time24 = this.removeSeconds(endTime);
      } else {
        // Formato desconocido, usar por defecto
        time24 = '18:00';
      }

      this.data.form.get('endTime')?.setValue(time24);
    }
  }

  private convert12To24(time12: string): string {

    // Parsear formato 12h (ej: "8:00 AM", "4:30 PM")
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
    // Remover segundos de formato HH:mm:ss -> HH:mm
    const match = timeString.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (match) {
      return `${match[1].padStart(2, '0')}:${match[2]}`;
    }
    return timeString;
  }

  getFormattedDate(): string {
    // Usar parseDateSafe para evitar problemas de zona horaria
    const date = this.parseDateSafe(this.data.operatingDay.date);
    const currentLang = this.translocoService.getActiveLang() || 'es';
    const locale = currentLang === 'es' ? 'es-ES' : 'en-US';
    return date.toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private parseDateSafe(dateString: string | Date | undefined): Date {
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

  onCancel(): void {
    this.dialogRef.close();
  }

  /**
   * Convierte una hora en formato HH:mm a minutos totales para comparación
   */
  private convertTimeToMinutes(timeString: string): number {
    if (!timeString) return 0;

    // Normalizar formato: remover segundos y espacios
    let normalizedTime = timeString.trim();

    // Si tiene formato 12h (AM/PM), convertir a 24h primero
    if (normalizedTime.includes('AM') || normalizedTime.includes('PM')) {
      normalizedTime = this.convert12To24(normalizedTime);
    }

    // Remover segundos si existen
    normalizedTime = this.removeSeconds(normalizedTime);

    // Parsear HH:mm
    const match = normalizedTime.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return 0;

    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);

    return hours * 60 + minutes;
  }

  /**
   * Verifica si hay conflicto entre la hora de inicio del día y los servicios
   * Conflicto ocurre cuando algún servicio habilitado empieza ANTES que el día
   * El día debe empezar ANTES o IGUAL que todos los servicios (el día no puede empezar después de un servicio)
   */
  hasStartTimeConflict(): boolean {
    const startTime = this.data.form.get('startTime')?.value;
    if (!startTime) return false;

    const dayStartMinutes = this.convertTimeToMinutes(startTime);
    const services = this.data.operatingDay.services || [];

    // Filtrar solo servicios habilitados
    const enabledServices = services.filter(service => service.isEnabled === true);

    // Verificar si algún servicio empieza ANTES que el día (esto causa conflicto)
    return enabledServices.some(service => {
      if (!service.startTime) return false;
      const serviceStartMinutes = this.convertTimeToMinutes(service.startTime);
      // Conflicto si el servicio empieza antes que el día
      return serviceStartMinutes < dayStartMinutes;
    });
  }

  /**
   * Obtiene los servicios que causan conflicto
   * Un servicio causa conflicto si su hora de inicio es menor que la hora de inicio del día
   * (es decir, servicios que empiezan antes que el día, lo cual no está permitido)
   */
  getConflictingServices(): SiteOperatingDayService[] {
    const startTime = this.data.form.get('startTime')?.value;
    if (!startTime) return [];

    const dayStartMinutes = this.convertTimeToMinutes(startTime);
    const services = this.data.operatingDay.services || [];

    // Filtrar solo servicios habilitados cuya hora de inicio es menor que la hora de inicio del día
    // Estos son los servicios que empiezan antes que el día, lo cual causa conflicto
    return services.filter(service => {
      if (!service.isEnabled || !service.startTime) return false;
      const serviceStartMinutes = this.convertTimeToMinutes(service.startTime);
      return serviceStartMinutes < dayStartMinutes;
    });
  }

  /**
   * Verifica y actualiza el estado de conflictos
   */
  private checkStartTimeConflict(): void {
    this.conflictingServices = this.getConflictingServices();
  }

  /**
   * Verifica si el formulario es válido (incluyendo validación de conflictos y rango del sitio)
   */
  isFormValid(): boolean {
    if (!this.data.form.valid) return false;
    if (this.hasStartTimeConflict()) return false;
    if (this.timeOutsideSiteRangeError) return false;
    return true;
  }

  /**
   * Formatea la hora de un servicio para mostrar
   */
  formatServiceTime(timeString: string): string {
    if (!timeString) return '';

    // Normalizar formato
    let normalizedTime = timeString.trim();

    // Si tiene formato 12h, mantenerlo
    if (normalizedTime.includes('AM') || normalizedTime.includes('PM')) {
      return normalizedTime;
    }

    // Si es formato 24h, convertir a 12h
    const match = normalizedTime.match(/^(\d{1,2}):(\d{2})/);
    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = match[2];
      return this.convert24To12(hours, parseInt(minutes, 10));
    }

    return timeString;
  }

  /**
   * Obtiene el nombre del servicio según el idioma
   */
  getServiceName(service: SiteOperatingDayService): string {
    // Por ahora, usar serviceTypeName (en español) como predeterminado
    // En el futuro se puede agregar detección de idioma
    return service.serviceTypeName || service.serviceTypeNameEN || 'Servicio';
  }

  onSave(): void {
    if (this.hasStartTimeConflict() || this.isSubmitting) return;
    this.timeOutsideSiteRangeError = this.getTimeOutsideSiteRangeError();
    if (this.timeOutsideSiteRangeError) return;
    if (!this.data.form.valid) return;
    const formValue = this.data.form.value as Record<string, unknown>;
    if (this.data.commitSave) {
      this.isSubmitting = true;
      this.data.commitSave(formValue)
        .pipe(
          finalize(() => {
            this.isSubmitting = false;
            this._cdr.markForCheck();
          })
        )
        .subscribe({
          next: () => this.dialogRef.close(formValue),
          error: () => {}
        });
      return;
    }
    this.dialogRef.close(this.data.form.value);
  }

  private _notificationService = inject(NotificationService);

  onDelete(): void {
    this._notificationService.showConfirmationDialogWithCallback({
      message: '¿Estás seguro de que quieres eliminar este horario?',
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

}
