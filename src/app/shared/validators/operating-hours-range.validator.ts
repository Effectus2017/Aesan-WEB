import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { timeToMinutes, dateToTimeString } from '../utils';

/**
 * Validador para verificar que una hora esté dentro del rango de funcionamiento
 * @param operatingStartTime Hora de inicio del día de funcionamiento (formato HH:mm o Date)
 * @param operatingEndTime Hora de fin del día de funcionamiento (formato HH:mm o Date)
 * @param isStartTime Si es true, valida que la hora sea >= operatingStartTime. Si es false, valida que sea <= operatingEndTime
 * @returns Validator function que retorna ValidationErrors o null
 */
export function operatingHoursRangeValidator(
  operatingStartTime: string | Date | null,
  operatingEndTime: string | Date | null,
  isStartTime: boolean = false
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    // Si no hay valor en el control, no validar (el Validators.required se encargará)
    if (!control.value) {
      return null;
    }

    // Si no hay horas de funcionamiento configuradas, no aplicar restricciones
    if (!operatingStartTime || !operatingEndTime) {
      return null;
    }

    // Convertir operatingStartTime y operatingEndTime a string HH:mm si son Date
    let startTimeStr: string;
    let endTimeStr: string;

    if (operatingStartTime instanceof Date) {
      startTimeStr = dateToTimeString(operatingStartTime);
    } else {
      startTimeStr = operatingStartTime;
    }

    if (operatingEndTime instanceof Date) {
      endTimeStr = dateToTimeString(operatingEndTime);
    } else {
      endTimeStr = operatingEndTime;
    }

    if (!startTimeStr || !endTimeStr) {
      return null;
    }

    // Convertir el valor del control a string HH:mm si es Date
    let serviceTimeStr: string;
    if (control.value instanceof Date) {
      serviceTimeStr = dateToTimeString(control.value);
    } else {
      serviceTimeStr = control.value;
    }

    if (!serviceTimeStr) {
      return null;
    }

    // Convertir a minutos para comparar
    const serviceMinutes = timeToMinutes(serviceTimeStr);
    const startMinutes = timeToMinutes(startTimeStr);
    const endMinutes = timeToMinutes(endTimeStr);

    // Validar según el tipo de campo
    if (isStartTime) {
      // Para hora de inicio: debe ser >= operatingStartTime y <= operatingEndTime
      if (serviceMinutes < startMinutes || serviceMinutes > endMinutes) {
        return {
          operatingHoursRange: {
            message: 'La hora de inicio debe estar dentro del rango de funcionamiento',
            minTime: startTimeStr,
            maxTime: endTimeStr,
            actualTime: serviceTimeStr
          }
        };
      }
    } else {
      // Para hora de fin: debe ser <= operatingEndTime y >= operatingStartTime
      if (serviceMinutes > endMinutes || serviceMinutes < startMinutes) {
        return {
          operatingHoursRange: {
            message: 'La hora de fin debe estar dentro del rango de funcionamiento',
            minTime: startTimeStr,
            maxTime: endTimeStr,
            actualTime: serviceTimeStr
          }
        };
      }
    }

    return null; // Válido
  };
}

