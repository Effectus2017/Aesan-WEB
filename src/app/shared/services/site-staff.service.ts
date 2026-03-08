import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/common/QueryParameters';

import { SiteStaffRequest, UpdateSiteStaffRequest } from '../models/request/SiteStaffRequest';
import { SiteStaff } from '../models/site/SiteStaff.1';

@Injectable({
  providedIn: 'root',
})
export class SiteStaffService {
  private _siteStaffs: BehaviorSubject< [] | null> = new BehaviorSubject(null);
  private _siteStaff: BehaviorSubject<SiteStaff | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/site-staff`;
  private _httpClient = inject(HttpClient);

  constructor() {}

  /**
   * Obtiene todas las asignaciones de school staff
   * @returns Las asignaciones
   */
  get siteStaffs$(): Observable<SiteStaff[] | null> {
    return this._siteStaffs.asObservable();
  }

  /**
   * Obtiene una asignación específica
   * @returns La asignación
   */
  get siteStaff$(): Observable<SiteStaff | null> {
    return this._siteStaff.asObservable();
  }

  /**
   * Obtiene una asignación específica por ID
   * @param queryParameters Los parámetros de consulta
   * @returns La asignación
   */
  getSiteStaffById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-assignment-by-id`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._siteStaff.next(response)));
  }

  /**
   * Obtiene todas las asignaciones asignaciones desde la base de datos
   * @param queryParameters Los parámetros de consulta
   * @returns Las asignaciones
   */
  getAllSiteStaffFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-all-site-staff-from-db`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._siteStaffs.next(response)));
  }

  /**
   * Inserta una nueva asignación site staff
   * @param siteStaffRequest La asignación a insertar
   * @param queryParameters Los parámetros de consulta
   * @returns La asignación insertada
   */
  insertSiteStaff(siteStaffRequest: SiteStaffRequest, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/assign-staff`, siteStaffRequest, getHttpOptions(queryParameters));
  }

  /**
   * Actualiza una asignación existente
   * @param updateSiteStaffRequest La asignación actualizada
   * @param queryParameters Los parámetros de consulta
   * @returns La asignación actualizada
   */
  updateSiteStaff(updateSiteStaffRequest: UpdateSiteStaffRequest, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-assignment`, updateSiteStaffRequest, getHttpOptions(queryParameters));
  }

  /**
   * Elimina una asignación (asignación lógica)
   * @param queryParameters Los parámetros de consulta
   * @returns True si se eliminó correctamente
   */
  deleteSiteStaff(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/unassign-staff`, getHttpOptions(queryParameters));
  }

  /**
   * Obtiene staff asignados a un sitio específico
   * @param queryParameters Los parámetros de consulta
   * @returns Los staff asignados
   */
  getStaffBySite(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-staff-by-site`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._siteStaffs.next(response)));
  }

  /**
   * Obtiene sitios asignados a un staff específico
   * @param queryParameters Los parámetros de consulta
   * @returns Los sitios asignados
   */
  getSitesByStaff(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-sites-by-staff`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._siteStaffs.next(response)));
  }

  /**
   * Actualiza el estado activo/inactivo de una asignación
   * @param queryParameters Los parámetros de consulta
   * @returns True si se actualizó correctamente
   */
  updateSiteStaffActiveStatus(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-site-staff-active-status`, queryParameters, getHttpOptions(queryParameters));
  }
}
