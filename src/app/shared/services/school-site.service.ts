import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/QueryParameters';
import { SchoolSiteResponse } from '../models/Response/SchoolSiteResponse';

@Injectable({
  providedIn: 'root',
})
export class SchoolSiteService {
  private _schoolSites: BehaviorSubject<SchoolSiteResponse[] | null> = new BehaviorSubject(null);
  private _schoolSite: BehaviorSubject<SchoolSiteResponse | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/school-site`;
  private _httpClient = inject(HttpClient);

  constructor() {}

  /**
   * Obtiene todos los sitios asignados a una escuela específica
   * @param queryParameters Los parámetros de consulta que incluyen schoolId
   * @returns Los sitios asignados a la escuela
   */
  getSitesBySchoolId(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-sites-by-school`, getHttpOptions(queryParameters))
      .pipe(
        tap((response: any) => this._schoolSites.next(response)),
        catchError(error => {
          console.error('Error al obtener sitios por escuela:', error);
          return of(null);
        })
      );
  }

  /**
   * Obtiene la escuela asignada a un sitio específico
   * @param siteId El ID del sitio
   * @returns La escuela asignada al sitio
   */
  getSchoolBySiteId(siteId: number): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-school-by-site/${siteId}`)
      .pipe(
        tap((response: any) => this._schoolSite.next(response)),
        catchError(error => {
          console.error('Error al obtener escuela por sitio:', error);
          return of(null);
        })
      );
  }

  /**
   * Asigna un sitio a una escuela
   * @param request La asignación School-Site a crear
   * @returns El resultado de la asignación
   */
  assignSiteToSchool(request: any): Observable<any> {
    return this._httpClient
      .post(`${this.apiUrl}/assign-site-to-school`, request)
      .pipe(
        tap((response: any) => this._schoolSite.next(response)),
        catchError(error => {
          console.error('Error al asignar sitio a escuela:', error);
          return of(null);
        })
      );
  }

  /**
   * Actualiza una asignación School-Site existente
   * @param request La asignación School-Site a actualizar
   * @returns El resultado de la actualización
   */
  updateSchoolSiteAssignment(request: any): Observable<any> {
    return this._httpClient
      .put(`${this.apiUrl}/update-school-site-assignment`, request)
      .pipe(
        tap((response: any) => this._schoolSite.next(response)),
        catchError(error => {
          console.error('Error al actualizar asignación School-Site:', error);
          return of(null);
        })
      );
  }

  /**
   * Elimina una asignación School-Site
   * @param queryParameters Los parámetros de consulta que incluyen el ID de la asignación
   * @returns El resultado de la eliminación
   */
  removeSchoolSiteAssignment(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .delete(`${this.apiUrl}/remove-school-site-assignment`, getHttpOptions(queryParameters))
      .pipe(
        tap((response: any) => this._schoolSite.next(response)),
        catchError(error => {
          console.error('Error al eliminar asignación School-Site:', error);
          return of(null);
        })
      );
  }

  /**
   * Obtiene el observable de school sites
   * @returns Observable de school sites
   */
  get schoolSites$(): Observable<SchoolSiteResponse[] | null> {
    return this._schoolSites.asObservable();
  }

  /**
   * Obtiene el observable de school site
   * @returns Observable de school site
   */
  get schoolSite$(): Observable<SchoolSiteResponse | null> {
    return this._schoolSite.asObservable();
  }
}
