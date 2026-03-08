import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/common/QueryParameters';
import { OperatingPolicy } from '../models/household/OperatingPolicy';
import { OperatingPolicyRequest } from '../models/request/OperatingPolicyRequest';

@Injectable({
  providedIn: 'root',
})
export class OperatingPolicyService {
  private _operatingPolicies: BehaviorSubject<OperatingPolicy[] | null> = new BehaviorSubject(null);
  private _operatingPolicy: BehaviorSubject<OperatingPolicy | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/operating-policy`;
  private _httpClient = inject(HttpClient);

  constructor() {}

  /**
   * Obtiene todas las políticas operativas
   * @returns Las políticas operativas
   */
  get operatingPolicies$(): Observable<OperatingPolicy[] | null> {
    return this._operatingPolicies.asObservable();
  }

  /**
   * Obtiene una política operativa
   * @returns La política operativa
   */
  get operatingPolicy$(): Observable<OperatingPolicy | null> {
    return this._operatingPolicy.asObservable();
  }

  /**
   * Obtiene una política operativa por su ID
   * @param queryParameters Los parámetros de consulta
   * @returns La política operativa
   */
  getOperatingPolicyById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-operating-policy-by-id`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._operatingPolicy.next(response)));
  }

  /**
   * Obtiene todas las políticas operativas de la base de datos
   * @param queryParameters Los parámetros de consulta
   * @returns Las políticas operativas
   */
  getAllOperatingPoliciesFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-all-operating-policies-from-db`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._operatingPolicies.next(response)));
  }

  /**
   * Inserta una política operativa
   * @param operatingPolicy La política operativa
   * @param queryParameters Los parámetros de consulta
   * @returns La política operativa insertada
   */
  insertOperatingPolicy(operatingPolicy: OperatingPolicy | OperatingPolicyRequest, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/insert-operating-policy`, operatingPolicy, getHttpOptions(queryParameters));
  }

  /**
   * Actualiza una política operativa
   * @param operatingPolicy La política operativa
   * @param queryParameters Los parámetros de consulta
   * @returns La política operativa actualizada
   */
  updateOperatingPolicy(operatingPolicy: OperatingPolicy, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-operating-policy`, operatingPolicy, getHttpOptions(queryParameters));
  }

  /**
   * Elimina una política operativa
   * @param queryParameters Los parámetros de consulta
   * @returns True si se eliminó correctamente
   */
  deleteOperatingPolicy(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-operating-policy`, getHttpOptions(queryParameters));
  }
}
