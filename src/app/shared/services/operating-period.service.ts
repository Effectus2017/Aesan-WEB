import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/common/QueryParameters';
import { OperatingPeriod } from '../models/program/OperatingPeriod';

@Injectable({
  providedIn: 'root',
})
export class OperatingPeriodService {
  private _operatingPeriods: BehaviorSubject<OperatingPeriod[] | null> = new BehaviorSubject(null);
  private _operatingPeriod: BehaviorSubject<OperatingPeriod | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/operating-period`;
  private _httpClient = inject(HttpClient);

  constructor() {}

  /**
   * Obtiene todos los períodos operativos
   * @returns Los períodos operativos
   */
  get operatingPeriods$(): Observable<OperatingPeriod[] | null> {
    return this._operatingPeriods.asObservable();
  }

  /**
   * Obtiene un período operativo
   * @returns El período operativo
   */
  get operatingPeriod$(): Observable<OperatingPeriod | null> {
    return this._operatingPeriod.asObservable();
  }

  /**
   * Obtiene un período operativo por su ID
   * @param queryParameters Los parámetros de consulta
   * @returns El período operativo
   */
  getOperatingPeriodById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-operating-period-by-id`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._operatingPeriod.next(response)));
  }

  /**
   * Obtiene todos los períodos operativos de la base de datos
   * @param queryParameters Los parámetros de consulta
   * @returns Los períodos operativos
   */
  getAllOperatingPeriodsFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-all-operating-periods-from-db`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._operatingPeriods.next(response)));
  }

  /**
   * Inserta un período operativo
   * @param operatingPeriod El período operativo
   * @param queryParameters Los parámetros de consulta
   * @returns El período operativo insertado
   */
  insertOperatingPeriod(operatingPeriod: OperatingPeriod, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/insert-operating-period`, operatingPeriod, getHttpOptions(queryParameters));
  }

  /**
   * Actualiza un período operativo
   * @param operatingPeriod El período operativo
   * @param queryParameters Los parámetros de consulta
   * @returns El período operativo actualizado
   */
  updateOperatingPeriod(operatingPeriod: OperatingPeriod, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-operating-period`, operatingPeriod, getHttpOptions(queryParameters));
  }

  /**
   * Elimina un período operativo
   * @param queryParameters Los parámetros de consulta
   * @returns True si se eliminó correctamente
   */
  deleteOperatingPeriod(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-operating-period`, getHttpOptions(queryParameters));
  }
}
