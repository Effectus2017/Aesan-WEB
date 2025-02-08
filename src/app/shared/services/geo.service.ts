import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/QueryParameters';
import { City } from '../models/City';
import { Region } from '../models/Region';
import { CityRegion } from '../models/CityRegion';

@Injectable({
  providedIn: 'root',
})
export class GeoService {
  private _cities: BehaviorSubject<City[] | null> = new BehaviorSubject(null);
  private _regions: BehaviorSubject<Region[] | null> = new BehaviorSubject(null);
  private _cityRegions: BehaviorSubject<CityRegion[] | null> = new BehaviorSubject(null);

  private _city: BehaviorSubject<City | null> = new BehaviorSubject(null);
  private _region: BehaviorSubject<Region | null> = new BehaviorSubject(null);
  private _cityRegion: BehaviorSubject<CityRegion | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/geo`;

  // Inyección del HttpClient
  private _httpClient = inject(HttpClient);

  /**
   * Obtiene todas las ciudades.
   * @returns Un observable que emite todas las ciudades.
   */
  get cities$(): Observable<City[]> {
    return this._cities.asObservable();
  }

  /**
   * Obtiene todas las regiones.
   * @returns Un observable que emite todas las regiones.
   */
  get regions$(): Observable<Region[]> {
    return this._regions.asObservable();
  }

  /**
   * Obtiene una ciudad específica.
   * @returns Un observable que emite la ciudad obtenida.
   */
  get city$(): Observable<City | null> {
    return this._city.asObservable();
  }

  /**
   * Obtiene una región específica.
   * @returns Un observable que emite la región obtenida.
   */
  get region$(): Observable<Region | null> {
    return this._region.asObservable();
  }

  get cityRegions$(): Observable<CityRegion[] | null> {
    return this._cityRegions.asObservable();
  }

  get cityRegion$(): Observable<CityRegion | null> {
    return this._cityRegion.asObservable();
  }

  /**
   * Obtiene todas las ciudades.
   * @param queryParameters Los parámetros de consulta para filtrar las ciudades.
   * @returns Un observable que emite todas las ciudades.
   */
  getCitiesFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-all-cities-from-db`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._cities.next(response)));
  }

  /**
   * Obtiene una ciudad específica por su ID.
   * @param queryParameters Los parámetros de consulta que incluyen el ID de la ciudad.
   * @returns Un observable que emite la ciudad obtenida.
   */
  getCityById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-city-by-id`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._city.next(response)));
  }

  /**
   * Obtiene todas las regiones.
   * @param queryParameters Los parámetros de consulta para filtrar las regiones.
   * @returns Un observable que emite todas las regiones.
   */
  getRegionsFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-all-regions-from-db`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._regions.next(response)));
  }

  /**
   * Obtiene las regiones por el ID de la ciudad.
   * @param queryParameters Los parámetros de consulta que incluyen el ID de la ciudad.
   * @returns Un observable que emite las regiones obtenidas.
   */
  getRegionsByCityId(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-regions-by-city-id`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._region.next(response)));
  }

  /**
   * Obtiene una región específica por su ID.
   * @param queryParameters Los parámetros de consulta que incluyen el ID de la región.
   * @returns Un observable que emite la región obtenida.
   */
  getRegionById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-region-by-id`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._region.next(response)));
  }

  /**
   * Obtiene las ciudades disponibles para una región específica
   * @param queryParameters Los parámetros de consulta que incluyen el ID de la región
   */
  getCitiesByRegionId(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-cities-by-region-id`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._cities.next(response)));
  }

  /**
   * Obtiene la relación CityRegion por IDs de ciudad y región
   * @param queryParameters Los parámetros de consulta que incluyen cityId y regionId
   */
  getCityRegion(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-city-region`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._cityRegion.next(response)));
  }

  /**
   * Obtiene todas las relaciones CityRegion
   * @param queryParameters Los parámetros de consulta para filtrar las relaciones
   */
  getAllCityRegions(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-all-city-regions`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._cityRegions.next(response)));
  }
}
