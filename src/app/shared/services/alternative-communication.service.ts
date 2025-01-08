import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/QueryParameters';
import { AlternativeCommunication } from '../models/AlternativeCommunication';

@Injectable({
  providedIn: 'root',
})
export class AlternativeCommunicationService {
  private _alternativeCommunications: BehaviorSubject<AlternativeCommunication[] | null> = new BehaviorSubject(null);
  private _alternativeCommunication: BehaviorSubject<AlternativeCommunication | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/alternative-communication`;
  private _httpClient = inject(HttpClient);

  constructor() {}

  /**
   * Obtiene todas las comunicaciones alternativas
   * @returns Las comunicaciones alternativas
   */
  get alternativeCommunications$(): Observable<AlternativeCommunication[] | null> {
    return this._alternativeCommunications.asObservable();
  }

  /**
   * Obtiene una comunicación alternativa
   * @returns La comunicación alternativa
   */
  get alternativeCommunication$(): Observable<AlternativeCommunication | null> {
    return this._alternativeCommunication.asObservable();
  }

  /**
   * Obtiene una comunicación alternativa por su ID
   * @param queryParameters Los parámetros de consulta
   * @returns La comunicación alternativa
   */
  getAlternativeCommunicationById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-alternative-communication-by-id`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._alternativeCommunication.next(response)));
  }

  /**
   * Obtiene todas las comunicaciones alternativas de la base de datos
   * @param queryParameters Los parámetros de consulta
   * @returns Las comunicaciones alternativas
   */
  getAllAlternativeCommunicationsFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-all-alternative-communications-from-db`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._alternativeCommunications.next(response)));
  }

  /**
   * Inserta una comunicación alternativa
   * @param alternativeCommunication La comunicación alternativa
   * @param queryParameters Los parámetros de consulta
   * @returns La comunicación alternativa insertada
   */
  insertAlternativeCommunication(alternativeCommunication: AlternativeCommunication, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/insert-alternative-communication`, alternativeCommunication, getHttpOptions(queryParameters));
  }

  /**
   * Actualiza una comunicación alternativa
   * @param alternativeCommunication La comunicación alternativa
   * @param queryParameters Los parámetros de consulta
   * @returns La comunicación alternativa actualizada
   */
  updateAlternativeCommunication(alternativeCommunication: AlternativeCommunication, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-alternative-communication`, alternativeCommunication, getHttpOptions(queryParameters));
  }

  /**
   * Elimina una comunicación alternativa
   * @param queryParameters Los parámetros de consulta
   * @returns True si se eliminó correctamente
   */
  deleteAlternativeCommunication(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-alternative-communication`, getHttpOptions(queryParameters));
  }
}
