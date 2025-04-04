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
import { UploadService } from './upload.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  // Private
  private _users: BehaviorSubject<RequestUser[] | null> = new BehaviorSubject(null);
  private _user: BehaviorSubject<RequestUser | null> = new BehaviorSubject(null);

  private _roles: BehaviorSubject<Role[] | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/user`;

  constructor(
    private _httpClient: HttpClient,
    private _uploadService: UploadService
  ) {}

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
   * Inicia el proceso de recuperación de contraseña
   * @param queryParameters Contiene el correo electrónico del usuario
   * @returns Observable con el resultado de la operación
   */
  forgotPassword(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/forgot-password`, null, getHttpOptions(queryParameters));
  }

  /**
   * Valida un token de restablecimiento de contraseña
   * @param queryParameters Contiene el correo y el token a validar
   * @returns Observable con el resultado de la validación
   */
  validateResetToken(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/validate-reset-token`, null, getHttpOptions(queryParameters));
  }

  /**
   * Restablece la contraseña usando un token válido
   * @param queryParameters Contiene el correo, el token y la nueva contraseña
   * @returns Observable con el resultado de la operación
   */
  resetPasswordWithToken(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/reset-password-with-token`, null, getHttpOptions(queryParameters));
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
   * Actualiza el avatar del usuario.
   * @param userId El ID del usuario.
   * @param imageUrl La URL de la imagen del avatar.
   * @returns Un observable que emite el resultado de la operación.
   */
  updateUserAvatar(userId: string, imageUrl: string): Observable<any> {
    // Limpia la URL de escape de barras invertidas que pueden causar problemas
    const cleanImageUrl = this._uploadService.normalizeImageUrl(imageUrl);

    const requestBody = {
      userId: userId,
      imageUrl: cleanImageUrl
    };
    return this._httpClient.put(`${this.apiUrl}/update-user-avatar`, requestBody).pipe(
      catchError(handleError)
    );
  }
}
