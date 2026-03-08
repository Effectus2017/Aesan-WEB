import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/common/QueryParameters';
import { Permission } from '../models/user/Permission';
import { PermissionRequest } from '../models/request/PermissionRequest';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private _permissions: BehaviorSubject<Permission[] | null> = new BehaviorSubject(null);
  private _permissionsUser: BehaviorSubject<Permission[] | null> = new BehaviorSubject(null);
  private _permission: BehaviorSubject<Permission | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/permission`;
  private _httpClient = inject(HttpClient);

  get permissions$(): Observable<Permission[] | null> {
    return this._permissions.asObservable();
  }

  get permission$(): Observable<Permission | null> {
    return this._permission.asObservable();
  }

  get permissionsUser$(): Observable<Permission[] | null> {
    return this._permissionsUser.asObservable();
  }

  /**
   * Obtiene un permiso por su ID
   * @param queryParameters Parámetros de consulta
   * @returns Observable con el permiso
   */
  getPermissionById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-permission-by-id`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._permission.next(response)));
  }

  /**
   * Obtiene un permiso por su ValueKey
   * @param queryParameters Parámetros de consulta
   * @returns Observable con el permiso
   */
  getPermissionByValueKey(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-permission-by-value-key`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._permission.next(response)));
  }

  /**
   * Obtiene todos los permisos de la base de datos
   * @param queryParameters Parámetros de consulta
   * @returns Observable con la lista de permisos
   */
  getAllPermissionsFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-all-permissions-from-db`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._permissions.next(response)));
  }

  /**
   * Inserta un permiso
   * @param permission Permiso a insertar
   * @param queryParameters Parámetros de consulta
   * @returns Observable con el permiso insertado
   */
  insertPermission(permission: PermissionRequest, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/insert-permission`, permission, getHttpOptions(queryParameters));
  }

  /**
   * Actualiza un permiso
   * @param permission Permiso a actualizar
   * @param queryParameters Parámetros de consulta
   * @returns Observable con el permiso actualizado
   */
  updatePermission(permission: Permission, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-permission`, permission, getHttpOptions(queryParameters));
  }

  /**
   * Elimina un permiso
   * @param queryParameters Parámetros de consulta
   * @returns Observable con el permiso eliminado
   */
  deletePermission(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-permission`, getHttpOptions(queryParameters));
  }

  // ------------------------------
  // Asignación de permisos a usuarios y roles
  // ------------------------------

  /**
   * Asigna un permiso a un usuario
   * @param queryParameters Parámetros de consulta
   * @returns Observable con el permiso asignado
   */
  assignPermissionToUser(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/assign-permission-to-user`, null, getHttpOptions(queryParameters));
  }

  /**
   * Elimina un permiso de un usuario
   * @param queryParameters Parámetros de consulta
   * @returns Observable con el permiso eliminado
   */
  removePermissionFromUser(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/remove-permission-from-user`, getHttpOptions(queryParameters));
  }

  /**
   * Asigna un permiso a un rol
   * @param queryParameters Parámetros de consulta
   * @returns Observable con el permiso asignado
   */
  assignPermissionToRole(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/assign-permission-to-role`, null, getHttpOptions(queryParameters));
  }

  /**
   * Elimina un permiso de un rol
   * @param queryParameters Parámetros de consulta
   * @returns Observable con el permiso eliminado
   */
  removePermissionFromRole(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/remove-permission-from-role`, getHttpOptions(queryParameters));
  }

  /**
   * Obtiene los permisos de un usuario
   * @param queryParameters Parámetros de consulta
   * @returns Observable con los permisos del usuario
   */
  getUserPermissions(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-user-permissions`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._permissionsUser.next(response)));
  }

}
