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

  getSponsorTypeById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-sponsor-type-by-id`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._sponsorType.next(response)));
  }

  getAllSponsorTypesFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-all-sponsor-types-from-db`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._sponsorTypes.next(response)));
  }

  insertSponsorType(sponsorType: SponsorType | SponsorTypeRequest, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/insert-sponsor-type`, sponsorType, getHttpOptions(queryParameters));
  }

  updateSponsorType(sponsorType: SponsorType, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-sponsor-type`, sponsorType, getHttpOptions(queryParameters));
  }

  deleteSponsorType(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-sponsor-type`, getHttpOptions(queryParameters));
  }
}
