import { Pipe, PipeTransform } from '@angular/core';
import { ServiceSlotOperatingDate } from '../models/Response/SiteChildGroupServiceSlotResponse';

/**
 * Formatea fechas de operación por slot a "Jueves(6)", "Jueves(2, 9, 16)" o "Lunes(1) Jueves(6)".
 * Agrupa por nombre del día y muestra los días del mes entre paréntesis.
 */
@Pipe({
  name: 'serviceDaysDisplay',
  standalone: true,
})
export class ServiceDaysDisplayPipe implements PipeTransform {
  transform(
    value: ServiceSlotOperatingDate[] | null | undefined
  ): string {
    if (value == null || !Array.isArray(value) || value.length === 0) {
      return '';
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
