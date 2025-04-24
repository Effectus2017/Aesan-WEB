import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/QueryParameters';
import { AgencyFile } from '../models/AgencyFile';
import { AgencyFilesResponse } from '../models/AgencyFilesResponse';

@Injectable({
  providedIn: 'root',
})
export class AgencyFilesService {
  private _files: BehaviorSubject<AgencyFile[] | null> = new BehaviorSubject(null);
  private _file: BehaviorSubject<AgencyFile | null> = new BehaviorSubject(null);

  // Inyección de servicios
  private _httpClient = inject(HttpClient);
  private _authService = inject(AuthService);
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
  getAgencyFileById(queryParameters: QueryParameters): Observable<AgencyFile> {
    return this._httpClient.get<AgencyFile>(`${this._baseUrl}/get-agency-file-by-id`, getHttpOptions(queryParameters)).pipe(
      tap((response: AgencyFile) => {
        this._file.next(response);
      })
    );
  }

  /**
   * Obtiene los archivos de una agencia
   * @param queryParameters Los parámetros de consulta
   * @returns Observable con la lista paginada de archivos
   */
  getAgencyFiles(queryParameters: QueryParameters): Observable<AgencyFilesResponse> {
    return this._httpClient.get<AgencyFilesResponse>(`${this._baseUrl}/get-agency-files-from-db`, getHttpOptions(queryParameters)).pipe(
      tap((response: AgencyFilesResponse) => {
        this._files.next(response.data);
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
