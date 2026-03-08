import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/common/QueryParameters';

@Injectable({
  providedIn: 'root',
})
export class AgencyStatusHistoryService {
  private apiUrl = `${environment.baseHttpUrl}/agency-status-history`;
  private _httpClient = inject(HttpClient);

  /**
   * Obtiene el historial de estados de agencia paginado.
   */
  getAgencyStatusHistory(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get<any>(`${this.apiUrl}/get-agency-status-history-paged`, getHttpOptions(queryParameters));
  }
}
