import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador para códigos postales de Puerto Rico
 * Formato esperado: ##### o #####-####
 * - 5 dígitos básicos (requeridos)
 * - Opcionalmente 4 dígitos adicionales después de un guión
 * 
 * @returns Validator function que retorna ValidationErrors o null
 * 
 * @example
 * // Uso en FormControl
 * zipCode: new FormControl('', [
 *   Validators.required,
 *   puertoRicoZipCodeValidator()
 * ])
 */
export function puertoRicoZipCodeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Si está vacío, el Validators.required se encargará
    }

    const zipCode = control.value.toString().trim();

    // Patrón para código postal de Puerto Rico: ##### o #####-####
    // 5 dígitos, opcionalmente seguidos de un guión y 4 dígitos más
    const zipCodePattern = /^\d{5}(-\d{4})?$/;

    if (!zipCodePattern.test(zipCode)) {
      return {
        puertoRicoZipCode: {
          message: 'El código postal debe tener el formato ##### o #####-####',
          actualValue: zipCode
        }
      };
    }

    return null; // Válido
  };
}

