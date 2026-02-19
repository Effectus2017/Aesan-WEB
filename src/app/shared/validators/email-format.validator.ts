import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Clave del error de formato de email (para usar con tipos nombrados si se desea). */
export const EMAIL_FORMAT_ERROR_KEY = 'invalidEmailFormat';

/**
 * Validador síncrono que verifica que el valor sea un email con formato válido (incluye dominio).
 * Útil cuando se quiere una validación más estricta que Validators.email.
 *
 * @returns ValidatorFn que retorna { invalidEmailFormat: true } si el formato es inválido, null si es válido
 *
 * @example
 * email: new FormControl(null, [Validators.required, Validators.email, emailFormatValidator()], [emailExistsValidator(...)])
 */
export function emailFormatValidator(): ValidatorFn {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const valid = emailRegex.test(control.value);
    return valid ? null : { [EMAIL_FORMAT_ERROR_KEY]: true };
  };
}
