import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, switchMap, map, catchError, first } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import { QueryParameters } from '../models/QueryParameters';

/**
 * Validador asíncrono que verifica si un correo electrónico ya existe en el sistema
 * (tanto en la tabla User/AspNetUsers como en Staff).
 * 
 * @param userService Servicio de usuario para realizar la verificación
 * @param excludeEmail Email a excluir de la validación (útil en formularios de edición)
 * @param debounceTime Tiempo de espera antes de realizar la validación (default: 500ms)
 * @returns AsyncValidatorFn que retorna { emailExists: true } si el email existe, null si no existe
 * 
 * @example
 * // Para formularios de creación
 * email: new FormControl('', [
 *   Validators.required, 
 *   Validators.email
 * ], [
 *   emailExistsValidator(this._userService)
 * ])
 * 
 * @example
 * // Para formularios de edición (excluyendo el email actual)
 * email: new FormControl('', [
 *   Validators.required, 
 *   Validators.email
 * ], [
 *   emailExistsValidator(this._userService, currentEmail)
 * ])
 */
export function emailExistsValidator(
  userService: UserService,
  excludeEmail?: string,
  debounceTimeMs: number = 500
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> | Promise<ValidationErrors | null> => {
    // Si no hay valor, retornar null (no hay error)
    if (!control.value || typeof control.value !== 'string' || control.value.trim() === '') {
      return of(null);
    }

    const email = control.value.trim().toLowerCase();

    // Validar formato básico de email antes de hacer la llamada
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return of(null); // Si el formato no es válido, no validar existencia
    }

    // Si el email es el mismo que el excluido, no validar
    if (excludeEmail && email === excludeEmail.trim().toLowerCase()) {
      return of(null);
    }

    return of(email).pipe(
      debounceTime(debounceTimeMs),
      switchMap((emailValue: string) => {
        if (!emailValue || emailValue.trim() === '') {
          return of(null);
        }
        
        const queryParameters: QueryParameters = {
          email: emailValue,
        };
        
        return userService.checkEmailExists(queryParameters).pipe(
          first(), // Completar el Observable después de la primera emisión
          map((response: any) => {
            // Extraer el body del HttpResponse si viene como objeto completo
            const exists = response?.body !== undefined ? response.body : response;
            // Solo retornar el objeto cuando existe es true, null cuando es false
            return exists === true ? { emailExists: true } : null;
          }),
          catchError(() => {
            // En caso de error de red, no bloquear (retornar null)
            return of(null);
          })
        );
      })
    );
  };
}

