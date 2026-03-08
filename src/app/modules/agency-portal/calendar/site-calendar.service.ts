import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { getHttpOptions } from 'app/shared/utils';
import { SiteOperatingDayRequest } from 'app/shared/models/request/SiteOperatingDayRequest';
import { DayOfWeekResponse } from 'app/shared/models/calendar/DayOfWeekResponse';

@Injectable({
  providedIn: 'root'
})
export class SiteCalendarService {
  private apiUrl = `${environment.baseHttpUrl}/site-calendar`;

  constructor(private http: HttpClient) {}

  getOperatingDays(queryParameters: QueryParameters): Observable<any> {
    return this.http.get(`${this.apiUrl}/get-operating-days`, getHttpOptions(queryParameters));
  }

  createOperatingDay(request: SiteOperatingDayRequest, queryParameters: QueryParameters): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-operating-day`, request, getHttpOptions(queryParameters));
  }

  updateOperatingDay(request: SiteOperatingDayRequest, queryParameters: QueryParameters): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-operating-day`, request, getHttpOptions(queryParameters));
  }

  deleteOperatingDay(queryParameters: QueryParameters): Observable<any> {
    return this.http.delete(`${this.apiUrl}/operating-day`, getHttpOptions(queryParameters));
  }

  /**
   * Obtiene los días de la semana permitidos para un programa específico con sus nombres
   * @param queryParameters Parámetros de consulta que incluyen el ID del programa
   * @returns Observable con array de días permitidos con sus nombres en español e inglés
   */
  getAllowedDaysByProgramId(queryParameters: QueryParameters): Observable<any> {
    return this.http.get(`${this.apiUrl}/get-allowed-days-by-program-id`, getHttpOptions(queryParameters));
  }
}
