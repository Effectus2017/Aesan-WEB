import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { environment } from 'environments/environment';
import { QueryParameters } from '../models/QueryParameters';
import { Role, RequestUser } from '../../modules/admin-portal/users/users.types';
import { handleError } from '../utils';
import { getHttpOptions } from '../utils';
import { TokenResponse } from '../models/user.types';
import { UserAgencyRequest } from '../models/Request/UserAgencyRequest';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  // Private
  private _users: BehaviorSubject<RequestUser[] | null> = new BehaviorSubject(null);
  private _user: BehaviorSubject<RequestUser | null> = new BehaviorSubject(null);

  private _roles: BehaviorSubject<Role[] | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/user`;

  constructor(private _httpClient: HttpClient) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Getter for Users
   */
  get users$(): Observable<RequestUser[]> {
    return this._users.asObservable();
  }

  get user$(): Observable<RequestUser> {
    return this._user.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  get roles$(): Observable<Role[]> {
    return this._roles.asObservable();
  }

  get getPassword(): string {
    return localStorage.getItem('password') ?? '';
  }

  set setPassword(password: any) {
    localStorage.setItem('password', password);
  }

  removePassword() {
    localStorage.removeItem('password');
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Obtiene un usuario por su ID desde la base de datos
   * @param requestParameters Parámetros de la solicitud
   * @returns Observable<any>
   */
  getUserByIdFromDb(requestParameters: QueryParameters): Observable<any> {
    return <Observable<any>>this._httpClient.get<any>(`${this.apiUrl}` + '/get-user-by-id', getHttpOptions(requestParameters)).pipe(
      tap((response: any) => {
        this._user.next(response);
      }),
      catchError(handleError)
    );
  }

  /**
   * Obtiene todos los usuarios desde la base de datos
   * @param requestParameters Parámetros de la solicitud
   * @returns Observable<any>
   */
  getAllUsersFromDb(requestParameters: QueryParameters): Observable<any> {
    return <Observable<any>>this._httpClient.get<any>(`${this.apiUrl}` + '/get-all-users-from-db', getHttpOptions(requestParameters)).pipe(
      tap((response: any) => {
        this._users.next(response);
      }),
      catchError(handleError)
    );
  }

  /**
   * Obtiene todos los usuarios desde la base de datos con SP
   * @param requestParameters Parámetros de la solicitud
   * @returns Observable<any>
   */
  getAllUsersFromDbWithSP(requestParameters: QueryParameters): Observable<any> {
    return <Observable<any>>this._httpClient.get<any>(`${this.apiUrl}` + '/get-all-users-from-db-with-sp', getHttpOptions(requestParameters)).pipe(
      tap((response: any) => {
        this._users.next(response);
      }),
      catchError(handleError)
    );
  }

  /**
   * Obtiene todos los roles desde la base de datos
   * @param requestParameters Parámetros de la solicitud
   * @returns Observable<Role[]>
   */
  getAllRolesFromDb(requestParameters: QueryParameters): Observable<Role[]> {
    return <Observable<any>>this._httpClient.get<any>(`${this.apiUrl}` + '/get-all-roles-from-db', getHttpOptions(requestParameters)).pipe(
      tap((response: any) => {
        this._roles.next(response);
      }),
      catchError(handleError)
    );
  }

  /**
   * Agrega un usuario a la base de datos
   * @param param Parámetros del usuario
   * @param requestParameters Parámetros de la solicitud
   * @returns Observable<any>
   */
  add(param: RequestUser, requestParameters: QueryParameters): Observable<any> {
    return <Observable<any>>this._httpClient.post<any>(`${this.apiUrl}` + '/add-user-to-db', param, getHttpOptions(requestParameters)).pipe(catchError(handleError));
  }

  /**
   * Agrega un usuario a la base de datos
   * @param param Parámetros del usuario
   * @param requestParameters Parámetros de la solicitud
   * @returns Observable<any>
   */
  update(param: RequestUser, requestParameters: QueryParameters): Observable<any> {
    return <Observable<any>>this._httpClient.put<any>(`${this.apiUrl}` + '/update-user-from-db', param, getHttpOptions(requestParameters)).pipe(catchError(handleError));
  }

  /**
   * Elimina un usuario de la base de datos
   * @param requestParameters Parámetros de la solicitud
   * @returns Observable<any>
   */
  delete(requestParameters: QueryParameters): Observable<any> {
    return <Observable<any>>this._httpClient.delete<any>(`${this.apiUrl}` + '/delete-user-from-db', getHttpOptions(requestParameters)).pipe(catchError(handleError));
  }

  /**
   * Cambia la contraseña de un usuario, solo para uso del usuario
   * @param requestParameters Parámetros de la solicitud
   * @returns Observable<any>
   */
  changePassword(requestParameters: QueryParameters): Observable<any> {
    return <Observable<any>>this._httpClient.post<any>(`${this.apiUrl}` + '/change-password', null, getHttpOptions(requestParameters)).pipe(catchError(handleError));
  }

  /**
   * Resetea la contraseña de un usuario, solo para uso del administrador
   * @param requestParameters Parámetros de la solicitud
   * @returns Observable<any>
   */
  resetPassword(requestParameters: QueryParameters): Observable<any> {
    return <Observable<any>>this._httpClient.post<any>(`${this.apiUrl}` + '/reset-password', null, getHttpOptions(requestParameters)).pipe(catchError(handleError));
  }

  /**
   * Forza una nueva contraseña para un usuario, solo para uso del administrador
   * @param requestParameters Parámetros de la solicitud
   * @returns Observable<any>
   */
  forcePassword(requestParameters: QueryParameters): Observable<any> {
    return <Observable<any>>this._httpClient.post<any>(`${this.apiUrl}` + '/force-password', null, getHttpOptions(requestParameters)).pipe(catchError(handleError));
  }

  /**
   * Actualiza la contraseña temporal de un usuario
   * @param requestParameters Parámetros de la solicitud
   * @returns Observable<any>
   */
  updateTemporalPassword(requestParameters: QueryParameters): Observable<any> {
    return <Observable<any>>this._httpClient.post<any>(`${this.apiUrl}` + '/update-temporal-password', null, getHttpOptions(requestParameters)).pipe(catchError(handleError));
  }

  /**
   * Por si el usuario se olvida su contraseña, se le envia un correo con la contraseña temporal
   * @param requestParameters Parámetros de la solicitud
   * @returns Observable<any>
   */
  forgotPassword(requestParameters: QueryParameters): Observable<any> {
    return <Observable<any>>this._httpClient.post<any>(`${this.apiUrl}` + '/forgot-password', null, getHttpOptions(requestParameters)).pipe(catchError(handleError));
  }

  /**
   * Limpia el estado del usuario actual
   */
  clearState(): void {
    this._user.next(null);
  }

  /**
   * Establece el usuario actual.
   * @param value El usuario a establecer.
   */
  set user(value: TokenResponse) {
    this._user.next(value);
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
   * Valida un token de restablecimiento de contraseña.
   * @param queryParameters Los parámetros de consulta que incluyen el email y token.
   * @returns Un observable que emite el resultado de la validación.
   */
  validateResetToken(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/validate-reset-token`, null, getHttpOptions(queryParameters)).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Restablece la contraseña usando un token válido.
   * @param queryParameters Los parámetros de consulta que incluyen el email, token y nueva contraseña.
   * @returns Un observable que emite el resultado de la operación.
   */
  resetPasswordWithToken(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/reset-password-with-token`, null, getHttpOptions(queryParameters)).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }
}
