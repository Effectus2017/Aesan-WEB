import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador para coordenadas de longitud
 * Rango válido: -180 a 180 grados
 * 
 * @returns Validator function que retorna ValidationErrors o null
 * 
 * @example
 * // Uso en FormControl
 * longitude: new FormControl('', [
 *   Validators.required,
 *   longitudeValidator()
 * ])
 */
export function longitudeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Si está vacío, el Validators.required se encargará
    }

    const value = control.value.toString().trim();

    // Verificar que sea un número válido
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return {
        longitude: {
          message: 'La longitud debe ser un número válido',
          actualValue: value
        }
      };
    }

    // Verificar rango válido: -180 a 180
    if (numValue < -180 || numValue > 180) {
      return {
        longitude: {
          message: 'La longitud debe estar entre -180 y 180 grados',
          actualValue: value
        }
      };
    }

    return null; // Válido
  };
}

