import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map, catchError, throwError } from 'rxjs';
import { environment } from 'environments/environment';
import { QueryParameters } from '../models/QueryParameters';
import { DTORole, RequestUser } from '../../modules/admin-portal/users/users.types';
import { getHttpOptions, handleError } from '../utils';
import { TokenResponse } from '../models/user.types';
import { UserAgencyRequest } from '../models/Request/UserAgencyRequest';
import { UploadService } from './upload.service';

export type { DTORole };

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private _users: BehaviorSubject<RequestUser[] | null> = new BehaviorSubject(null);
  /** Usuario actual: puede ser TokenResponse (login) o RequestUser (get-user-by-id, edit). */
  private _user: BehaviorSubject<RequestUser | TokenResponse | null> = new BehaviorSubject(null);
  private _roles: BehaviorSubject<any | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/user`;
  private authApiUrl = `${environment.baseHttpUrl}/auth`;
  private _httpClient = inject(HttpClient);
  private _uploadService = inject(UploadService);

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Getter for Users
   */
  get users$(): Observable<RequestUser[]> {
    return this._users.asObservable();
  }

  get user$(): Observable<RequestUser | TokenResponse | null> {
    return this._user.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  get roles$(): Observable<any> {
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
    return this._httpClient.get(`${this.apiUrl}/get-user-by-id`, getHttpOptions(requestParameters))
      .pipe(tap((response: any) => this._user.next(response)));
  }

  /**
   * Obtiene un usuario por su ID usando Stored Procedure
   * @param requestParameters Parámetros de la solicitud
   * @returns Observable<any>
   */
  getUserByIdWithSP(requestParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-user-by-id-with-sp`, getHttpOptions(requestParameters))
      .pipe(tap((response: any) => this._user.next(response)));
  }

  /**
   * Obtiene todos los usuarios desde la base de datos
   * @param requestParameters Parámetros de la solicitud
   * @returns Observable<any>
   */
  getAllUsersFromDb(requestParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-all-users-from-db`, getHttpOptions(requestParameters))
      .pipe(tap((response: any) => this._users.next(response)));
  }

  /**
   * Obtiene todos los usuarios desde la base de datos con SP
   * @param requestParameters Parámetros de la solicitud
   * @returns Observable<any>
   */
  getAllUsersFromDbWithSP(requestParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-all-users-from-db-with-sp`, getHttpOptions(requestParameters))
      .pipe(tap((response: any) => this._users.next(response)));
  }

  /**
   * Obtiene todos los roles desde la base de datos. Respuesta unificada { data, count } en body.
   * @param requestParameters Parámetros (take, skip, aesanOnly, etc.). Se pasan al API como query params.
   * @returns Observable con la respuesta completa (HttpResponse); los datos en response.body.
   */
  getAllRolesFromDb(requestParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get<any>(`${this.apiUrl}/get-all-roles-from-db`, getHttpOptions(requestParameters))
      .pipe(
        tap((response: any) => this._roles.next(response)),
        catchError(handleError)
      );
  }

  /**
   * Obtiene solo los nombres de roles AESAN (para add/edit usuario). Llama getAllRolesFromDb con aesanOnly.
   */
  getAesanRoleNames(): Observable<string[]> {
    return this.getAllRolesFromDb({ aesanOnly: true }).pipe(
      map((response: any) => (response?.body?.data ?? []).map((r: any) => r?.name ?? r?.Name ?? ''))
    );
  }

  /**
   * Obtiene roles AESAN disponibles para asignar como roles secundarios.
   * El backend excluye automáticamente el rol primario y roles secundarios ya asignados.
   * @param primaryRoleId ID del rol primario a excluir (opcional)
   * @param excludeRoleIds Lista de IDs de roles secundarios ya asignados a excluir (opcional)
   * @returns Observable con la respuesta completa (HttpResponse); los datos en response.body.
   */
  getAvailableSecondaryRoles(primaryRoleId?: string, excludeRoleIds?: string[]): Observable<any> {
    const params: any = {};
    if (primaryRoleId) params.primaryRoleId = primaryRoleId;
    if (excludeRoleIds && excludeRoleIds.length > 0) {
      excludeRoleIds.forEach((id, index) => {
        params[`excludeRoleIds[${index}]`] = id;
      });
    }
    return this._httpClient
      .get<any>(`${this.apiUrl}/get-available-secondary-roles`, getHttpOptions(params))
      .pipe(catchError(handleError));
  }

  /**
   * Obtiene todos los roles asignados a un usuario específico (primario + secundarios activos).
   * @param userId ID del usuario
   * @returns Observable con la respuesta completa (HttpResponse); los datos en response.body.
   */
  getUserRoles(userId: string): Observable<any> {
    return this._httpClient
      .get<any>(`${this.apiUrl}/get-user-roles/${userId}`, getHttpOptions({}))
      .pipe(catchError(handleError));
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
   * Actualiza un usuario usando Stored Procedure
   * @param param Parámetros del usuario
   * @param requestParameters Parámetros de la solicitud
   * @returns Observable<any>
   */
  updateWithSP(param: RequestUser, requestParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-user-from-db-with-sp`, param, getHttpOptions(requestParameters));
  }

  /**
   * Actualiza un usuario (método original mantenido para compatibilidad)
   * @param param Parámetros del usuario
   * @param requestParameters Parámetros de la solicitud
   * @returns Observable<any>
   */
  update(param: RequestUser, requestParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-user-from-db`, param, getHttpOptions(requestParameters));
  }

  /**
   * Solicita extensión de vigencia de un rol secundario temporal.
   * @param body roleName (rol actual), requestedValidTo (ISO date), reason (opcional)
   * @param requestParameters debe incluir currentUserId
   */
  requestRoleExtension(
    body: { roleName: string; requestedValidTo: string; reason?: string },
    requestParameters: QueryParameters
  ): Observable<{ id?: number; message?: string }> {
    return this._httpClient
      .post<{ id?: number; message?: string }>(`${this.apiUrl}/role-extension-request`, body, getHttpOptions(requestParameters))
      .pipe(catchError(handleError));
  }

  /**
   * Lista solicitudes de extensión de rol (admin). status: Pending | Approved | Rejected | null (todas).
   */
  getRoleExtensionRequests(params: { status?: string; take?: number; skip?: number }): Observable<any> {
    const q = new URLSearchParams();
    if (params.status != null) q.set('status', params.status);
    if (params.take != null) q.set('take', String(params.take));
    if (params.skip != null) q.set('skip', String(params.skip));
    const query = q.toString();
    return this._httpClient.get<{ data: any[]; total: number }>(
      `${this.apiUrl}/role-extension-requests${query ? '?' + query : ''}`,
      getHttpOptions({})
    ).pipe(catchError(handleError));
  }

  /**
   * Aprobar solicitud de extensión (admin). body opcional: { newValidTo: string (ISO date) }.
   */
  approveRoleExtensionRequest(id: number, body: { newValidTo?: string } | null, requestParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/role-extension-requests/${id}/approve`, body ?? {}, getHttpOptions(requestParameters)).pipe(catchError(handleError));
  }

  /**
   * Rechazar solicitud de extensión (admin).
   */
  rejectRoleExtensionRequest(id: number, requestParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/role-extension-requests/${id}/reject`, {}, getHttpOptions(requestParameters)).pipe(catchError(handleError));
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
