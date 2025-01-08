import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/QueryParameters';
import { OrganizationType } from '../models/OrganizationType';

@Injectable({
  providedIn: 'root',
})
export class OrganizationTypeService {
  private _organizationTypes: BehaviorSubject<OrganizationType[] | null> = new BehaviorSubject(null);
  private _organizationType: BehaviorSubject<OrganizationType | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/organization-type`;
  private _httpClient = inject(HttpClient);

  constructor() {}

  /**
   * Obtiene todos los tipos de organización
   * @returns Los tipos de organización
   */
  get organizationTypes$(): Observable<OrganizationType[] | null> {
    return this._organizationTypes.asObservable();
  }

  /**
   * Obtiene un tipo de organización
   * @returns El tipo de organización
   */
  get organizationType$(): Observable<OrganizationType | null> {
    return this._organizationType.asObservable();
  }

  /**
   * Obtiene un tipo de organización por su ID
   * @param queryParameters Los parámetros de consulta
   * @returns El tipo de organización
   */
  getOrganizationTypeById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-organization-type-by-id`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._organizationType.next(response)));
  }

  /**
   * Obtiene todos los tipos de organización de la base de datos
   * @param queryParameters Los parámetros de consulta
   * @returns Los tipos de organización
   */
  getAllOrganizationTypesFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-all-organization-types-from-db`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._organizationTypes.next(response)));
  }

  /**
   * Inserta un tipo de organización
   * @param organizationType El tipo de organización
   * @param queryParameters Los parámetros de consulta
   * @returns El tipo de organización insertado
   */
  insertOrganizationType(organizationType: OrganizationType, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/insert-organization-type`, organizationType, getHttpOptions(queryParameters));
  }

  /**
   * Actualiza un tipo de organización
   * @param organizationType El tipo de organización
   * @param queryParameters Los parámetros de consulta
   * @returns El tipo de organización actualizado
   */
  updateOrganizationType(organizationType: OrganizationType, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-organization-type`, organizationType, getHttpOptions(queryParameters));
  }

  /**
   * Elimina un tipo de organización
   * @param queryParameters Los parámetros de consulta
   * @returns True si se eliminó correctamente
   */
  deleteOrganizationType(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-organization-type`, getHttpOptions(queryParameters));
  }
}
