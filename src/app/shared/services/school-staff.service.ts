import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/QueryParameters';
import { SchoolStaff } from '../models/SchoolStaff';
import { SchoolStaffRequest, UpdateSchoolStaffRequest } from '../models/Request/SchoolStaffRequest';

@Injectable({
  providedIn: 'root',
})
export class SchoolStaffService {
  private _schoolStaffs: BehaviorSubject<SchoolStaff[] | null> = new BehaviorSubject(null);
  private _schoolStaff: BehaviorSubject<SchoolStaff | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/school-staff`;
  private _httpClient = inject(HttpClient);

  constructor() {}

  /**
   * Obtiene todas las asignaciones de school staff
   * @returns Las asignaciones
   */
  get schoolStaffs$(): Observable<SchoolStaff[] | null> {
    return this._schoolStaffs.asObservable();
  }

  /**
   * Obtiene una asignación específica
   * @returns La asignación
   */
  get schoolStaff$(): Observable<SchoolStaff | null> {
    return this._schoolStaff.asObservable();
  }

  /**
   * Obtiene una asignación específica por ID
   * @param queryParameters Los parámetros de consulta
   * @returns La asignación
   */
  getSchoolStaffById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-assignment-by-id`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._schoolStaff.next(response)));
  }

  /**
   * Obtiene todas las asignaciones asignaciones desde la base de datos
   * @param queryParameters Los parámetros de consulta
   * @returns Las asignaciones
   */
  getAllSchoolStaffFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-all-school-staff-from-db`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._schoolStaffs.next(response)));
  }

  /**
   * Inserta una nueva asignación school staff
   * @param schoolStaffRequest La asignación a insertar
   * @param queryParameters Los parámetros de consulta
   * @returns La asignación insertada
   */
  insertSchoolStaff(schoolStaffRequest: SchoolStaffRequest, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/assign-staff`, schoolStaffRequest, getHttpOptions(queryParameters));
  }

  /**
   * Actualiza una asignación existente
   * @param updateSchoolStaffRequest La asignación actualizada
   * @param queryParameters Los parámetros de consulta
   * @returns La asignación actualizada
   */
  updateSchoolStaff(updateSchoolStaffRequest: UpdateSchoolStaffRequest, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-assignment`, updateSchoolStaffRequest, getHttpOptions(queryParameters));
  }

  /**
   * Elimina una asignación (asignación lógica)
   * @param queryParameters Los parámetros de consulta
   * @returns True si se eliminó correctamente
   */
  deleteSchoolStaff(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/unassign-staff`, getHttpOptions(queryParameters));
  }

  /**
   * Obtiene staff asignados a una escuela específica
   * @param queryParameters Los parámetros de consulta
   * @returns Los staff asignados
   */
  getStaffBySchool(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-staff-by-school`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._schoolStaffs.next(response)));
  }

  /**
   * Obtiene escuelas asignadas a un staff específico
   * @param queryParameters Los parámetros de consulta
   * @returns Las escuelas asignadas
   */
  getSchoolsByStaff(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-schools-by-staff`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._schoolStaffs.next(response)));
  }

  /**
   * Actualiza el estado activo/inactivo de una asignación
   * @param queryParameters Los parámetros de consulta
   * @returns True si se actualizó correctamente
   */
  updateSchoolStaffActiveStatus(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-school-staff-active-status`, queryParameters, getHttpOptions(queryParameters));
  }
}
