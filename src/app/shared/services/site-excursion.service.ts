import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { SiteExcursion } from '../models/SiteExcursion';
import { SiteExcursionRequest } from '../models/Request/SiteExcursionRequest';

@Injectable({
  providedIn: 'root',
})
export class SiteExcursionService {
  private _excursions: BehaviorSubject<SiteExcursion[] | null> = new BehaviorSubject(null);
  private _excursion: BehaviorSubject<SiteExcursion | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/site-excursion`;
  private _httpClient = inject(HttpClient);

  constructor() {}

  get excursions$(): Observable<SiteExcursion[] | null> {
    return this._excursions.asObservable();
  }

  get excursion$(): Observable<SiteExcursion | null> {
    return this._excursion.asObservable();
  }

  getSiteExcursionById(id: number): Observable<SiteExcursion> {
    return this._httpClient
      .get<SiteExcursion>(`${this.apiUrl}/${id}`)
      .pipe(tap((response) => this._excursion.next(response)));
  }

  getSiteExcursionsBySiteId(siteId: number, includeInactive: boolean = false): Observable<SiteExcursion[]> {
    const params = new HttpParams().set('includeInactive', includeInactive.toString());
    return this._httpClient
      .get<SiteExcursion[]>(`${this.apiUrl}/site/${siteId}`, { params })
      .pipe(tap((response) => this._excursions.next(response)));
  }

  getSiteExcursionsByDateRange(
    siteId: number,
    startDate: string,
    endDate: string,
    includeInactive: boolean = false
  ): Observable<SiteExcursion[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('includeInactive', includeInactive.toString());
    return this._httpClient
      .get<SiteExcursion[]>(`${this.apiUrl}/site/${siteId}/by-date-range`, { params })
      .pipe(tap((response) => this._excursions.next(response)));
  }

  getSiteExcursionsByChildGroupId(
    siteId: number,
    childGroupId: number,
    includeInactive: boolean = false
  ): Observable<SiteExcursion[]> {
    const params = new HttpParams().set('includeInactive', includeInactive.toString());
    return this._httpClient
      .get<SiteExcursion[]>(`${this.apiUrl}/site/${siteId}/by-group/${childGroupId}`, { params })
      .pipe(tap((response) => this._excursions.next(response)));
  }

  createSiteExcursion(request: SiteExcursionRequest): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}`, request);
  }

  updateSiteExcursion(id: number, request: SiteExcursionRequest): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/${id}`, request);
  }

  deleteSiteExcursion(id: number): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/${id}`);
  }
}

