import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/QueryParameters';
import { School } from '../models/School';

@Injectable({
  providedIn: 'root',
})
export class SchoolService {
  private _schools: BehaviorSubject<School[] | null> = new BehaviorSubject(null);
  private _school: BehaviorSubject<School | null> = new BehaviorSubject(null);

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
   * Obtiene una escuela por su ID
   * @param queryParameters Los parámetros de consulta
   * @returns La escuela
   */
  getSchoolById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-school-by-id`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._school.next(response)));
  }

  /**
   * Obtiene todas las escuelas de la base de datos
   * @param queryParameters Los parámetros de consulta
   * @returns Las escuelas
   */
  getAllSchoolsFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-all-schools-from-db`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._schools.next(response)));
  }

  /**
   * Inserta una escuela
   * @param school La escuela
   * @param queryParameters Los parámetros de consulta
   * @returns La escuela insertada
   */
  insertSchool(school: School, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/insert-school`, school, getHttpOptions(queryParameters));
  }

  /**
   * Actualiza una escuela
   * @param school La escuela
   * @param queryParameters Los parámetros de consulta
   * @returns La escuela actualizada
   */
  updateSchool(school: School, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-school`, school, getHttpOptions(queryParameters));
  }

  /**
   * Elimina una escuela
   * @param queryParameters Los parámetros de consulta
   * @returns True si se eliminó correctamente
   */
  deleteSchool(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-school`, getHttpOptions(queryParameters));
  }
}
