import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/common/QueryParameters';
import { AgencyFile } from '../models/agency/AgencyFile';

@Injectable({
  providedIn: 'root',
})
export class AgencyFilesService {
  private _files: BehaviorSubject<AgencyFile[] | null> = new BehaviorSubject(null);
  private _file: BehaviorSubject<AgencyFile | null> = new BehaviorSubject(null);

  // Inyección de servicios
  private _httpClient = inject(HttpClient);
  private _baseUrl = `${environment.baseHttpUrl}/agency-files`;

  constructor() {}

  /**
   * Obtiene todos los archivos
   */
  get files$(): Observable<AgencyFile[] | null> {
    return this._files.asObservable();
  }

  /**
   * Obtiene un archivo específico
   */
  get file$(): Observable<AgencyFile | null> {
    return this._file.asObservable();
  }

  /**
   * Obtiene un archivo específico por su ID
   * @param queryParameters Los parámetros de consulta
   * @returns Observable con la información del archivo
   */
  getAgencyFileById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get<any>(`${this._baseUrl}/get-agency-file-by-id`, getHttpOptions(queryParameters)).pipe(
      tap((response: any) => {
        this._file.next(response);
      })
    );
  }

  /**
   * Obtiene los archivos de una agencia
   * @param queryParameters Los parámetros de consulta
   * @returns Observable con la lista paginada de archivos
   */
  getAgencyFiles(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get<any>(`${this._baseUrl}/get-agency-files-from-db`, getHttpOptions(queryParameters)).pipe(
      tap((response: any) => {
        this._files.next(response);
      })
    );
  }

  /**
   * Elimina un archivo
   * @param queryParameters Los parámetros de consulta
   * @returns Observable con el resultado de la operación
   */
  deleteAgencyFile(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this._baseUrl}/delete-agency-file`, getHttpOptions(queryParameters));
  }

  /**
   * Verifica un archivo
   * @param queryParameters Los parámetros de consulta
   * @returns Observable con el resultado de la operación
   */
  verifyAgencyFile(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this._baseUrl}/verify-agency-file`, null, getHttpOptions(queryParameters));
  }
}
