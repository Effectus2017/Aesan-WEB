import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/common/QueryParameters';
import { EducationLevel } from '../models/catalog/EducationLevel';

@Injectable({
  providedIn: 'root',
})
export class EducationLevelService {
  private _educationLevels: BehaviorSubject<EducationLevel[] | null> = new BehaviorSubject(null);
  private _educationLevel: BehaviorSubject<EducationLevel | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/education-level`;
  private _httpClient = inject(HttpClient);

  constructor() {}

  /**
   * Obtiene todos los niveles educativos
   * @returns Los niveles educativos
   */
  get educationLevels$(): Observable<EducationLevel[] | null> {
    return this._educationLevels.asObservable();
  }

  /**
   * Obtiene un nivel educativo
   * @returns El nivel educativo
   */
  get educationLevel$(): Observable<EducationLevel | null> {
    return this._educationLevel.asObservable();
  }

  /**
   * Obtiene un nivel educativo por su ID
   * @param queryParameters Los parámetros de consulta
   * @returns El nivel educativo
   */
  getEducationLevelById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-education-level-by-id`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._educationLevel.next(response)));
  }

  /**
   * Obtiene todos los niveles educativos de la base de datos
   * @param queryParameters Los parámetros de consulta
   * @returns Los niveles educativos
   */
  getAllEducationLevelsFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-all-education-levels-from-db`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._educationLevels.next(response)));
  }

  /**
   * Inserta un nivel educativo
   * @param educationLevel El nivel educativo
   * @param queryParameters Los parámetros de consulta
   * @returns El nivel educativo insertado
   */
  insertEducationLevel(educationLevel: EducationLevel, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/insert-education-level`, educationLevel, getHttpOptions(queryParameters));
  }

  /**
   * Actualiza un nivel educativo
   * @param educationLevel El nivel educativo
   * @param queryParameters Los parámetros de consulta
   * @returns El nivel educativo actualizado
   */
  updateEducationLevel(educationLevel: EducationLevel, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-education-level`, educationLevel, getHttpOptions(queryParameters));
  }

  /**
   * Elimina un nivel educativo
   * @param queryParameters Los parámetros de consulta
   * @returns True si se eliminó correctamente
   */
  deleteEducationLevel(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-education-level`, getHttpOptions(queryParameters));
  }
}
