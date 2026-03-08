import { Pipe, PipeTransform } from '@angular/core';
import { ServiceSlotOperatingDate } from '../models/response/SiteChildGroupServiceSlotResponse';

/** Formatea un string de tiempo "HH:mm:ss", "HH:mm" o "HH:mm:ss.ffffff" a "4:00 PM". */
export function formatTimeForDisplay(timeStr: string | undefined): string {
  if (!timeStr || typeof timeStr !== 'string') return '';
  const parts = timeStr.split(':');
  const h = parseInt(parts[0] ?? '0', 10);
  const m = parseInt((parts[1] ?? '0').split('.')[0], 10);
  const hour = h % 12 || 12;
  const ampm = h < 12 ? 'AM' : 'PM';
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

/** Obtiene from/to de un operatingDate (soporta camelCase y PascalCase de la API). */
function getFromTo(d: { from?: string; to?: string; From?: string; To?: string }): { from: string; to: string } | null {
  const from = d.from ?? (d as { From?: string }).From;
  const to = d.to ?? (d as { To?: string }).To;
  if (from && to) return { from, to };
  return null;
}

/**
 * Formatea fechas de operación por slot a "Jueves(6)", "Jueves(2, 9, 16)" o "Lunes(1) Jueves(6)".
 * Si includeTimesWhenDifferent es true y las fechas tienen from/to:
 * - Horarios distintos: "Martes(6): 4:00-4:30 PM; Miércoles(14): 5:30-6:00 PM"
 * - Mismo horario: "Lunes(3), Martes(4), Miércoles(5), Jueves(6): 10:00-10:30 AM"
 */
@Pipe({
  name: 'serviceDaysDisplay',
  standalone: true,
})
export class ServiceDaysDisplayPipe implements PipeTransform {
  transform(
    value: ServiceSlotOperatingDate[] | null | undefined,
    includeTimesWhenDifferent: boolean = false
  ): string {
    if (value == null || !Array.isArray(value) || value.length === 0) {
      return '';
    }
    if (includeTimesWhenDifferent) {
      const withTimes = value.map((d) => ({ d, ft: getFromTo(d) })).filter((x): x is { d: ServiceSlotOperatingDate; ft: { from: string; to: string } } => x.ft != null);
      if (withTimes.length > 0) {
        const uniquePairs = new Set(withTimes.map((x) => `${x.ft.from}-${x.ft.to}`));
        const sorted = [...withTimes].sort(
            (a, b) =>
              a.d.dayName.localeCompare(b.d.dayName) || a.d.dayOfMonth - b.d.dayOfMonth
          );
        if (uniquePairs.size > 1) {
          return sorted
            .map((x) => `${x.d.dayName}(${x.d.dayOfMonth}): ${formatTimeForDisplay(x.ft.from)}-${formatTimeForDisplay(x.ft.to)}`)
            .join('; ');
        }
        const first = sorted[0];
        const daysPart = sorted.map((x) => `${x.d.dayName}(${x.d.dayOfMonth})`).join(', ');
        return `${daysPart}: ${formatTimeForDisplay(first.ft.from)}-${formatTimeForDisplay(first.ft.to)}`;
      }
    }
    const sorted = [...value].sort(
      (a, b) =>
        a.dayName.localeCompare(b.dayName) || a.dayOfMonth - b.dayOfMonth
    );
    const byDayName = new Map<string, number[]>();
    for (const d of sorted) {
      const list = byDayName.get(d.dayName) ?? [];
      list.push(d.dayOfMonth);
      byDayName.set(d.dayName, list);
    }
    return Array.from(byDayName.entries())
      .map(([name, days]) => `${name}(${days.join(', ')})`)
      .join(' ');
  }
}
