import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ServiceSlotOperatingDate } from 'app/shared/models/Response/SiteChildGroupServiceSlotResponse';

/** Día de la semana: índice 0=Lunes, 6=Domingo. */
const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const;

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

export type DayType = 'normal' | 'weekend' | 'holiday' | 'inactive';

/**
 * Indicador visual semanal: 7 círculos (L M X J V S D) con los días activos resaltados.
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
  /** Fechas de operación del slot. */
  operatingDates = input<ServiceSlotOperatingDate[] | null | undefined>([]);

  readonly dayLabels = DAY_LABELS;

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

  /** Tipo de día para el círculo: holiday > weekend > normal. */
  getDayType(index: number): DayType {
    if (!this.isActive(index)) return 'inactive';
    const dates = this.getDatesForIndex(index);
    const hasHoliday = dates.some((d) => (d as { isHoliday?: boolean; IsHoliday?: boolean }).isHoliday ?? (d as { isHoliday?: boolean; IsHoliday?: boolean }).IsHoliday);
    const hasWeekend = dates.some((d) => (d as { isWeekend?: boolean; IsWeekend?: boolean }).isWeekend ?? (d as { isWeekend?: boolean; IsWeekend?: boolean }).IsWeekend);
    if (hasHoliday) return 'holiday';
    if (hasWeekend) return 'weekend';
    return 'normal';
  }

  /** Colores del calendario: normal=verde, weekend=naranja, holiday=morado. */
  private static readonly DAY_TYPE_COLORS = {
    holiday: 'bg-[#9c27b0] text-white dark:bg-[#7b1fa2] dark:text-white',
    weekend: 'bg-[#ff9800] text-white dark:bg-[#f57c00] dark:text-white',
    normal: 'bg-[#4caf50] text-white dark:bg-[#388e3c] dark:text-white',
    inactive: 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
  } as const;

  /** Clases CSS para el círculo según tipo de día (mismos colores que el calendario). */
  getDayClasses(index: number): string {
    const type = this.getDayType(index);
    const base =
      'inline-flex h-5 w-5 min-w-5 items-center justify-center rounded-full text-[10px] font-medium transition-colors';
    return `${base} ${ServiceDaysIndicatorComponent.DAY_TYPE_COLORS[type]}`;
  }
}
