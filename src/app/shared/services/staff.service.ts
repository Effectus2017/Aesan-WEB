import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { QueryParameters } from '../models/QueryParameters';
import { Staff } from '../models/Staff';
import { StaffRequest } from '../models/Request/StaffRequest';
import { getHttpOptions } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class StaffService {
  private _staff: BehaviorSubject<Staff | null> = new BehaviorSubject(null);
  private _staffs: BehaviorSubject<Staff[] | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/staff`;
  private _httpClient = inject(HttpClient);

  // Getters para observables
  get staffs$(): Observable<Staff[] | null> {
    return this._staffs.asObservable();
  }

  get staff$(): Observable<Staff | null> {
    return this._staff.asObservable();
  }

  /**
   * Obtiene un miembro del staff específico por ID
   * @param queryParams Parámetros de consulta que incluyen el ID del miembro del staff
   * @returns Observable con los datos del miembro del staff
   */
  getStaffById(queryParams: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-staff-by-id`, getHttpOptions(queryParams))
      .pipe(tap((response: any) => this._staff.next(response)));
  }

  /**
   * Obtiene todos los miembros del staff desde la base de datos
   * @param queryParams Parámetros de consulta (paginación, filtros, etc.)
   * @returns Observable con la lista de miembros del staff y el conteo total
   */
  getAllStaffFromDb(queryParams: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-all-staff-from-db`, getHttpOptions(queryParams))
      .pipe(tap((response: any) => this._staffs.next(response)));
  }

  /**
   * Inserta un nuevo miembro del staff
   * @param staffRequest Datos del miembro del staff a insertar
   * @param options Opciones HTTP adicionales
   * @returns Observable con el resultado de la inserción
   */
  insertStaff(staffRequest: StaffRequest, options: any = {}): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/insert-staff`, staffRequest, getHttpOptions(options));
  }

  /**
   * Actualiza un miembro del staff existente
   * @param staffRequest Datos del miembro del staff a actualizar
   * @param options Opciones HTTP adicionales
   * @returns Observable con el resultado de la actualización
   */
  updateStaff(staffRequest: StaffRequest, options: any = {}): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-staff`, staffRequest, getHttpOptions(options));
  }

  /**
   * Elimina un miembro del staff (baja lógica)
   * @param queryParams Parámetros de consulta que incluyen el ID del miembro del staff
   * @returns Observable con el resultado de la eliminación
   */
  deleteStaff(queryParams: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-staff`, getHttpOptions(queryParams));
  }

  /**
   * Convierte un miembro del staff en usuario del sistema
   * @param staffId ID del miembro del staff
   * @param userId ID del usuario
   * @returns Observable con el resultado de la conversión
   */
  convertStaffToUser(queryParams: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/convert-staff-to-user`, {}, getHttpOptions(queryParams));
  }

  /**
   * Verifica si existe un miembro del staff principal
   * @returns Observable con el resultado de la verificación
   */
  hasMainStaff(): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/has-main-staff`, getHttpOptions({}));
  }

  /**
   * Actualiza el estado activo de un miembro del staff
   * @param staffId ID del miembro del staff
   * @param isActive Nuevo estado activo
   * @returns Observable con el resultado de la actualización
   */
  updateStaffActiveStatus(queryParams: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-staff-active-status`, {}, getHttpOptions(queryParams));
  }
}
