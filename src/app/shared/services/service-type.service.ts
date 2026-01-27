import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/QueryParameters';

@Injectable({
  providedIn: 'root',
})
export class ServiceTypeService {
  private apiUrl = `${environment.baseHttpUrl}/service-type`;
  private _httpClient = inject(HttpClient);

  /**
   * Obtiene los tipos de servicio válidos para un programa (ServiceType + ServiceTypeProgram).
   * Incluye isStrongService y minimumMinutesToNextService. AESAN-257.
   */
  getServiceTypesByProgram(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(
      `${this.apiUrl}/get-service-types-by-program`,
      getHttpOptions(queryParameters)
    );
  }
}
