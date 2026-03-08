import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/common/QueryParameters';
import { AesanDashboardResponse } from '../models/dashboard/AesanDashboardResponse';

@Injectable({
  providedIn: 'root',
})
export class AesanDashboardService {
  private _dashboardMetrics: BehaviorSubject<AesanDashboardResponse | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/dashboard`;
  private _httpClient = inject(HttpClient);

  constructor() {}

  /**
   * Obtiene las métricas del dashboard
   * @returns Las métricas del dashboard
   */
  get dashboardMetrics$(): Observable<AesanDashboardResponse | null> {
    return this._dashboardMetrics.asObservable();
  }

  /**
   * Obtiene las métricas del dashboard AESAN
   * @param queryParameters Parámetros de consulta
   * @returns Observable con las métricas del dashboard
   */
  getDashboardMetrics(queryParameters?: QueryParameters): Observable<any> {
    const params = queryParameters ? getHttpOptions(queryParameters) : {};

    return this._httpClient.get(`${this.apiUrl}/aesan-metrics`, params).pipe(
      tap((response) => {
        this._dashboardMetrics.next(response);
      })
    );
  }
}
