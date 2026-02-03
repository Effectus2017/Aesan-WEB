import { Component, Inject, inject } from '@angular/core';
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
import { SiteCalendarAddModalData } from 'app/shared/models/Response/SiteCalendarAddModalData';

@Component({
  selector: 'app-site-calendar-add-modal',
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
  templateUrl: './site-calendar-add-modal.component.html',
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
export class SiteCalendarAddModalComponent {
  timeOptions: { value: string; display: string }[] = [];
  timeOutsideSiteRangeError: string | null = null;
  private translocoService: TranslocoService = inject(TranslocoService);

  constructor(
    public dialogRef: MatDialogRef<SiteCalendarAddModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SiteCalendarAddModalData
  ) {
    this.generateTimeOptions();
    this.setupTimeRangeValidation();
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

  /** Convierte "HH:mm" a minutos desde medianoche. */
  private timeValueToMinutes(value: string): number {
    const m = this.timeToMinutes(value);
    return m ?? 0;
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

  private setupTimeRangeValidation(): void {
    const startCtrl = this.data.form.get('startTime');
    const endCtrl = this.data.form.get('endTime');
    const check = () => {
      this.timeOutsideSiteRangeError = this.getTimeOutsideSiteRangeError();
    };
    startCtrl?.valueChanges?.subscribe(() => check());
    endCtrl?.valueChanges?.subscribe(() => check());
    check();
  }

  /** Retorna mensaje de error si las horas están fuera del rango del sitio; null si son válidas. */
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
      return this.translocoService.translate('sites.calendar.modals.add-day.time-outside-site-hours') ?? null;
    }
    if (endMin <= startMin) return null; // ese error lo muestra otro validador
    return null;
  }

  private convert24To12(hour: number, minute: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const minuteStr = minute.toString().padStart(2, '0');
    return `${displayHour}:${minuteStr} ${period}`;
  }

  getFormattedDate(): string {
    // Usar parseDateSafe para evitar problemas de zona horaria
    const date = this.parseDateSafe(
      this.data.operatingDay?.date || this.data.date
    );
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

  onSave(): void {
    this.timeOutsideSiteRangeError = this.getTimeOutsideSiteRangeError();
    if (this.data.form.valid && !this.timeOutsideSiteRangeError) {
      this.dialogRef.close(this.data.form.value);
    }
  }
}
