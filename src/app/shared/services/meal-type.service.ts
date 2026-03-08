import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/common/QueryParameters';
import { MealType } from '../models/catalog/MealType';

@Injectable({
  providedIn: 'root',
})
export class MealTypeService {
  private _mealTypes: BehaviorSubject<MealType[] | null> = new BehaviorSubject(null);
  private _mealType: BehaviorSubject<MealType | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/meal-type`;
  private _httpClient = inject(HttpClient);

  constructor() {}

  /**
   * Obtiene todos los tipos de comida
   * @returns Los tipos de comida
   */
  get mealTypes$(): Observable<MealType[] | null> {
    return this._mealTypes.asObservable();
  }

  /**
   * Obtiene un tipo de comida
   * @returns El tipo de comida
   */
  get mealType$(): Observable<MealType | null> {
    return this._mealType.asObservable();
  }

  /**
   * Obtiene un tipo de comida por su ID
   * @param queryParameters Los parámetros de consulta
   * @returns El tipo de comida
   */
  getMealTypeById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-meal-type-by-id`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._mealType.next(response)));
  }

  /**
   * Obtiene todos los tipos de comida de la base de datos
   * @param queryParameters Los parámetros de consulta
   * @returns Los tipos de comida
   */
  getAllMealTypesFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-all-meal-types-from-db`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._mealTypes.next(response)));
  }

  /**
   * Inserta un tipo de comida
   * @param mealType El tipo de comida
   * @param queryParameters Los parámetros de consulta
   * @returns El tipo de comida insertado
   */
  insertMealType(mealType: MealType, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/insert-meal-type`, mealType, getHttpOptions(queryParameters));
  }

  /**
   * Actualiza un tipo de comida
   * @param mealType El tipo de comida
   * @param queryParameters Los parámetros de consulta
   * @returns El tipo de comida actualizado
   */
  updateMealType(mealType: MealType, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-meal-type`, mealType, getHttpOptions(queryParameters));
  }

  /**
   * Elimina un tipo de comida
   * @param queryParameters Los parámetros de consulta
   * @returns True si se eliminó correctamente
   */
  deleteMealType(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-meal-type`, getHttpOptions(queryParameters));
  }
}
