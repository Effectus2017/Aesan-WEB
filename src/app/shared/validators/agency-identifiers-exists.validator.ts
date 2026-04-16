import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, switchMap, map, catchError, first } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import { QueryParameters } from '../models/common/QueryParameters';

const IUE_ALPHANUMERIC_12 = /^[A-Za-z0-9]{12}$/;

/**
 * Validador asíncrono que verifica si un IUE (Identificador Único de Entidad) ya existe en el sistema.
 * Solo valida cuando el campo tiene exactamente 12 caracteres alfanuméricos (para reducir peticiones HTTP).
 *
 * @param userService Servicio de usuario para realizar la verificación
 * @param debounceTimeMs Tiempo de espera antes de realizar la validación (default: 1000ms)
 * @param excludeNormalizedUie IUE normalizado (trim + mayúsculas) que no debe considerarse duplicado (p. ej. edición de la misma agencia)
 * @returns AsyncValidatorFn que retorna { uieExists: true } si el IUE existe, null si no existe
 *
 * @example
 * uieNumber: new FormControl('', [
 *   Validators.required,
 *   Validators.minLength(12),
 *   Validators.maxLength(12),
 *   alphanumericValidator()
 * ], [
 *   uieExistsValidator(this._userService, 1000)
 * ])
 */
export function uieExistsValidator(
  userService: UserService,
  debounceTimeMs: number = 1000,
  excludeNormalizedUie?: string | null
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> | Promise<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }

    if (typeof control.value !== 'string') {
      return of(null);
    }

    const uieNumber = control.value.trim();

    if (uieNumber === '' || !IUE_ALPHANUMERIC_12.test(uieNumber)) {
      return of(null);
    }

    const normalized = uieNumber.toUpperCase();
    const excluded =
      excludeNormalizedUie != null && String(excludeNormalizedUie).trim() !== ''
        ? String(excludeNormalizedUie).trim().toUpperCase()
        : null;
    if (excluded !== null && normalized === excluded) {
      return of(null);
    }

    const isInitialValue = control.pristine && control.untouched;
    const debounce = isInitialValue ? 0 : debounceTimeMs;

    return of(uieNumber).pipe(
      debounceTime(debounce),
      switchMap((uieValue: string) => {
        if (!uieValue || uieValue.trim() === '' || !IUE_ALPHANUMERIC_12.test(uieValue.trim())) {
          return of(null);
        }

        const nv = uieValue.trim().toUpperCase();
        const ex =
          excludeNormalizedUie != null && String(excludeNormalizedUie).trim() !== ''
            ? String(excludeNormalizedUie).trim().toUpperCase()
            : null;
        if (ex !== null && nv === ex) {
          return of(null);
        }

        const queryParameters: QueryParameters = {
          uieNumber: nv,
        };

        return userService.checkUieExists(queryParameters).pipe(
          first(),
          map((response: unknown) => {
            const exists = (response as { body?: boolean })?.body !== undefined ? (response as { body: boolean }).body : response;
            return exists === true ? { uieExists: true } : null;
          }),
          catchError(() => of(null))
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

        // Convertir a número (las validaciones ya se hicieron arriba)
        const parsedNumber = Number(sdrValue.trim());

        const queryParameters: QueryParameters = {
          sdrNumber: parsedNumber,
        };

        return userService.checkSdrExists(queryParameters).pipe(
          first(), // Completar el Observable después de la primera emisión
          map((response: any) => {
            // Extraer el body del HttpResponse si viene como objeto completo
            const exists = response?.body !== undefined ? response.body : response;
            console.log('SDR - Valor recibido del backend:', exists, 'Tipo:', typeof exists);
            console.log('SDR - exists === true:', exists === true);
            console.log('SDR - exists === false:', exists === false);
            // Solo retornar el objeto cuando existe es true, null cuando es false
            const result = exists === true ? { sdrExists: true } : null;
            console.log('SDR - Resultado del validador:', result);
            return result;
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

        // Convertir a número (las validaciones ya se hicieron arriba)
        const parsedNumber = Number(einValue.trim());

        const queryParameters: QueryParameters = {
          einNumber: parsedNumber,
        };

        return userService.checkEinExists(queryParameters).pipe(
          first(), // Completar el Observable después de la primera emisión
          map((response: any) => {
            // Extraer el body del HttpResponse si viene como objeto completo
            const exists = response?.body !== undefined ? response.body : response;
            console.log('EIN - Valor recibido del backend:', exists, 'Tipo:', typeof exists);
            console.log('EIN - exists === true:', exists === true);
            console.log('EIN - exists === false:', exists === false);
            // Solo retornar el objeto cuando existe es true, null cuando es false
            const result = exists === true ? { einExists: true } : null;
            console.log('EIN - Resultado del validador:', result);
            return result;
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

