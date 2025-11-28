import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/QueryParameters';
import { Site } from '../models/Site';
import { SiteRequest } from '../models/Request/SiteRequest';
import { SiteSatelliteResponse } from '../models/Response/SiteSatelliteResponse';

@Injectable({
  providedIn: 'root',
})
export class SiteService {
  private _sites: BehaviorSubject<Site[] | null> = new BehaviorSubject(null);
  private _site: BehaviorSubject<Site | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/site`;
  private _httpClient = inject(HttpClient);

  constructor() {}

  /**
   * Obtiene todos los sitios
   * @returns Los sitios
   */
  get sites$(): Observable<Site[] | null> {
    return this._sites.asObservable();
  }

  /**
   * Obtiene un sitio
   * @returns El sitio
   */
  get site$(): Observable<Site | null> {
    return this._site.asObservable();
  }


  /**
   * Obtiene un sitio por su ID
   * @param queryParameters Los parámetros de consulta
   * @returns El sitio
   */
  getSiteById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-site-by-id`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._site.next(response)));
  }

  /**
   * Obtiene todos los sitios de la base de datos
   * @param queryParameters Los parámetros de consulta
   * @returns Los sitios
   */
  getAllSitesFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-all-sites-from-db`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._sites.next(response)));
  }

  /**
   * Inserta un sitio
   * @param site El sitio
   * @param queryParameters Los parámetros de consulta
   * @returns El sitio insertado
   */
  insertSite(site: SiteRequest, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/insert-site`, site, getHttpOptions(queryParameters));
  }

  /**
   * Actualiza un sitio
   * @param site El sitio
   * @param queryParameters Los parámetros de consulta
   * @returns El sitio actualizado
   */
  updateSite(site: SiteRequest, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-site`, site, getHttpOptions(queryParameters));
  }

  /**
   * Elimina un sitio
   * @param queryParameters Los parámetros de consulta
   * @returns True si se eliminó correctamente
   */
  deleteSite(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-site`, getHttpOptions(queryParameters));
  }


  /**
   * Actualiza el estado activo/inactivo de un sitio
   * @param queryParameters Los parámetros de la solicitud (se envían en el body)
   * @returns True si se actualizó correctamente
   */
  updateSiteActiveStatus(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-active-status`, queryParameters, getHttpOptions({}));
  }

  /**
   * Obtiene todos los sitios satélites de un sitio principal específico
   * @param mainSiteId ID del sitio principal
   * @returns Objeto con data y count de sitios satélites
   */
  getSiteSatellitesByMainSiteId(mainSiteId: number): Observable<{data: SiteSatelliteResponse[], count: number}> {
    const queryParameters: QueryParameters = {
      id: mainSiteId
    };

    return this._httpClient.get<{data: SiteSatelliteResponse[], count: number}>(`${this.apiUrl}/get-satellites-by-main-site`, getHttpOptions(queryParameters))
      .pipe(
        catchError(error => {
          console.error('Error al obtener sitios satélites:', error);
          return of({data: [], count: 0});
        })
      );
  }
}

