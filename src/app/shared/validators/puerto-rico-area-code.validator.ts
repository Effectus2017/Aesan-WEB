import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Códigos de área válidos de Puerto Rico
 */
const VALID_AREA_CODES = ['787', '939', '849'];

/**
 * Validador para códigos de área de Puerto Rico
 * Formato esperado: 3 dígitos (787, 939, o 849)
 * 
 * @returns Validator function que retorna ValidationErrors o null
 * 
 * @example
 * areaCode: new FormControl('', [
 *   Validators.required,
 *   puertoRicoAreaCodeValidator()
 * ])
 */
export function puertoRicoAreaCodeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Si está vacío, el Validators.required se encargará
    }

    // Remover todos los caracteres no numéricos
    const areaCode = control.value.toString().replace(/\D/g, '');

    // Verificar que tenga exactamente 3 dígitos
    if (areaCode.length !== 3) {
      return {
        puertoRicoAreaCode: {
          message: 'El código de área debe tener 3 dígitos',
          actualLength: areaCode.length
        }
      };
    }

    // Verificar que sea un código de área válido de Puerto Rico
    if (!VALID_AREA_CODES.includes(areaCode)) {
      return {
        puertoRicoAreaCode: {
          message: `El código de área debe ser uno de los siguientes: ${VALID_AREA_CODES.join(', ')}`,
          invalidCode: areaCode,
          validCodes: VALID_AREA_CODES
        }
      };
    }

    return null; // Válido
  };
}

