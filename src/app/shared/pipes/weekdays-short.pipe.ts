import { Pipe, PipeTransform } from '@angular/core';
import { DayOfWeekResponse } from '../models/DayOfWeekResponse';

/** Iniciales de días: 1=L, 2=M, 3=X, 4=J, 5=V, 6=S, 7=D (Lunes–Domingo). */
const WEEKDAY_INITIAL: Record<number, string> = {
  1: 'L',
  2: 'M',
  3: 'X',
  4: 'J',
  5: 'V',
  6: 'S',
  7: 'D',
};

/**
 * Formatea días de la semana a iniciales separadas por espacio (Opción A: "L M X J V").
 * Acepta DayOfWeekResponse[] o number[] (ids 1–7). Orden: Lunes(1) … Domingo(7).
 */
@Pipe({
  name: 'weekdaysShort',
  standalone: true,
})
export class WeekdaysShortPipe implements PipeTransform {
  transform(
    value: DayOfWeekResponse[] | number[] | null | undefined
  ): string {
    if (value == null || !Array.isArray(value) || value.length === 0) {
      return '';
    }
    const ids =
      typeof value[0] === 'object' && value[0] !== null && 'id' in value[0]
        ? (value as DayOfWeekResponse[]).map((d) => d.id).sort((a, b) => a - b)
        : [...(value as number[])].sort((a, b) => a - b);
    return ids
      .map((id) => WEEKDAY_INITIAL[id])
      .filter(Boolean)
      .join(' ');
  }
}
