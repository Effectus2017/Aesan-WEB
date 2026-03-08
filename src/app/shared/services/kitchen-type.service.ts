import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/common/QueryParameters';
import { KitchenType } from '../models/catalog/KitchenType';
import { KitchenTypeRequest } from '../models/request/KitchenTypeRequest';

@Injectable({
  providedIn: 'root',
})
export class KitchenTypeService {
  private _kitchenTypes: BehaviorSubject<KitchenType[] | null> = new BehaviorSubject(null);
  private _kitchenType: BehaviorSubject<KitchenType | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/kitchen-type`;
  private _httpClient = inject(HttpClient);

  constructor() {}

  get kitchenTypes$(): Observable<KitchenType[] | null> {
    return this._kitchenTypes.asObservable();
  }

  get kitchenType$(): Observable<KitchenType | null> {
    return this._kitchenType.asObservable();
  }

  getKitchenTypeById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-kitchen-type-by-id`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._kitchenType.next(response)));
  }

  getAllKitchenTypesFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-all-kitchen-types-from-db`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._kitchenTypes.next(response)));
  }

  insertKitchenType(kitchenType: KitchenType | KitchenTypeRequest, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/insert-kitchen-type`, kitchenType, getHttpOptions(queryParameters));
  }

  updateKitchenType(kitchenType: KitchenType, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-kitchen-type`, kitchenType, getHttpOptions(queryParameters));
  }

  deleteKitchenType(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-kitchen-type`, getHttpOptions(queryParameters));
  }

  /**
   * Obtiene los tipos de cocina válidos para un programa
   * @param queryParameters Los parámetros de consulta que incluyen el ID del programa (programId)
   * @returns Un observable que emite los tipos de cocina obtenidos
   */
  getKitchenTypesByProgram(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-kitchen-types-by-program`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._kitchenTypes.next(response)));
  }

  /**
   * Obtiene los tipos de cocina válidos para un tipo de grupo y programa específicos
   * @param queryParameters Los parámetros de consulta que incluyen groupTypeId y programId
   * @returns Un observable que emite los tipos de cocina obtenidos
   */
  getKitchenTypesByGroupType(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-kitchen-types-by-group-type`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._kitchenTypes.next(response)));
  }
}
