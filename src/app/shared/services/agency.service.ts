import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/QueryParameters';
import { UserAgencyRequest } from '../models/Request/UserAgencyRequest';
import { AgencyRequest } from "../models/Request/AgencyRequest";
import { Agency } from '../models/Agency';
import { AgencyStatus } from '../models/AgencyStatus';

@Injectable({
  providedIn: 'root'
})
export class AgencyService {


  private _agencies: BehaviorSubject<Agency[] | null> = new BehaviorSubject(null);
  private _agency: BehaviorSubject<Agency | null> = new BehaviorSubject(null);

  private _agencyStatus: BehaviorSubject<AgencyStatus[] | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/agency`;
  private _httpClient = inject(HttpClient);

  constructor() { }

  /**
   * Obtiene todas las agencias
   * @returns Las agencias
   */
  get agencies$(): Observable<Agency[] | null> {
    return this._agencies.asObservable();
  }

  /**
   * Obtiene una agencia
   * @returns La agencia
   */
  get agency$(): Observable<Agency | null> {
    return this._agency.asObservable();
  }

  /**
   * Obtiene todos los estados de la agencia
   * @returns Los estados de la agencia
   */
  get agencyStatus$(): Observable<AgencyStatus[] | null> {
    return this._agencyStatus.asObservable();
  }

  /**
   * Obtiene todas las agencias de la base de datos
   * @param queryParameters Los parámetros de consulta
   * @returns Las agencias
   */
  getAllAgenciesFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-all-agencies-from-db`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._agencies.next(response)));
  }

  /**
   * Obtiene una agencia por su ID
   * @param queryParameters Los parámetros de consulta
   * @returns La agencia
   */
  getAgencyById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-agency-by-id`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._agency.next(response)));
  }


  /**
   * Obtiene todos los estados de la agencia
   * @param queryParameters Los parámetros de consulta
   * @returns Los estados de la agencia
   */
  getAllAgencyStatusFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-all-agency-status-from-db`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._agencyStatus.next(response)));
  }

  /**
   * Registra una agencia
   * @param agency La agencia
   * @param queryParameters Los parámetros de consulta
   * @returns La agencia registrada
   */
  registerAgency(model: UserAgencyRequest, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/register-agency`, model, getHttpOptions(queryParameters));
  }

  /**
   * Actualiza una agencia
   * @param agency La agencia
   * @param queryParameters Los parámetros de consulta
   * @returns La agencia actualizada
   */
  updateAgency(model: AgencyRequest, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-agency`, model, getHttpOptions(queryParameters));
  }

  /**
   * Actualiza el estado de una agencia
   * @param queryParameters Los parámetros de consulta
   * @returns True si se actualizó correctamente
   */
  updateAgencyStatus(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-agency-status`, queryParameters, getHttpOptions(queryParameters));
  }

  /**
   * Elimina una agencia
   * @param queryParameters Los parámetros de consulta
   * @returns La agencia eliminada
   */
  deleteAgency(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-agency`, getHttpOptions(queryParameters));
  }
}
