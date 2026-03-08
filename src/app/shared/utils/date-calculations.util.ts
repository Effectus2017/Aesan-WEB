import { FormGroup } from '@angular/forms';
import { DayOfWeekResponse } from '../models/calendar/DayOfWeekResponse';

/**
 * Utilidades para cálculos de fechas y días operativos
 * Date calculation utilities for operating days
 */
export class DateCalculationsUtil {
  /**
   * Calcula los días laborables entre dos fechas (excluyendo fines de semana)
   * Calculates working days between two dates (excluding weekends)
   * @param startDate Fecha de inicio / Start date
   * @param endDate Fecha de fin / End date
   * @returns Número de días laborables / Number of working days
   */
  static calculateWorkingDays(startDate: Date, endDate: Date): number {
    // Validar fechas
    if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return 0;
    }

    // Normalizar fechas a medianoche para evitar problemas de zona horaria
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    // Asegurar que las fechas estén en el orden correcto
    const [earlier, later] = start <= end ? [start, end] : [end, start];

    // Calcular semanas completas para optimización
    const totalDays = Math.floor((later.getTime() - earlier.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const fullWeeks = Math.floor(totalDays / 7);
    const workingDaysInFullWeeks = fullWeeks * 5; // 5 días laborables por semana

    // Calcular días restantes
    const remainingDays = totalDays % 7;
    const startDayOfWeek = earlier.getDay();
    let remainingWorkingDays = 0;

    for (let i = 0; i < remainingDays; i++) {
      const dayOfWeek = (startDayOfWeek + i) % 7;
      // Contar solo días laborables (lunes = 1, martes = 2, ..., viernes = 5)
      // Excluir sábado (6) y domingo (0)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        remainingWorkingDays++;
      }
    }

    return workingDaysInFullWeeks + remainingWorkingDays;
  }

  /**
   * Convierte el día de la semana de JavaScript al formato del sistema
   * Converts JavaScript day of week to system format
   * JavaScript: 0=Domingo, 1=Lunes, 2=Martes, ..., 6=Sábado
   * Sistema: 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado, 7=Domingo
   * @param jsDay Día de la semana en formato JavaScript (0-6)
   * @returns Día de la semana en formato del sistema (1-7)
   */
  private static convertJsDayToSystemDay(jsDay: number): number {
    // JavaScript: 0=Domingo, 1=Lunes, ..., 6=Sábado
    // Sistema: 1=Lunes, 2=Martes, ..., 7=Domingo
    return jsDay === 0 ? 7 : jsDay;
  }

  /**
   * Calcula los días operativos basándose en los días seleccionados de la semana
   * Calculates operating days based on selected days of the week
   * @param startDate Fecha de inicio / Start date
   * @param endDate Fecha de fin / End date
   * @param selectedDays Array de IDs de días seleccionados (1=Lunes, 2=Martes, ..., 7=Domingo) o array de DayOfWeekResponse
   * @returns Número de días operativos que coinciden con los días seleccionados
   */
  static calculateOperatingDaysBySelectedDays(
    startDate: Date,
    endDate: Date,
    selectedDays: number[] | DayOfWeekResponse[]
  ): number {
    // Validar fechas
    if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return 0;
    }

    // Validar días seleccionados
    if (!selectedDays || selectedDays.length === 0) {
      return 0;
    }

    // Extraer IDs de días (puede ser array de números o array de DayOfWeekResponse)
    const selectedDayIds: number[] = selectedDays.map((day) => {
      if (typeof day === 'number') {
        return day;
      } else {
        return day.id;
      }
    });

    // Normalizar fechas a medianoche para evitar problemas de zona horaria
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    // Asegurar que las fechas estén en el orden correcto
    const [earlier, later] = start <= end ? [start, end] : [end, start];

    let operatingDaysCount = 0;
    const currentDate = new Date(earlier);

    // Iterar sobre cada fecha en el rango
    while (currentDate <= later) {
      // Obtener el día de la semana en formato JavaScript (0-6)
      const jsDay = currentDate.getDay();
      // Convertir al formato del sistema (1-7)
      const systemDay = this.convertJsDayToSystemDay(jsDay);

      // Si el día está en la lista de días seleccionados, contarlo
      if (selectedDayIds.includes(systemDay)) {
        operatingDaysCount++;
      }

      // Avanzar al siguiente día
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return operatingDaysCount;
  }

  /**
   * Convierte un valor de fecha (Date o string YYYY-MM-DD / ISO) a Date en hora local.
   * Evita desfases por UTC cuando el backend envía "YYYY-MM-DD".
   */
  private static toLocalDate(value: Date | string): Date {
    if (value instanceof Date) {
      return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }
    const s = String(value).trim();
    const dateOnlyMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateOnlyMatch) {
      const y = Number(dateOnlyMatch[1]);
      const m = Number(dateOnlyMatch[2]);
      const d = Number(dateOnlyMatch[3]);
      return new Date(y, m - 1, d);
    }
    const parsed = new Date(value);
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }

  /**
   * Calcula los días operativos basado en fechas del formulario y actualiza el campo resultante
   * Calculates operating days based on form dates and updates the result field
   * Considera los días seleccionados en operatingDaysOfWeek si están disponibles
   * @param formGroup FormGroup que contiene los campos de fecha / FormGroup containing date fields
   * @param fromField Nombre del campo de fecha inicio / Start date field name
   * @param toField Nombre del campo de fecha fin / End date field name
   * @param resultField Nombre del campo donde guardar el resultado / Result field name
   * @param operatingDaysOfWeekField Nombre del campo que contiene los días seleccionados / Field name containing selected days
   */
  static calculateOperatingDays(
    formGroup: FormGroup,
    fromField: string = 'operatingFromDate',
    toField: string = 'operatingToDate',
    resultField: string = 'operatingDaysCalculated',
    operatingDaysOfWeekField: string = 'operatingDaysOfWeek'
  ): void {
    const fromDateValue = formGroup.get(fromField)?.value;
    const toDateValue = formGroup.get(toField)?.value;
    const operatingDaysOfWeekValue = formGroup.get(operatingDaysOfWeekField)?.value;

    if (fromDateValue && toDateValue) {
      try {
        // Convert form values to Date in local time (avoids UTC offset with "YYYY-MM-DD" strings)
        const fromDate = this.toLocalDate(fromDateValue);
        const toDate = this.toLocalDate(toDateValue);

        // Validate that the conversion was successful
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
          console.warn('Invalid date values provided for operating days calculation');
          formGroup.patchValue({
            [resultField]: null,
          });
          return;
        }

        let operatingDays: number;

        // Si hay días seleccionados, calcular basándose en esos días
        if (operatingDaysOfWeekValue && Array.isArray(operatingDaysOfWeekValue) && operatingDaysOfWeekValue.length > 0) {
          operatingDays = this.calculateOperatingDaysBySelectedDays(
            fromDate,
            toDate,
            operatingDaysOfWeekValue
          );
        } else {
          // Si no hay días seleccionados, usar el cálculo de días laborables (comportamiento anterior)
          operatingDays = this.calculateWorkingDays(fromDate, toDate);
        }

        formGroup.patchValue({
          [resultField]: operatingDays,
        });
      } catch (error) {
        console.error('Error calculating operating days:', error);
        formGroup.patchValue({
          [resultField]: null,
        });
      }
    } else {
      formGroup.patchValue({
        [resultField]: null,
      });
    }
  }

  /**
   * Calcula los días operativos automáticamente si es necesario
   * Calculates operating days automatically if needed
   * @param formGroup FormGroup que contiene los campos / FormGroup containing the fields
   * @param fromField Nombre del campo de fecha inicio / Start date field name
   * @param toField Nombre del campo de fecha fin / End date field name
   * @param resultField Nombre del campo donde guardar el resultado / Result field name
   */
  static calculateOperatingDaysIfNeeded(
    formGroup: FormGroup,
    fromField: string = 'operatingFromDate',
    toField: string = 'operatingToDate',
    resultField: string = 'operatingDaysCalculated'
  ): void {
    const operatingDaysCalculated = formGroup.get(resultField)?.value;
    const operatingFromDate = formGroup.get(fromField)?.value;
    const operatingToDate = formGroup.get(toField)?.value;

    // Si operatingDaysCalculated es null, 0 o undefined, pero existen las fechas, calcular automáticamente
    if (
      (operatingDaysCalculated === null || operatingDaysCalculated === 0 || operatingDaysCalculated === undefined) &&
      operatingFromDate &&
      operatingToDate
    ) {
      this.calculateOperatingDays(formGroup, fromField, toField, resultField);
    }
  }
}

