import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/QueryParameters';
import { School } from '../models/School';
import { SchoolRequest } from "../models/Request/SchoolRequest";

@Injectable({
  providedIn: 'root',
})
export class SchoolService {
  private _schools: BehaviorSubject<School[] | null> = new BehaviorSubject(null);
  private _school: BehaviorSubject<School | null> = new BehaviorSubject(null);
  private _centers: BehaviorSubject<School[] | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/school`;
  private _httpClient = inject(HttpClient);

  constructor() {}

  /**
   * Obtiene todas las escuelas
   * @returns Las escuelas
   */
  get schools$(): Observable<School[] | null> {
    return this._schools.asObservable();
  }

  /**
   * Obtiene una escuela
   * @returns La escuela
   */
  get school$(): Observable<School | null> {
    return this._school.asObservable();
  }

  /**
   * Obtiene todos los centros
   * @returns Los centros
   */
  get centers$(): Observable<School[] | null> {
    return this._centers.asObservable();
  }

  /**
   * Obtiene todas las escuelas desde la base de datos
   * @param queryParameters Los parámetros de consulta
   * @returns Observable con la respuesta
   */
  getAllSchoolsFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-all-schools`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._schools.next(response)));
  }

  /**
   * Obtiene una escuela por su ID
   * @param queryParameters Los parámetros de consulta que incluyen el ID
   * @returns Observable con la escuela
   */
  getSchoolById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-school-by-id`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._school.next(response)));
  }

  /**
   * Obtiene escuelas por ID de agencia
   * @param queryParameters Los parámetros de consulta que incluyen el agencyId
   * @returns Observable con las escuelas
   */
  getSchoolsByAgencyId(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-schools-by-agency`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._schools.next(response)));
  }

  /**
   * Obtiene centros por ID de agencia
   * @param queryParameters Los parámetros de consulta que incluyen el agencyId
   * @returns Observable con los centros
   */
  getCentersByAgencyId(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-schools-by-agency`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._centers.next(response)));
  }

  /**
   * Inserta una escuela
   * @param schoolRequest La escuela
   * @param queryParameters Los parámetros de consulta
   * @returns La escuela insertada
   */
  insertSchool(schoolRequest: SchoolRequest, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/insert-school`, schoolRequest, getHttpOptions(queryParameters));
  }

  /**
   * Actualiza una escuela
   * @param schoolRequest La escuela
   * @param queryParameters Los parámetros de consulta
   * @returns La escuela actualizada
   */
  updateSchool(schoolRequest: SchoolRequest, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-school`, schoolRequest, getHttpOptions(queryParameters));
  }

  /**
   * Elimina una escuela (baja lógica)
   * @param queryParameters Los parámetros de consulta que incluyen el ID de la escuela
   * @returns Observable con la respuesta
   */
  deleteSchool(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-school`, getHttpOptions(queryParameters));
  }
}
