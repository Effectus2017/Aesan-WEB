import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/common/QueryParameters';
import { SiteOperatingDayService } from '../models/site/SiteOperatingDayService';
import { SiteOperatingDayServiceRequest } from '../models/request/SiteOperatingDayServiceRequest';

/**
 * Misma forma que {@link SchoolService}: QueryParameters, getHttpOptions, BehaviorSubject + tap en GET.
 */
@Injectable({
  providedIn: 'root',
})
export class SiteOperatingDayServiceService {
  private _services = new BehaviorSubject<SiteOperatingDayService[] | null>(null);
  private _service = new BehaviorSubject<SiteOperatingDayService | null>(null);

  private apiUrl = `${environment.baseHttpUrl}/site-operating-day-service`;
  private _httpClient = inject(HttpClient);

  get services$(): Observable<SiteOperatingDayService[] | null> {
    return this._services.asObservable();
  }

  get service$(): Observable<SiteOperatingDayService | null> {
    return this._service.asObservable();
  }

  /**
   * Usa `observe: 'body'` (no el default global `observe: 'response'`) para que el observable
   * emita el JSON del servicio, no HttpResponse; el tap alimenta el subject con el mismo DTO.
   */
  getServicesByOperatingDay(queryParameters: QueryParameters): Observable<SiteOperatingDayService[]> {
    const options = { ...getHttpOptions(queryParameters), observe: 'body' as const };
    return this._httpClient
      .get<SiteOperatingDayService[]>(`${this.apiUrl}`, options)
      .pipe(tap((list) => this._services.next(list)));
  }

  getServiceById(queryParameters: QueryParameters): Observable<SiteOperatingDayService> {
    const options = { ...getHttpOptions(queryParameters), observe: 'body' as const };
    return this._httpClient
      .get<SiteOperatingDayService>(`${this.apiUrl}/get-service-by-id`, options)
      .pipe(tap((dto) => this._service.next(dto)));
  }

  createService(request: SiteOperatingDayServiceRequest, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}`, request, getHttpOptions(queryParameters));
  }

  updateService(request: SiteOperatingDayServiceRequest, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-service`, request, getHttpOptions(queryParameters));
  }

  deleteService(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-service`, getHttpOptions(queryParameters));
  }

  /** Id e isEnabled van en query (misma convención que el API). */
  toggleService(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/toggle-service`, null, getHttpOptions(queryParameters));
  }
}
