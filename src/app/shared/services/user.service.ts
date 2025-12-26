import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, ReplaySubject, tap, throwError } from 'rxjs';
import { environment } from 'environments/environment';
import { TokenResponse } from '../models/user.types';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/QueryParameters';
import { UserAgencyRequest } from '../models/Request/UserAgencyRequest';

/**
 * Servicio para interactuar con los usuarios y sus datos.
 * Programas, roles, usuarios, etc.
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private _user: ReplaySubject<TokenResponse> = new ReplaySubject<TokenResponse>(1);

  private apiUrl = `${environment.baseHttpUrl}/user`;

  // Inyección del HttpClient
  private _httpClient = inject(HttpClient);

  /**
   * Establece el usuario actual.
   * @param value El usuario a establecer.
   */
  set user(value: TokenResponse)
  {
      this._user.next(value);
  }

  /**
   * Obtiene un observable que emite el usuario actual.
   * @returns Un observable que emite el usuario actual.
   */
  get user$(): Observable<TokenResponse>
  {
      return this._user.asObservable();
  }

  /**
   * Obtiene un usuario por su ID.
   * @param queryParameters Los parámetros de consulta que incluyen el ID del usuario.
   * @returns Un observable que emite el usuario obtenido.
   */
  getUserById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-user-by-id`, getHttpOptions(queryParameters));
  }

  /**
   * Obtiene todos los usuarios desde la base de datos.
   * @param queryParameters Los parámetros de consulta para la paginación y filtrado.
   * @returns Un observable que emite todos los usuarios obtenidos.
   */
  getAllUsersFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-all-users-from-db`, getHttpOptions(queryParameters));
  }

  /**
   * Obtiene todos los roles desde la base de datos.
   * @returns Un observable que emite todos los roles obtenidos.
   */
  getAllRolesFromDb(): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-all-roles-from-db`);
  }

  /**
   * Registra un usuario y una agencia.
   * @param model El modelo que contiene los datos del usuario y la agencia.
   * @returns Un observable que emite el resultado de la operación.
   */
  registerUserAgency(model: UserAgencyRequest, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/register-user-agency`, model, getHttpOptions(queryParameters)).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Verifica si un correo electrónico ya existe en el sistema.
   * @param email El correo electrónico a verificar.
   * @returns Un observable que emite un objeto con la propiedad exists (true/false).
   */
  checkEmailExists(email: string): Observable<{ exists: boolean }> {
    const queryParameters: QueryParameters = {
      email: email,
    };
    return this._httpClient.get<{ exists: boolean }>(`${this.apiUrl}/check-email-exists`, getHttpOptions(queryParameters)).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Verifica si un IUE (Identificador Único de Entidad) ya existe en el sistema.
   * @param uieNumber El número IUE a verificar.
   * @returns Un observable que emite un booleano (true si existe, false si no existe).
   */
  checkUieExists(uieNumber: string): Observable<boolean> {
    // Validar que el número sea válido antes de hacer la petición
    if (!uieNumber || uieNumber.trim() === '') {
      return throwError(() => new Error('El número IUE es requerido'));
    }
    
    // Usar Number() en lugar de parseInt() para manejar números grandes correctamente
    // Number() maneja mejor los números grandes que parseInt()
    const parsedNumber = Number(uieNumber.trim());
    
    // Verificar que sea un número válido
    if (isNaN(parsedNumber)) {
      return throwError(() => new Error('El número IUE debe ser un número válido'));
    }
    
    const queryParameters: QueryParameters = {
      uieNumber: parsedNumber,
    };
    return this._httpClient.get<boolean>(`${this.apiUrl}/check-uie-exists`, getHttpOptions(queryParameters)).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Verifica si un SDR (Número de Registro del Departamento de Estado) ya existe en el sistema.
   * @param sdrNumber El número SDR a verificar.
   * @returns Un observable que emite un booleano (true si existe, false si no existe).
   */
  checkSdrExists(sdrNumber: string): Observable<boolean> {
    // Validar que el número sea válido antes de hacer la petición
    if (!sdrNumber || sdrNumber.trim() === '') {
      return throwError(() => new Error('El número SDR es requerido'));
    }
    
    // Usar Number() en lugar de parseInt() para manejar números grandes correctamente
    const parsedNumber = Number(sdrNumber.trim());
    
    // Verificar que sea un número válido
    if (isNaN(parsedNumber)) {
      return throwError(() => new Error('El número SDR debe ser un número válido'));
    }
    
    const queryParameters: QueryParameters = {
      sdrNumber: parsedNumber,
    };
    return this._httpClient.get<boolean>(`${this.apiUrl}/check-sdr-exists`, getHttpOptions(queryParameters)).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Verifica si un EIN (Número de Seguro Social Patronal) ya existe en el sistema.
   * @param einNumber El número EIN a verificar.
   * @returns Un observable que emite un booleano (true si existe, false si no existe).
   */
  checkEinExists(einNumber: string): Observable<boolean> {
    // Validar que el número sea válido antes de hacer la petición
    if (!einNumber || einNumber.trim() === '') {
      return throwError(() => new Error('El número EIN es requerido'));
    }
    
    // Usar Number() en lugar de parseInt() para manejar números grandes correctamente
    const parsedNumber = Number(einNumber.trim());
    
    // Verificar que sea un número válido
    if (isNaN(parsedNumber)) {
      return throwError(() => new Error('El número EIN debe ser un número válido'));
    }
    
    const queryParameters: QueryParameters = {
      einNumber: parsedNumber,
    };
    return this._httpClient.get<boolean>(`${this.apiUrl}/check-ein-exists`, getHttpOptions(queryParameters)).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }
}

