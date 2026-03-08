import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/common/QueryParameters';
import { HouseholdRequest } from '../models/request/HouseholdRequest';
import { Household } from '../models/household/Household';


@Injectable({ providedIn: 'root' })
export class HouseholdService {
  private _households: BehaviorSubject<Household[] | null> = new BehaviorSubject(null);
  private _household: BehaviorSubject<Household | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/household`;
  private _httpClient = inject(HttpClient);

  constructor() {}

  /**
   * Obtiene todos los hogares
   * @returns Todos los hogares
   */
  get households$(): Observable<Household[] | null> {
    return this._households.asObservable();
  }

  /**
   * Obtiene un hogar
   * @returns Un hogar
   */
  get household$(): Observable<Household | null> {
    return this._household.asObservable();
  }

  /**
   * Obtiene un hogar por su ID
   * @param id El ID del hogar
   * @returns El hogar
   */
  getHouseholdById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-household-by-id`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._household.next(response)));
  }

  /**
   * Obtiene todos los hogares de la base de datos
   * @param queryParameters Los parámetros de consulta
   * @returns Todos los hogares
   */
  getAllHouseholdsFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-all-households-from-db`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._households.next(response)));
  }

  /**
   * Inserta un hogar
   * @param data Los datos del hogar
   * @returns El hogar
   */
  insertHousehold(household: HouseholdRequest, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/insert-household`, household, getHttpOptions(queryParameters));
  }

  /**
   * Actualiza un hogar
   * @param data Los datos del hogar
   * @returns El hogar
   */
  updateHousehold(household: HouseholdRequest, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-household`, household, getHttpOptions(queryParameters));
  }

  /**
   * Elimina un hogar
   * @param id El ID del hogar
   * @returns El hogar
   */
  deleteHousehold(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-household`, getHttpOptions(queryParameters));
  }
}
