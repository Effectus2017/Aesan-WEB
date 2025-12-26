import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, switchMap, map, catchError, first } from 'rxjs/operators';
import { UserService } from '../services/user.service';

/**
 * Validador asíncrono que verifica si un IUE (Identificador Único de Entidad) ya existe en el sistema.
 * Solo valida cuando el campo tiene la cantidad exacta de dígitos requeridos para optimizar las peticiones HTTP.
 *
 * @param userService Servicio de usuario para realizar la verificación
 * @param debounceTimeMs Tiempo de espera antes de realizar la validación (default: 1000ms)
 * @param requiredDigits Cantidad exacta de dígitos requeridos para validar (default: 12)
 * @returns AsyncValidatorFn que retorna { uieExists: true } si el IUE existe, null si no existe
 *
 * @example
 * uieNumber: new FormControl('', [
 *   Validators.required,
 *   maxDigitsValidator(12)
 * ], [
 *   uieExistsValidator(this._userService, 1000, 12)
 * ])
 */
export function uieExistsValidator(
  userService: UserService,
  debounceTimeMs: number = 1000,
  requiredDigits: number = 12
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> | Promise<ValidationErrors | null> => {
    // Si no hay valor, retornar null (no hay error)
    if (!control.value) {
      return of(null);
    }

    // Convertir a string si es número
    const uieNumber = typeof control.value === 'string' ? control.value.trim() : control.value.toString().trim();

    if (uieNumber === '') {
      return of(null);
    }

    // Validar formato básico (solo números) antes de hacer la llamada
    const numericRegex = /^\d+$/;
    if (!numericRegex.test(uieNumber)) {
      return of(null); // Si el formato no es válido, no validar existencia
    }

    // ⭐ Solo validar cuando tenga la cantidad exacta de dígitos requeridos
    if (uieNumber.length !== requiredDigits) {
      return of(null); // No validar si no está completo, evita peticiones innecesarias
    }

    // Si el campo tiene un valor inicial y está completo, validar inmediatamente
    // (sin debounce) para detectar duplicados al cargar el formulario
    const isInitialValue = control.pristine && control.untouched;
    const debounce = isInitialValue ? 0 : debounceTimeMs;

    return of(uieNumber).pipe(
      debounceTime(debounce),
      switchMap((uieValue: string) => {
        if (!uieValue || uieValue.trim() === '') {
          return of(null);
        }
        return userService.checkUieExists(uieValue).pipe(
          first(), // Completar el Observable después de la primera emisión
          map((exists: boolean) => {
            // La respuesta del backend es directamente un booleano
            // Log para debugging (remover en producción si es necesario)
            if (exists) {
              console.log(`IUE ${uieValue} ya existe en el sistema`);
            }

            return exists ? { uieExists: true } : null;
          }),
          catchError((error) => {
            // En caso de error de red, no bloquear (retornar null)
            // Pero loguear el error para debugging
            console.error('Error al verificar IUE:', error);
            return of(null);
          })
        );
      })
    );
  };
}

/**
 * Validador asíncrono que verifica si un SDR (Número de Registro del Departamento de Estado) ya existe en el sistema.
 * Solo valida cuando el campo tiene la cantidad exacta de dígitos requeridos para optimizar las peticiones HTTP.
 *
 * @param userService Servicio de usuario para realizar la verificación
 * @param debounceTimeMs Tiempo de espera antes de realizar la validación (default: 1000ms)
 * @param requiredDigits Cantidad exacta de dígitos requeridos para validar (default: 10)
 * @returns AsyncValidatorFn que retorna { sdrExists: true } si el SDR existe, null si no existe
 *
 * @example
 * sdrNumber: new FormControl('', [
 *   Validators.required,
 *   maxDigitsValidator(10)
 * ], [
 *   sdrExistsValidator(this._userService, 1000, 10)
 * ])
 */
export function sdrExistsValidator(
  userService: UserService,
  debounceTimeMs: number = 1000,
  requiredDigits: number = 10
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> | Promise<ValidationErrors | null> => {
    // Si no hay valor, retornar null (no hay error)
    if (!control.value) {
      return of(null);
    }

    // Convertir a string si es número
    const sdrNumber = typeof control.value === 'string' ? control.value.trim() : control.value.toString().trim();

    if (sdrNumber === '') {
      return of(null);
    }

    // Validar formato básico (solo números) antes de hacer la llamada
    const numericRegex = /^\d+$/;
    if (!numericRegex.test(sdrNumber)) {
      return of(null); // Si el formato no es válido, no validar existencia
    }

    // ⭐ Solo validar cuando tenga la cantidad exacta de dígitos requeridos
    if (sdrNumber.length !== requiredDigits) {
      return of(null); // No validar si no está completo, evita peticiones innecesarias
    }

    // Si el campo tiene un valor inicial y está completo, validar inmediatamente
    // (sin debounce) para detectar duplicados al cargar el formulario
    const isInitialValue = control.pristine && control.untouched;
    const debounce = isInitialValue ? 0 : debounceTimeMs;

    return of(sdrNumber).pipe(
      debounceTime(debounce),
      switchMap((sdrValue: string) => {
        if (!sdrValue || sdrValue.trim() === '') {
          return of(null);
        }
        return userService.checkSdrExists(sdrValue).pipe(
          first(), // Completar el Observable después de la primera emisión
          map((exists: boolean) => {
            // La respuesta del backend es directamente un booleano
            // Log para debugging (remover en producción si es necesario)
            if (exists) {
              console.log(`SDR ${sdrValue} ya existe en el sistema`);
            }

            return exists ? { sdrExists: true } : null;
          }),
          catchError((error) => {
            // En caso de error de red, no bloquear (retornar null)
            // Pero loguear el error para debugging
            console.error('Error al verificar SDR:', error);
            return of(null);
          })
        );
      })
    );
  };
}

/**
 * Validador asíncrono que verifica si un EIN (Número de Seguro Social Patronal) ya existe en el sistema.
 * Solo valida cuando el campo tiene la cantidad exacta de dígitos requeridos para optimizar las peticiones HTTP.
 *
 * @param userService Servicio de usuario para realizar la verificación
 * @param debounceTimeMs Tiempo de espera antes de realizar la validación (default: 1000ms)
 * @param requiredDigits Cantidad exacta de dígitos requeridos para validar (default: 9)
 * @returns AsyncValidatorFn que retorna { einExists: true } si el EIN existe, null si no existe
 *
 * @example
 * einNumber: new FormControl('', [
 *   Validators.required,
 *   maxDigitsValidator(9)
 * ], [
 *   einExistsValidator(this._userService, 1000, 9)
 * ])
 */
export function einExistsValidator(
  userService: UserService,
  debounceTimeMs: number = 1000,
  requiredDigits: number = 9
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> | Promise<ValidationErrors | null> => {
    // Si no hay valor, retornar null (no hay error)
    if (!control.value) {
      return of(null);
    }

    // Convertir a string si es número
    const einNumber = typeof control.value === 'string' ? control.value.trim() : control.value.toString().trim();

    if (einNumber === '') {
      return of(null);
    }

    // Validar formato básico (solo números) antes de hacer la llamada
    const numericRegex = /^\d+$/;
    if (!numericRegex.test(einNumber)) {
      return of(null); // Si el formato no es válido, no validar existencia
    }

    // ⭐ Solo validar cuando tenga la cantidad exacta de dígitos requeridos
    if (einNumber.length !== requiredDigits) {
      return of(null); // No validar si no está completo, evita peticiones innecesarias
    }

    // Si el campo tiene un valor inicial y está completo, validar inmediatamente
    // (sin debounce) para detectar duplicados al cargar el formulario
    const isInitialValue = control.pristine && control.untouched;
    const debounce = isInitialValue ? 0 : debounceTimeMs;

    return of(einNumber).pipe(
      debounceTime(debounce),
      switchMap((einValue: string) => {
        if (!einValue || einValue.trim() === '') {
          return of(null);
        }
        return userService.checkEinExists(einValue).pipe(
          first(), // Completar el Observable después de la primera emisión
          map((exists: boolean) => {
            // La respuesta del backend es directamente un booleano
            // Log para debugging (remover en producción si es necesario)
            if (exists) {
              console.log(`EIN ${einValue} ya existe en el sistema`);
            }

            return exists ? { einExists: true } : null;
          }),
          catchError((error) => {
            // En caso de error de red, no bloquear (retornar null)
            // Pero loguear el error para debugging
            console.error('Error al verificar EIN:', error);
            return of(null);
          })
        );
      })
    );
  };
}

