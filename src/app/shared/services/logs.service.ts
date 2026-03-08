import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/common/QueryParameters';
import { LogsPageResponse } from '../models/log/CentralLogEntry';

@Injectable({
  providedIn: 'root',
})
export class LogsService {
  private apiUrl = `${environment.baseHttpUrl}/api/logs`;
  private _httpClient = inject(HttpClient);

  /**
   * Obtiene entradas de log paginadas por categoría (Audit, Email, Job, Application).
   * Requiere permiso según categoría: log.view.audit, log.view.email, log.view.job, log.view.errors.
   */
  getLogsPaged(queryParameters: QueryParameters): Observable<LogsPageResponse> {
    return this._httpClient.get<LogsPageResponse>(
      this.apiUrl,
      getHttpOptions(queryParameters)
    );
  }
}
