import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { QueryParameters } from '../models/common/QueryParameters';
import { getHttpOptions } from '../utils';
import {
  DTOStaffRelationship,
  CreateStaffRelationshipRequest,
  UpdateStaffRelationshipRequest
} from '../models/staff/StaffRelationship';

@Injectable({
  providedIn: 'root'
})
export class StaffRelationshipService {
  private _relationships: BehaviorSubject<DTOStaffRelationship[] | null> = new BehaviorSubject(null);
  private _relationship: BehaviorSubject<DTOStaffRelationship | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/staff-relationship`;
  private _httpClient = inject(HttpClient);

  // Getters para observables
  get relationships$(): Observable<DTOStaffRelationship[] | null> {
    return this._relationships.asObservable();
  }

  get relationship$(): Observable<DTOStaffRelationship | null> {
    return this._relationship.asObservable();
  }

  /**
   * Obtiene todas las relaciones de un empleado específico
   * @param queryParams Parámetros de consulta que incluyen el staffId
   * @returns Observable con la lista de relaciones del empleado
   */
  getRelationshipsByStaffId(queryParams: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-relationships-by-staff-id`, getHttpOptions(queryParams))
      .pipe(tap((response: any) => this._relationships.next(response)));
  }

  /**
   * Obtiene una relación específica por su ID
   * @param queryParams Parámetros de consulta que incluyen el ID de la relación
   * @returns Observable con los datos de la relación
   */
  getRelationshipById(queryParams: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-relationship-by-id`, getHttpOptions(queryParams))
      .pipe(tap((response: any) => this._relationship.next(response)));
  }

  /**
   * Obtiene todas las relaciones activas de la agencia
   * @param queryParams Parámetros de consulta (paginación, filtros, etc.)
   * @returns Observable con la lista de todas las relaciones activas
   */
  getAllActiveRelationshipsFromDb(queryParams: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-all-active-relationships-from-db`, getHttpOptions(queryParams))
      .pipe(tap((response: any) => this._relationships.next(response)));
  }

  /**
   * Obtiene las relaciones por tipo específico
   * @param queryParams Parámetros de consulta que incluyen el relationshipTypeId
   * @returns Observable con la lista de relaciones del tipo especificado
   */
  getRelationshipsByType(queryParams: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-relationships-by-type`, getHttpOptions(queryParams))
      .pipe(tap((response: any) => this._relationships.next(response)));
  }

  /**
   * Crea una nueva relación entre empleados
   * @param request Datos de la relación a crear
   * @param queryParams Parámetros adicionales
   * @returns Observable con el resultado de la creación
   */
  createRelationship(request: CreateStaffRelationshipRequest, queryParams: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/insert-staff-relationship`, request, getHttpOptions(queryParams));
  }

  /**
   * Actualiza una relación existente
   * @param request Datos de la relación a actualizar
   * @param queryParams Parámetros adicionales
   * @returns Observable con el resultado de la actualización
   */
  updateRelationship(request: UpdateStaffRelationshipRequest, queryParams: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-staff-relationship`, request, getHttpOptions(queryParams));
  }

  /**
   * Desactiva una relación (soft delete)
   * @param queryParams Parámetros de consulta que incluyen el ID de la relación
   * @returns Observable con el resultado de la desactivación
   */
  deactivateRelationship(queryParams: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-staff-relationship`, getHttpOptions(queryParams));
  }

  /**
   * Verifica si existe una relación activa entre dos empleados
   * @param queryParams Parámetros de consulta que incluyen staffId y relatedStaffId
   * @returns Observable con el resultado de la verificación
   */
  relationshipExists(queryParams: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/relationship-exists`, getHttpOptions(queryParams));
  }
}
