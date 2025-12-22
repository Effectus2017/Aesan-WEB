import { AbstractControl, FormGroup, Validators } from '@angular/forms';
import { dateToMinutes } from '../utils';
import { operatingHoursRangeValidator } from '../validators/operating-hours-range.validator';

/**
 * Configuración de servicio para revalidación
 * Service configuration for revalidation
 */
export interface ServiceConfig {
  service: string;
  from: string;
  to: string;
}

/**
 * Utilidades para validación de rangos de tiempo
 * Time range validation utilities
 */
export class TimeValidationUtil {
  /**
   * Obtiene la siguiente hora válida (30 minutos después de la hora "desde")
   * Gets the next valid time (30 minutes after the "from" time)
   * @param fromTime Hora desde / From time
   * @returns Siguiente hora válida / Next valid time
   */
  private static getNextValidTime(fromTime: Date): Date {
    const nextTime = new Date(fromTime);
    nextTime.setMinutes(nextTime.getMinutes() + 30);
    // Si se pasa de medianoche, establecer a las 23:30
    if (nextTime.getDate() !== fromTime.getDate()) {
      nextTime.setHours(23);
      nextTime.setMinutes(30);
    }
    return nextTime;
  }

  /**
   * Valida y ajusta el rango de tiempo entre dos controles
   * Validates and adjusts the time range between two controls
   * @param fromControl Control del campo "desde" / "From" field control
   * @param toControl Control del campo "hasta" / "To" field control
   */
  static validateAndAdjustTimeRange(fromControl: AbstractControl, toControl: AbstractControl): void {
    const fromTime = fromControl.value;
    const toTime = toControl.value;

    if (!fromTime) {
      return;
    }

    if (!toTime) {
      // Si no hay hora "hasta", establecer la siguiente hora válida
      const nextValidTime = this.getNextValidTime(fromTime);
      toControl.setValue(nextValidTime, { emitEvent: false });
      return;
    }

    const fromMinutes = dateToMinutes(fromTime);
    const toMinutes = dateToMinutes(toTime);

    // Si la hora "hasta" es menor o igual a "desde", ajustarla
    if (toMinutes <= fromMinutes) {
      const nextValidTime = this.getNextValidTime(fromTime);
      toControl.setValue(nextValidTime, { emitEvent: false });
    }
  }

  /**
   * Valida que la hora "hasta" sea mayor que la hora "desde"
   * Validates that the "to" time is greater than the "from" time
   * @param fromControl Control del campo "desde" / "From" field control
   * @param toControl Control del campo "hasta" / "To" field control
   */
  static validateTimeRange(fromControl: AbstractControl, toControl: AbstractControl): void {
    const fromTime = fromControl.value;
    const toTime = toControl.value;

    if (!fromTime || !toTime) {
      toControl.setErrors(null);
      return;
    }

    const fromMinutes = dateToMinutes(fromTime);
    const toMinutes = dateToMinutes(toTime);

    if (toMinutes <= fromMinutes) {
      toControl.setErrors({ timeRangeInvalid: true });
    } else {
      // Si hay otros errores, mantenerlos, si no, limpiar
      const currentErrors = toControl.errors;
      if (currentErrors && Object.keys(currentErrors).length > 1) {
        delete currentErrors['timeRangeInvalid'];
        toControl.setErrors(Object.keys(currentErrors).length > 0 ? currentErrors : null);
      } else {
        toControl.setErrors(null);
      }
    }
    toControl.updateValueAndValidity({ emitEvent: false });
  }

  /**
   * Revalida todos los campos de tiempo de servicios
   * Revalidates all service time fields
   * @param formGroup FormGroup que contiene los campos de servicio / FormGroup containing service fields
   * @param services Array de configuraciones de servicios / Array of service configurations
   * @param updateServiceTimeValidationsCallback Función callback para actualizar validaciones de tiempo de servicio / Callback function to update service time validations
   */
  static revalidateAllServiceTimes(
    formGroup: FormGroup,
    services: ServiceConfig[],
    updateServiceTimeValidationsCallback: (
      serviceValue: boolean | null,
      fromControl: AbstractControl,
      toControl: AbstractControl,
      serviceControl?: AbstractControl
    ) => void
  ): void {
    services.forEach(({ service, from, to }) => {
      const serviceControl = formGroup.get(service);
      const fromControl = formGroup.get(from);
      const toControl = formGroup.get(to);

      if (serviceControl && fromControl && toControl && serviceControl.value === true) {
        // Revalidar solo si el servicio está activo
        updateServiceTimeValidationsCallback(serviceControl.value, fromControl, toControl, serviceControl);
      }
    });
  }

  /**
   * Actualiza las validaciones de los campos de hora según el estado del servicio
   * Updates time field validations based on service status
   * @param formGroup FormGroup que contiene los campos / FormGroup containing the fields
   * @param serviceValue Valor del servicio (true = Sí, false/null = No) / Service value (true = Yes, false/null = No)
   * @param fromControl Control del campo "Hora desde" / "From time" field control
   * @param toControl Control del campo "Hora hasta" / "To time" field control
   * @param operatingStartTimeField Nombre del campo de hora de inicio de operación / Operating start time field name
   * @param operatingEndTimeField Nombre del campo de hora de fin de operación / Operating end time field name
   * @param changeDetectorRef ChangeDetectorRef para detectar cambios / ChangeDetectorRef to detect changes
   * @param submitDisabledSetter Función para actualizar el estado del botón de envío / Function to update submit button state
   */
  static updateServiceTimeValidations(
    formGroup: FormGroup,
    serviceValue: boolean | null,
    fromControl: AbstractControl,
    toControl: AbstractControl,
    operatingStartTimeField: string = 'operatingStartTime',
    operatingEndTimeField: string = 'operatingEndTime',
    changeDetectorRef?: { detectChanges: () => void },
    submitDisabledSetter?: (disabled: boolean) => void
  ): void {
    const operatingStartTime = formGroup.get(operatingStartTimeField)?.value;
    const operatingEndTime = formGroup.get(operatingEndTimeField)?.value;

    if (serviceValue === true) {
      // Si el servicio está en "Sí", hacer requeridos los campos de hora y agregar validación de rango
      const fromValidators = [Validators.required];
      const toValidators = [Validators.required];

      // Agregar validador de rango si hay horas de funcionamiento configuradas
      if (operatingStartTime && operatingEndTime) {
        fromValidators.push(operatingHoursRangeValidator(operatingStartTime, operatingEndTime, true));
        toValidators.push(operatingHoursRangeValidator(operatingStartTime, operatingEndTime, false));
      }

      fromControl.setValidators(fromValidators);
      toControl.setValidators(toValidators);
    } else {
      // Si el servicio está en "No" o null, remover validaciones requeridas
      fromControl.clearValidators();
      toControl.clearValidators();
      // Limpiar valores si el servicio está en "No"
      if (serviceValue === false) {
        fromControl.setValue(null, { emitEvent: false });
        toControl.setValue(null, { emitEvent: false });
      }
    }

    fromControl.updateValueAndValidity({ emitEvent: false });
    toControl.updateValueAndValidity({ emitEvent: false });

    // Actualizar el estado del botón de guardar después de cambiar las validaciones
    if (submitDisabledSetter) {
      submitDisabledSetter(formGroup.invalid);
    }

    if (changeDetectorRef) {
      changeDetectorRef.detectChanges();
    }
  }
}

