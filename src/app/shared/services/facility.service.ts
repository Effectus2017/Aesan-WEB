import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/QueryParameters';
import { Facility } from '../models/Facility';

@Injectable({
  providedIn: 'root',
})
export class FacilityService {
  private _facilities: BehaviorSubject<Facility[] | null> = new BehaviorSubject(null);
  private _facility: BehaviorSubject<Facility | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/facility`;
  private _httpClient = inject(HttpClient);

  constructor() {}

  /**
   * Obtiene todas las instalaciones
   * @returns Las instalaciones
   */
  get facilities$(): Observable<Facility[] | null> {
    return this._facilities.asObservable();
  }

  /**
   * Obtiene una instalación
   * @returns La instalación
   */
  get facility$(): Observable<Facility | null> {
    return this._facility.asObservable();
  }

  /**
   * Obtiene una instalación por su ID
   * @param queryParameters Los parámetros de consulta
   * @returns La instalación
   */
  getFacilityById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-facility-by-id`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._facility.next(response)));
  }

  /**
   * Obtiene todas las instalaciones de la base de datos
   * @param queryParameters Los parámetros de consulta
   * @returns Las instalaciones
   */
  getAllFacilitiesFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-all-facilities-from-db`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._facilities.next(response)));
  }

  /**
   * Inserta una instalación
   * @param facility La instalación
   * @param queryParameters Los parámetros de consulta
   * @returns La instalación insertada
   */
  insertFacility(facility: Facility, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/insert-facility`, facility, getHttpOptions(queryParameters));
  }

  /**
   * Actualiza una instalación
   * @param facility La instalación
   * @param queryParameters Los parámetros de consulta
   * @returns La instalación actualizada
   */
  updateFacility(facility: Facility, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-facility`, facility, getHttpOptions(queryParameters));
  }

  /**
   * Elimina una instalación
   * @param queryParameters Los parámetros de consulta
   * @returns True si se eliminó correctamente
   */
  deleteFacility(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-facility`, getHttpOptions(queryParameters));
  }
}
