import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/common/QueryParameters';
import { FederalFundingCertification } from '../models/FederalFundingCertification';

@Injectable({
  providedIn: 'root',
})
export class FederalFundingCertificationService {
  private _federalFundingCertifications: BehaviorSubject<FederalFundingCertification[] | null> = new BehaviorSubject(null);
  private _federalFundingCertification: BehaviorSubject<FederalFundingCertification | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/federal-funding-certification`;
  private _httpClient = inject(HttpClient);

  constructor() {}

  /**
   * Obtiene todas las certificaciones de fondos federales
   * @returns Las certificaciones de fondos federales
   */
  get federalFundingCertifications$(): Observable<FederalFundingCertification[] | null> {
    return this._federalFundingCertifications.asObservable();
  }

  /**
   * Obtiene una certificación de fondos federales
   * @returns La certificación de fondos federales
   */
  get federalFundingCertification$(): Observable<FederalFundingCertification | null> {
    return this._federalFundingCertification.asObservable();
  }

  /**
   * Obtiene una certificación de fondos federales por su ID
   * @param queryParameters Los parámetros de consulta
   * @returns La certificación de fondos federales
   */
  getFederalFundingCertificationById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-federal-funding-certification-by-id`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._federalFundingCertification.next(response)));
  }

  /**
   * Obtiene todas las certificaciones de fondos federales de la base de datos
   * @param queryParameters Los parámetros de consulta
   * @returns Las certificaciones de fondos federales
   */
  getAllFederalFundingCertificationsFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-all-federal-funding-certifications-from-db`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._federalFundingCertifications.next(response)));
  }

  /**
   * Inserta una certificación de fondos federales
   * @param federalFundingCertification La certificación de fondos federales
   * @param queryParameters Los parámetros de consulta
   * @returns La certificación de fondos federales insertada
   */
  insertFederalFundingCertification(federalFundingCertification: FederalFundingCertification, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/insert-federal-funding-certification`, federalFundingCertification, getHttpOptions(queryParameters));
  }

  /**
   * Actualiza una certificación de fondos federales
   * @param federalFundingCertification La certificación de fondos federales
   * @param queryParameters Los parámetros de consulta
   * @returns La certificación de fondos federales actualizada
   */
  updateFederalFundingCertification(federalFundingCertification: FederalFundingCertification, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-federal-funding-certification`, federalFundingCertification, getHttpOptions(queryParameters));
  }

  /**
   * Elimina una certificación de fondos federales
   * @param queryParameters Los parámetros de consulta
   * @returns True si se eliminó correctamente
   */
  deleteFederalFundingCertification(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-federal-funding-certification`, getHttpOptions(queryParameters));
  }
}
