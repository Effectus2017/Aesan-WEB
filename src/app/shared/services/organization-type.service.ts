import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/common/QueryParameters';
import { OrganizationType } from '../models/catalog/OrganizationType';
import { OrganizationTypeRequest } from '../models/request/OrganizationTypeRequest';

@Injectable({
  providedIn: 'root',
})
export class OrganizationTypeService {
  private _organizationTypes: BehaviorSubject<OrganizationType[] | null> = new BehaviorSubject(null);
  private _organizationType: BehaviorSubject<OrganizationType | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/organization-type`;
  private _httpClient = inject(HttpClient);

  constructor() {}

  get organizationTypes$(): Observable<OrganizationType[] | null> {
    return this._organizationTypes.asObservable();
  }

  get organizationType$(): Observable<OrganizationType | null> {
    return this._organizationType.asObservable();
  }

  getOrganizationTypeById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-organization-type-by-id`, getHttpOptions(queryParameters)).pipe(
      tap((response: any) => this._organizationType.next(response))
    );
  }

  /**
   * Obtiene todos los tipos de organización de la base de datos
   * @param queryParameters Los parámetros de consulta
   * @returns Los tipos de organización
   * @note El caché se maneja automáticamente mediante el interceptor HTTP
   */
  getAllOrganizationTypesFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-all-organization-types-from-db`, getHttpOptions(queryParameters)).pipe(
      tap((response: any) => this._organizationTypes.next(response))
    );
  }

  insertOrganizationType(organizationType: OrganizationTypeRequest, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/insert-organization-type`, organizationType, getHttpOptions(queryParameters));
  }

  updateOrganizationType(organizationType: OrganizationType, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-organization-type`, organizationType, getHttpOptions(queryParameters));
  }

  deleteOrganizationType(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-organization-type`, getHttpOptions(queryParameters));
  }

  getOrganizationTypesByProgram(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-organization-types-by-program`, getHttpOptions(queryParameters));
  }
}
