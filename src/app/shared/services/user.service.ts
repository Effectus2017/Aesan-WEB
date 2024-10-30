import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { environment } from 'environments/environment';
import { TokenUser } from '../models/user.types';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/QueryParameters';

/**
 * Servicio para interactuar con los usuarios y sus datos.
 * Programas, roles, usuarios, etc.
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private _user: ReplaySubject<TokenUser> = new ReplaySubject<TokenUser>(1);

  private apiUrl = `${environment.baseHttpUrl}/user`;

  // Inyección del HttpClient
  private _httpClient = inject(HttpClient);

  /**
   * Establece el usuario actual.
   * @param value El usuario a establecer.
   */
  set user(value: TokenUser)
  {
      this._user.next(value);
  }

  /**
   * Obtiene un observable que emite el usuario actual.
   * @returns Un observable que emite el usuario actual.
   */
  get user$(): Observable<TokenUser>
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
   * Obtiene todos los programas desde la base de datos.
   * @param queryParameters Los parámetros de consulta para la paginación y filtrado.
   * @returns Un observable que emite todos los programas obtenidos.
   */
  getAllProgramsFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-all-programs-from-db`, getHttpOptions(queryParameters));
  }

  /**
   * Registra un usuario y una agencia.
   * @param model El modelo que contiene los datos del usuario y la agencia.
   * @returns Un observable que emite el resultado de la operación.
   */
  registerUserAgency(model: any): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/register-user-agency`, model);
  }
}

