import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { getHttpOptions } from 'app/shared/utils';
import { SiteOperatingDayRequest } from 'app/shared/models/Request/SiteOperatingDayRequest';

@Injectable({
  providedIn: 'root'
})
export class SiteCalendarService {
  private apiUrl = `${environment.baseHttpUrl}/site-calendar`;

  constructor(private http: HttpClient) {}

  getOperatingDays(queryParameters: QueryParameters): Observable<any> {
    return this.http.get(`${this.apiUrl}/get-operating-days`, getHttpOptions(queryParameters));
  }

  toggleOperatingDay(request: SiteOperatingDayRequest, queryParameters: QueryParameters): Observable<any> {
    return this.http.post(`${this.apiUrl}/toggle-operating-day`, request, getHttpOptions(queryParameters));
  }

  deleteOperatingDay(queryParameters: QueryParameters): Observable<any> {
    return this.http.delete(`${this.apiUrl}/operating-day`, getHttpOptions(queryParameters));
  }
}
export { SiteOperatingDayRequest };

