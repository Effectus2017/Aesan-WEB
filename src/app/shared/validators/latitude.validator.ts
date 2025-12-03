import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador para coordenadas de latitud
 * Rango válido: -90 a 90 grados
 * 
 * @returns Validator function que retorna ValidationErrors o null
 * 
 * @example
 * // Uso en FormControl
 * latitude: new FormControl('', [
 *   Validators.required,
 *   latitudeValidator()
 * ])
 */
export function latitudeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Si está vacío, el Validators.required se encargará
    }

    const value = control.value.toString().trim();

    // Verificar que sea un número válido
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return {
        latitude: {
          message: 'La latitud debe ser un número válido',
          actualValue: value
        }
      };
    }

    // Verificar rango válido: -90 a 90
    if (numValue < -90 || numValue > 90) {
      return {
        latitude: {
          message: 'La latitud debe estar entre -90 y 90 grados',
          actualValue: value
        }
      };
    }

    return null; // Válido
  };
}

