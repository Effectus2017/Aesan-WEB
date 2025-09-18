import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/QueryParameters';
import { CenterType } from '../models/CenterType';

@Injectable({
  providedIn: 'root',
})
export class CenterTypeService {
  private _centerTypes: BehaviorSubject<CenterType[] | null> = new BehaviorSubject(null);
  private _centerType: BehaviorSubject<CenterType | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/center-type`;
  private _httpClient = inject(HttpClient);

  constructor() {}

  get centerTypes$(): Observable<CenterType[] | null> {
    return this._centerTypes.asObservable();
  }

  get centerType$(): Observable<CenterType | null> {
    return this._centerType.asObservable();
  }

  getCenterTypeById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-center-type-by-id`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._centerType.next(response)));
  }

  getAllCenterTypesFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-all-center-types-from-db`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._centerTypes.next(response)));
  }

  insertCenterType(centerType: CenterType, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/insert-center-type`, centerType, getHttpOptions(queryParameters));
  }

  updateCenterType(centerType: CenterType, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-center-type`, centerType, getHttpOptions(queryParameters));
  }

  deleteCenterType(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-center-type`, getHttpOptions(queryParameters));
  }

  getCenterTypesByProgram(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-center-types-by-program`, getHttpOptions(queryParameters));
  }
}
