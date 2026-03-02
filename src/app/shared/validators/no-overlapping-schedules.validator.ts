import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { timeToMinutes } from '../utils';

/**
 * Validador que verifica que los horarios administrativo y operacional no se solapen.
 * Para uso cuando la clasificación es "Ambos": no puede haber dos cargos en el mismo tramo horario.
 * Los rangos no se solapan si y solo si: adminTo <= operFrom || operTo <= adminFrom.
 */
export function noOverlappingSchedulesValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const group = control;
    const adminFrom = group.get('administrativeScheduleFrom')?.value;
    const adminTo = group.get('administrativeScheduleTo')?.value;
    const operFrom = group.get('operationalScheduleFrom')?.value;
    const operTo = group.get('operationalScheduleTo')?.value;

    if (!adminFrom || !adminTo || !operFrom || !operTo) {
      return null;
    }

    const adminFromMin = timeToMinutes(adminFrom);
    const adminToMin = timeToMinutes(adminTo);
    const operFromMin = timeToMinutes(operFrom);
    const operToMin = timeToMinutes(operTo);

    const noOverlap = adminToMin <= operFromMin || operToMin <= adminFromMin;
    if (noOverlap) {
      return null;
    }

    return { schedulesOverlap: true };
  };
}
