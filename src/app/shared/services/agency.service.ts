import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/common/QueryParameters';
import { UserAgencyRequest } from '../models/agency/UserAgencyRequest';
import { UpdateAgencyInscriptionRequest } from '../models/agency/UpdateAgencyInscriptionRequest';
import { UpdateAgencyProgramRequest } from '../models/agency/UpdateAgencyProgramRequest';
import { AgencyResponse } from '../models/agency/AgencyResponse';
import { DataResponse } from '../models/data/DataResponse';


@Injectable({
  providedIn: 'root',
})
export class AgencyService {
  private _agencies: BehaviorSubject<AgencyResponse[] | null> = new BehaviorSubject(null);
  private _agency: BehaviorSubject<DataResponse<AgencyResponse> | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/agency`;
  private _httpClient = inject(HttpClient);

  constructor() {}

  /**
   * Obtiene todas las agencias
   * @returns Las agencias
   */
  get agencies$(): Observable<AgencyResponse[] | null> {
    return this._agencies.asObservable();
  }

  /**
   * Obtiene una agencia
   * @returns La agencia
   */
  get agency$(): Observable<DataResponse<AgencyResponse> | null> {
    return this._agency.asObservable();
  }

  /**
   * Obtiene una agencia por su ID
   * @param queryParameters Los parámetros de consulta
   * @returns La agencia
   */
  getAgencyById(queryParameters: QueryParameters): Observable<DataResponse<AgencyResponse>> {
    return this._httpClient.get<DataResponse<AgencyResponse>>(`${this.apiUrl}/get-agency-by-id`, getHttpOptions(queryParameters)).pipe(tap((response) => this._agency.next(response)));
  }

  /**
   * Obtiene una agencia por su ID para visita preoperacional
   * @param queryParameters Los parámetros de consulta
   * @returns La agencia
   */
  getAgencyByIdAndUserId(queryParameters: QueryParameters): Observable<DataResponse<AgencyResponse>> {
    return this._httpClient
      .get<DataResponse<AgencyResponse>>(`${this.apiUrl}/get-agency-by-id-and-user-id`, getHttpOptions(queryParameters))
      .pipe(tap((response) => this._agency.next(response)));
  }

  /**
   * Obtiene la lista de usuarios AESAN asignados a una agencia.
   * @param queryParameters Los parámetros de consulta
   * @returns Objeto con data (lista) y count
   */
  getAssignedUsers(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-assigned-users`, getHttpOptions(queryParameters));
  }

  /**
   * Obtiene todas las agencias de la base de datos
   * @param queryParameters Los parámetros de consulta
   * @returns Las agencias
   */
  getAllAgenciesFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-all-agencies-from-db`, getHttpOptions(queryParameters)).pipe(tap((response) => this._agencies.next(response.body)));
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
  updateAgency(model: UserAgencyRequest, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-agency`, model, getHttpOptions(queryParameters));
  }

  /**
   * Actualiza la fecha de registro completado de una agencia
   * @param queryParameters Los parámetros de consulta (debe incluir AgencyId y CompletedRegistrationDate)
   * @returns True si se actualizó correctamente
   */
  updateCompletedRegistrationDate(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-completed-registration-date`, null, getHttpOptions(queryParameters));
  }

  /**
   * Actualiza el logo de una agencia
   * @param model El modelo con la nueva URL de la imagen
   * @param queryParameters Los parámetros de consulta
   * @returns True si se actualizó correctamente
   */
  updateAgencyLogo(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-agency-logo`, null, getHttpOptions(queryParameters));
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
   * Actualiza un programa de agencia
   * @param model El programa de agencia
   * @param queryParameters Los parámetros de consulta
   * @returns El programa de agencia actualizado
   */
  updateAgencyProgram(model: UpdateAgencyProgramRequest, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-agency-program`, model, getHttpOptions(queryParameters));
  }

  /**
   * Actualiza la inscripción de una agencia
   * @param model La inscripción de la agencia
   * @param queryParameters Los parámetros de consulta
   * @returns La inscripción de la agencia actualizada
   */
  updateAgencyInscription(model: UpdateAgencyInscriptionRequest, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-agency-inscription`, model, getHttpOptions(queryParameters));
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
