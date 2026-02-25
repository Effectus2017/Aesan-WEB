import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/QueryParameters';
import { AgencyStatusHistoryPagedResponse } from '../models/AgencyStatusHistory';

@Injectable({
  providedIn: 'root',
})
export class AgencyStatusHistoryService {
  private apiUrl = `${environment.baseHttpUrl}/api/agency-status-history`;
  private _httpClient = inject(HttpClient);

  /**
   * Obtiene el historial de estados de una agencia paginado.
   * Requiere permiso agencystatushistory.view.
   */
  getAgencyStatusHistory(queryParameters: QueryParameters): Observable<AgencyStatusHistoryPagedResponse> {
    return this._httpClient.get<AgencyStatusHistoryPagedResponse>(this.apiUrl, getHttpOptions(queryParameters));
  }
}
