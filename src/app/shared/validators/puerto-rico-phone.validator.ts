import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador para números de teléfono de Puerto Rico
 * Formato esperado: 10 dígitos, comenzando con 787 o 939
 * @returns Validator function que retorna ValidationErrors o null
 */
export function puertoRicoPhoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Si está vacío, el Validators.required se encargará
    }

    // Remover todos los caracteres no numéricos
    const phoneNumber = control.value.toString().replace(/\D/g, '');

    // Verificar que tenga exactamente 10 dígitos
    if (phoneNumber.length !== 10) {
      return {
        puertoRicoPhone: {
          message: 'El teléfono debe tener 10 dígitos',
          actualLength: phoneNumber.length
        }
      };
    }

    // Verificar que comience con código de área válido (787 o 939)
    const areaCode = phoneNumber.substring(0, 3);
    if (areaCode !== '787' && areaCode !== '939') {
      return {
        puertoRicoPhone: {
          message: 'El teléfono debe comenzar con código de área 787 o 939',
          actualAreaCode: areaCode
        }
      };
    }

    return null; // Válido
  };
}

