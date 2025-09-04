import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/QueryParameters';
import { SponsorType } from '../models/SponsorType';
import { SponsorTypeRequest } from '../models/Request/SponsorTypeRequest';

@Injectable({
  providedIn: 'root',
})
export class SponsorTypeService {
  private _sponsorTypes: BehaviorSubject<SponsorType[] | null> = new BehaviorSubject(null);
  private _sponsorType: BehaviorSubject<SponsorType | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/sponsor-type`;
  private _httpClient = inject(HttpClient);

  constructor() {}

  get sponsorTypes$(): Observable<SponsorType[] | null> {
    return this._sponsorTypes.asObservable();
  }

  get sponsorType$(): Observable<SponsorType | null> {
    return this._sponsorType.asObservable();
  }

  /**
   * Obtiene un tipo de patrocinador por su ID
   * @param queryParameters Los parámetros de consulta
   * @returns El tipo de patrocinador
   */
  getSponsorTypeById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-sponsor-type-by-id`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._sponsorType.next(response)));
  }

  /**
   * Obtiene todos los tipos de patrocinadores de la base de datos
   * @param queryParameters Los parámetros de consulta
   * @returns Los tipos de patrocinadores
   */
  getAllSponsorTypesFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-all-sponsor-types-from-db`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._sponsorTypes.next(response)));
  }

  /**
   * Inserta un tipo de patrocinador
   * @param sponsorType El tipo de patrocinador
   * @param queryParameters Los parámetros de consulta
   * @returns El tipo de patrocinador
   */
  insertSponsorType(sponsorType: SponsorType | SponsorTypeRequest, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/insert-sponsor-type`, sponsorType, getHttpOptions(queryParameters));
  }

  /**
   * Actualiza un tipo de patrocinador
   * @param sponsorType El tipo de patrocinador
   * @param queryParameters Los parámetros de consulta
   * @returns El tipo de patrocinador
   */
  updateSponsorType(sponsorType: SponsorType, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-sponsor-type`, sponsorType, getHttpOptions(queryParameters));
  }

  /**
   * Elimina un tipo de patrocinador
   * @param queryParameters Los parámetros de consulta
   * @returns El tipo de patrocinador
   */
  deleteSponsorType(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-sponsor-type`, getHttpOptions(queryParameters));
  }
}
