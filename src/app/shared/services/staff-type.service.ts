import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { QueryParameters } from '../models/QueryParameters';
import { StaffType } from '../models/StaffType';
import { StaffTypeRequest } from '../models/Request/StaffTypeRequest';
import { getHttpOptions } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class StaffTypeService {
  private _staffTypes: BehaviorSubject<StaffType[] | null> = new BehaviorSubject(null);
  private _staffType: BehaviorSubject<StaffType | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/staff-type`;
  private _httpClient = inject(HttpClient);

  // Getters para observables
  get staffTypes$(): Observable<StaffType[] | null> {
    return this._staffTypes.asObservable();
  }

  get staffType$(): Observable<StaffType | null> {
    return this._staffType.asObservable();
  }

  /**
   * Obtiene un tipo de staff específico por ID
   * @param queryParams Parámetros de consulta que incluyen el ID del tipo de staff
   * @returns Observable con los datos del tipo de staff
   */
  getStaffTypeById(queryParams: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-staff-type-by-id`, getHttpOptions(queryParams))
      .pipe(tap((response: any) => this._staffType.next(response)));
  }

  /**
   * Obtiene todos los tipos de staff desde la base de datos
   * @param queryParams Parámetros de consulta (paginación, filtros, etc.)
   * @returns Observable con la lista de tipos de staff y el conteo total
   * @note El caché se maneja automáticamente mediante el interceptor HTTP
   */
  getAllStaffTypesFromDb(queryParams: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-all-staff-types-from-db`, getHttpOptions(queryParams))
      .pipe(tap((response: any) => this._staffTypes.next(response)));
  }

  /**
   * Inserta un nuevo tipo de staff
   * @param staffTypeRequest Datos del tipo de staff a insertar
   * @param options Opciones HTTP adicionales
   * @returns Observable con el resultado de la inserción
   */
  insertStaffType(staffTypeRequest: StaffTypeRequest, options: any = {}): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/insert-staff-type`, staffTypeRequest, getHttpOptions(options));
  }

  /**
   * Actualiza un tipo de staff existente
   * @param staffTypeRequest Datos del tipo de staff a actualizar
   * @param options Opciones HTTP adicionales
   * @returns Observable con el resultado de la actualización
   */
  updateStaffType(staffTypeRequest: StaffTypeRequest, options: any = {}): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-staff-type`, staffTypeRequest, getHttpOptions(options));
  }

  /**
   * Elimina un tipo de staff (baja lógica)
   * @param queryParams Parámetros de consulta que incluyen el ID del tipo de staff
   * @returns Observable con el resultado de la eliminación
   */
  deleteStaffType(queryParams: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-staff-type`, getHttpOptions(queryParams));
  }
}
