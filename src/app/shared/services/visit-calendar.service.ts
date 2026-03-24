import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/common/QueryParameters';
import { SiteVisitCalendarResponse, VisitTypeDropdownItem } from '../models/agency/SiteVisit';
import { SiteVisitRequest } from '../models/agency/SiteVisitRequest';

@Injectable({
  providedIn: 'root',
})
export class VisitCalendarService {
  private apiUrl = `${environment.baseHttpUrl}/visit-calendar`;
  private _httpClient = inject(HttpClient);

  constructor() {}

  /**
   * Visitas del sitio por mes/año.
   */
  getSiteVisitsFromDb(queryParameters: QueryParameters): Observable<SiteVisitCalendarResponse> {
    return this._httpClient.get<SiteVisitCalendarResponse>(`${this.apiUrl}/get-visits`, getHttpOptions(queryParameters));
  }

  /**
   * Tipos de visita (misma idea que getAllAgencyStatusFromDb: QueryParameters + getHttpOptions).
   */
  getAllVisitTypesFromDb(queryParameters: QueryParameters): Observable<VisitTypeDropdownItem[]> {
    return this._httpClient.get<VisitTypeDropdownItem[]>(`${this.apiUrl}/get-visit-types`, getHttpOptions(queryParameters));
  }

  createVisit(request: SiteVisitRequest): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/create-visit`, request, getHttpOptions({}));
  }

  updateVisit(request: SiteVisitRequest): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-visit`, request, getHttpOptions({}));
  }

  deleteVisit(id: number, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-visit/${id}`, getHttpOptions(queryParameters));
  }
}
