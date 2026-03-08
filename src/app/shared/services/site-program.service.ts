import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { SiteProgramResponse, SiteProgramRequest } from '../models/site/SiteProgram';

@Injectable({
  providedIn: 'root',
})
export class SiteProgramService {
  private apiUrl = `${environment.baseHttpUrl}/site-program`;
  private _httpClient = inject(HttpClient);

  /**
   * Obtiene todos los programas de un sitio
   * @param siteId ID del sitio
   * @returns Los programas del sitio
   */
  getSiteProgramsBySiteId(siteId: number): Observable<SiteProgramResponse[]> {
    return this._httpClient.get<SiteProgramResponse[]>(
      `${this.apiUrl}/get-by-site-id?siteId=${siteId}`,
      getHttpOptions({})
    );
  }

  /**
   * Inserta una nueva relación sitio-programa
   * @param request Datos de la relación a insertar
   * @returns La relación insertada
   */
  insertSiteProgram(request: SiteProgramRequest): Observable<SiteProgramResponse> {
    return this._httpClient.post<SiteProgramResponse>(
      `${this.apiUrl}/insert`,
      request,
      getHttpOptions({})
    );
  }

  /**
   * Actualiza una relación sitio-programa existente
   * @param request Datos de la relación a actualizar
   * @returns Resultado de la actualización
   */
  updateSiteProgram(request: SiteProgramRequest): Observable<any> {
    return this._httpClient.put(
      `${this.apiUrl}/update`,
      request,
      getHttpOptions({})
    );
  }
}

