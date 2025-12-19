import { FormGroup } from '@angular/forms';

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
   * Calcula los días operativos basado en fechas del formulario y actualiza el campo resultante
   * Calculates operating days based on form dates and updates the result field
   * @param formGroup FormGroup que contiene los campos de fecha / FormGroup containing date fields
   * @param fromField Nombre del campo de fecha inicio / Start date field name
   * @param toField Nombre del campo de fecha fin / End date field name
   * @param resultField Nombre del campo donde guardar el resultado / Result field name
   */
  static calculateOperatingDays(
    formGroup: FormGroup,
    fromField: string = 'operatingFromDate',
    toField: string = 'operatingToDate',
    resultField: string = 'operatingDaysCalculated'
  ): void {
    const fromDateValue = formGroup.get(fromField)?.value;
    const toDateValue = formGroup.get(toField)?.value;

    if (fromDateValue && toDateValue) {
      try {
        // Convert form values to Date objects if they aren't already
        const fromDate = fromDateValue instanceof Date ? fromDateValue : new Date(fromDateValue);
        const toDate = toDateValue instanceof Date ? toDateValue : new Date(toDateValue);

        // Validate that the conversion was successful
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
          console.warn('Invalid date values provided for operating days calculation');
          formGroup.patchValue({
            [resultField]: null,
          });
          return;
        }

        const workingDays = this.calculateWorkingDays(fromDate, toDate);

        formGroup.patchValue({
          [resultField]: workingDays,
        });
      } catch (error) {
        console.error('Error calculating working days:', error);
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

