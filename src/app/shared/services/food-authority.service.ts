import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/common/QueryParameters';
import { FoodAuthority } from '../models/FoodAuthority';

@Injectable({
  providedIn: 'root',
})
export class FoodAuthorityService {
  private _foodAuthorities: BehaviorSubject<FoodAuthority[] | null> = new BehaviorSubject(null);
  private _foodAuthority: BehaviorSubject<FoodAuthority | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/food-authority`;
  private _httpClient = inject(HttpClient);

  constructor() {}

  /**
   * Obtiene todas las autoridades alimentarias
   * @returns Las autoridades alimentarias
   */
  get foodAuthorities$(): Observable<FoodAuthority[] | null> {
    return this._foodAuthorities.asObservable();
  }

  /**
   * Obtiene una autoridad alimentaria
   * @returns La autoridad alimentaria
   */
  get foodAuthority$(): Observable<FoodAuthority | null> {
    return this._foodAuthority.asObservable();
  }

  /**
   * Obtiene una autoridad alimentaria por su ID
   * @param queryParameters Los parámetros de consulta
   * @returns La autoridad alimentaria
   */
  getFoodAuthorityById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-food-authority-by-id`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._foodAuthority.next(response)));
  }

  /**
   * Obtiene todas las autoridades alimentarias de la base de datos
   * @param queryParameters Los parámetros de consulta
   * @returns Las autoridades alimentarias
   */
  getAllFoodAuthoritiesFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-all-food-authorities-from-db`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._foodAuthorities.next(response)));
  }

  /**
   * Inserta una autoridad alimentaria
   * @param foodAuthority La autoridad alimentaria
   * @param queryParameters Los parámetros de consulta
   * @returns La autoridad alimentaria insertada
   */
  insertFoodAuthority(foodAuthority: FoodAuthority, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/insert-food-authority`, foodAuthority, getHttpOptions(queryParameters));
  }

  /**
   * Actualiza una autoridad alimentaria
   * @param foodAuthority La autoridad alimentaria
   * @param queryParameters Los parámetros de consulta
   * @returns La autoridad alimentaria actualizada
   */
  updateFoodAuthority(foodAuthority: FoodAuthority, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-food-authority`, foodAuthority, getHttpOptions(queryParameters));
  }

  /**
   * Elimina una autoridad alimentaria
   * @param queryParameters Los parámetros de consulta
   * @returns True si se eliminó correctamente
   */
  deleteFoodAuthority(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-food-authority`, getHttpOptions(queryParameters));
  }
}
