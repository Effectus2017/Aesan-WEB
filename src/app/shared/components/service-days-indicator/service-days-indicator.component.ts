import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { ServiceSlotOperatingDate } from 'app/shared/models/response/SiteChildGroupServiceSlotResponse';

/** Día de la semana: índice 0=Lunes, 6=Domingo. */
/** Claves i18n para abreviaturas (ES: L,K,M,J,V,S,D; EN: M,T,W,Th,F,Sa,S). */
const DAY_SHORT_KEYS = [
  'sites.add.operating-days-of-week.mondayShort',
  'sites.add.operating-days-of-week.tuesdayShort',
  'sites.add.operating-days-of-week.wednesdayShort',
  'sites.add.operating-days-of-week.thursdayShort',
  'sites.add.operating-days-of-week.fridayShort',
  'sites.add.operating-days-of-week.saturdayShort',
  'sites.add.operating-days-of-week.sundayShort',
] as const;

/** Fallback español si falta traducción. */
const DAY_LABELS_FALLBACK = ['L', 'K', 'M', 'J', 'V', 'S', 'D'];

/** Mapeo dayName (API) -> índice 0-6 (Lunes=0, Domingo=6). */
const DAY_NAME_TO_INDEX: Record<string, number> = {
  lunes: 0,
  martes: 1,
  miércoles: 2,
  miercoles: 2,
  jueves: 3,
  viernes: 4,
  sábado: 5,
  sabado: 5,
  domingo: 6,
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6,
};

export type DayType = 'normal' | 'weekend' | 'holiday' | 'extra' | 'inactive';

/**
 * Indicador visual semanal: 7 marcas rectangulares redondeadas (como en calendario) con abreviaturas por idioma.
 * Colores por tipo: normal (verde), fin de semana (naranja), feriado (morado).
 */
@Component({
  selector: 'app-service-days-indicator',
  standalone: true,
  imports: [],
  templateUrl: './service-days-indicator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceDaysIndicatorComponent {
  private readonly transloco = inject(TranslocoService);

  /** Fechas de operación del slot. */
  operatingDates = input<ServiceSlotOperatingDate[] | null | undefined>([]);

  /** Etiquetas de días desde i18n (orden Lunes→Domingo). Fallback a español si falta clave. */
  get dayLabels(): string[] {
    return DAY_SHORT_KEYS.map((key) => {
      const t = this.transloco.translate(key);
      return t !== key ? t : DAY_LABELS_FALLBACK[DAY_SHORT_KEYS.indexOf(key)];
    });
  }

  /** Índices (0-6) de días que tienen operatingDates. */
  get activeDayIndices(): Set<number> {
    const dates = this.operatingDates();
    if (!dates?.length) return new Set();
    const indices = new Set<number>();
    for (const d of dates) {
      const name = (d as { dayName?: string; DayName?: string }).dayName ?? (d as { dayName?: string; DayName?: string }).DayName ?? '';
      const idx = DAY_NAME_TO_INDEX[name.toLowerCase().trim()];
      if (typeof idx === 'number') indices.add(idx);
    }
    return indices;
  }

  isActive(index: number): boolean {
    return this.activeDayIndices.has(index);
  }

  /** Obtiene fechas para un índice de día (0-6). Soporta dayName/DayName (API). */
  getDatesForIndex(index: number): ServiceSlotOperatingDate[] {
    const dates = this.operatingDates();
    if (!dates?.length) return [];
    return dates.filter((d) => {
      const name = (d as { dayName?: string; DayName?: string }).dayName ?? (d as { dayName?: string; DayName?: string }).DayName ?? '';
      const key = name.toLowerCase().trim();
      return DAY_NAME_TO_INDEX[key] === index;
    });
  }

  /** Tipo de día para la marca: holiday > weekend > extra (manual) > normal. */
  getDayType(index: number): DayType {
    if (!this.isActive(index)) return 'inactive';
    const dates = this.getDatesForIndex(index);
    const hasHoliday = dates.some((d) => (d as { isHoliday?: boolean; IsHoliday?: boolean }).isHoliday ?? (d as { isHoliday?: boolean; IsHoliday?: boolean }).IsHoliday);
    const hasWeekend = dates.some((d) => (d as { isWeekend?: boolean; IsWeekend?: boolean }).isWeekend ?? (d as { isWeekend?: boolean; IsWeekend?: boolean }).IsWeekend);
    const hasManuallyAdded = dates.some((d) => this._isManuallyAdded(d));
    if (hasHoliday) return 'holiday';
    if (hasWeekend) return 'weekend';
    if (hasManuallyAdded) return 'extra';
    return 'normal';
  }

  /** Indica si la fecha de operación corresponde a un día agregado manualmente (API puede enviar boolean o 1/0). */
  private _isManuallyAdded(d: ServiceSlotOperatingDate): boolean {
    const v =
      (d as { isManuallyAdded?: boolean; IsManuallyAdded?: boolean; ismanuallyadded?: boolean }).isManuallyAdded ??
      (d as { isManuallyAdded?: boolean; IsManuallyAdded?: boolean; ismanuallyadded?: boolean }).IsManuallyAdded ??
      (d as { isManuallyAdded?: boolean; IsManuallyAdded?: boolean; ismanuallyadded?: boolean }).ismanuallyadded;
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v === 1;
    return false;
  }

  /** Colores del calendario: normal=verde, weekend=naranja, holiday=morado, extra=teal. */
  private static readonly DAY_TYPE_COLORS = {
    holiday: 'bg-[#9c27b0] text-white dark:bg-[#7b1fa2] dark:text-white',
    weekend: 'bg-[#ff9800] text-white dark:bg-[#f57c00] dark:text-white',
    normal: 'bg-[#4caf50] text-white dark:bg-[#388e3c] dark:text-white',
    extra: 'bg-[#009688] text-white dark:bg-[#00796b] dark:text-white',
    inactive: 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
  } as const;

  /** Clases CSS para la marca rectangular redondeada (alineada con eventos del calendario). */
  getDayClasses(index: number): string {
    const type = this.getDayType(index);
    const base =
      'inline-flex h-5 min-h-5 min-w-5 shrink-0 items-center justify-center rounded px-0.5 text-[10px] font-medium leading-none transition-colors';
    return `${base} ${ServiceDaysIndicatorComponent.DAY_TYPE_COLORS[type]}`;
  }
}
