import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/QueryParameters';
import { AgencyStatus } from '../models/AgencyStatus';

@Injectable({
  providedIn: 'root',
})
export class AgencyStatusService {
  private _agencyStatuses: BehaviorSubject<AgencyStatus[] | null> = new BehaviorSubject(null);
  private _agencyStatus: BehaviorSubject<AgencyStatus | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/agency-status`;
  private _httpClient = inject(HttpClient);

  constructor() {}

  /**
   * Obtiene todos los estados de agencia
   * @returns Los estados de agencia
   */
  get agencyStatuses$(): Observable<AgencyStatus[] | null> {
    return this._agencyStatuses.asObservable();
  }

  /**
   * Obtiene un estado de agencia
   * @returns El estado de agencia
   */
  get agencyStatus$(): Observable<AgencyStatus | null> {
    return this._agencyStatus.asObservable();
  }

  /**
   * Obtiene un estado de agencia por su ID
   * @param queryParameters Los parámetros de consulta
   * @returns El estado de agencia
   */
  getAgencyStatusById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-agency-status-by-id`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._agencyStatus.next(response)));
  }

  /**
   * Obtiene todos los estados de agencia de la base de datos
   * @param queryParameters Los parámetros de consulta
   * @returns Los estados de agencia
   */
  getAllAgencyStatusFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-all-agency-status-from-db`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._agencyStatuses.next(response)));
  }

  /**
   * Inserta un estado de agencia
   * @param agencyStatus El estado de agencia
   * @param queryParameters Los parámetros de consulta
   * @returns El estado de agencia insertado
   */
  insertAgencyStatus(agencyStatus: AgencyStatus, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/insert-agency-status`, agencyStatus, getHttpOptions(queryParameters));
  }

  /**
   * Actualiza un estado de agencia
   * @param agencyStatus El estado de agencia
   * @param queryParameters Los parámetros de consulta
   * @returns El estado de agencia actualizado
   */
  updateAgencyStatus(agencyStatus: AgencyStatus, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-agency-status`, agencyStatus, getHttpOptions(queryParameters));
  }

  /**
   * Elimina un estado de agencia
   * @param queryParameters Los parámetros de consulta
   * @returns True si se eliminó correctamente
   */
  deleteAgencyStatus(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-agency-status`, getHttpOptions(queryParameters));
  }
}
