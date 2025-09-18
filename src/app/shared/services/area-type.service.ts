import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/QueryParameters';
import { AreaType } from '../models/AreaType';
import { AreaTypeRequest } from '../models/Request/AreaTypeRequest';

@Injectable({
  providedIn: 'root',
})
export class AreaTypeService {
  private _areaTypes: BehaviorSubject<AreaType[] | null> = new BehaviorSubject(null);
  private _areaType: BehaviorSubject<AreaType | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/area-type`;
  private _httpClient = inject(HttpClient);

  constructor() {}

  get areaTypes$(): Observable<AreaType[] | null> {
    return this._areaTypes.asObservable();
  }

  get areaType$(): Observable<AreaType | null> {
    return this._areaType.asObservable();
  }

  getAreaTypeById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-area-type-by-id`, getHttpOptions(queryParameters)).pipe(
      tap((response: any) => this._areaType.next(response))
    );
  }

  getAllAreaTypesFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-all-area-types-from-db`, getHttpOptions(queryParameters)).pipe(
      tap((response: any) => this._areaTypes.next(response))
    );
  }

  insertAreaType(areaType: AreaTypeRequest, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/insert-area-type`, areaType, getHttpOptions(queryParameters));
  }

  updateAreaType(areaType: AreaType, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-area-type`, areaType, getHttpOptions(queryParameters));
  }

  deleteAreaType(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-area-type`, getHttpOptions(queryParameters));
  }

  /**
   * Obtiene el tipo de área válido para una ciudad específica
   * @param queryParameters Los parámetros de consulta que incluyen el ID de la ciudad
   * @returns Un observable que emite el tipo de área obtenido
   */
  getAreaTypeByCity(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-area-type-by-city`, getHttpOptions(queryParameters)).pipe(
      tap((response: any) => this._areaType.next(response))
    );
  }
}
