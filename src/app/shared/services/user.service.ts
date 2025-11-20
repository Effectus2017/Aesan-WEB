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
}

