import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { DayOfWeekResponse } from '../models/DayOfWeekResponse';

/** Claves i18n por id de día (1=Lunes…7=Domingo). ES: L,K,M,J,V,S,D; EN: M,T,W,Th,F,Sa,S. */
const DAY_SHORT_KEYS: Record<number, string> = {
  1: 'sites.add.operating-days-of-week.mondayShort',
  2: 'sites.add.operating-days-of-week.tuesdayShort',
  3: 'sites.add.operating-days-of-week.wednesdayShort',
  4: 'sites.add.operating-days-of-week.thursdayShort',
  5: 'sites.add.operating-days-of-week.fridayShort',
  6: 'sites.add.operating-days-of-week.saturdayShort',
  7: 'sites.add.operating-days-of-week.sundayShort',
};

/** Fallback español si falta traducción. */
const DAY_SHORT_FALLBACK: Record<number, string> = {
  1: 'L',
  2: 'K',
  3: 'M',
  4: 'J',
  5: 'V',
  6: 'S',
  7: 'D',
};

/**
 * Formatea días de la semana a abreviaturas por idioma separadas por espacio (ES: "L K M J V"; EN: "M T W Th F").
 * Acepta DayOfWeekResponse[] o number[] (ids 1–7). Orden: Lunes(1) … Domingo(7).
 */
@Pipe({
  name: 'weekdaysShort',
  standalone: true,
  pure: false,
})
export class WeekdaysShortPipe implements PipeTransform {
  private readonly transloco = inject(TranslocoService);

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
      .map((id) => {
        const key = DAY_SHORT_KEYS[id];
        if (!key) return '';
        const t = this.transloco.translate(key);
        return t !== key ? t : DAY_SHORT_FALLBACK[id] ?? '';
      })
      .filter(Boolean)
      .join(' ');
  }
}
