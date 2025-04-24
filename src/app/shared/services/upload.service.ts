import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { Constants } from '../const';
import { QueryParameters } from '../models/QueryParameters';
import { getHttpOptions } from '../utils';

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private _httpClient = inject(HttpClient);
  private _baseUrl = `${environment.baseHttpUrl}/upload`;

  /**
   * Sube un archivo para una agencia específica
   * @param agencyId ID de la agencia
   * @param file Archivo a subir
   * @param description Descripción opcional del archivo
   * @param documentType Tipo de documento opcional
   * @returns Observable con la respuesta del servidor
   */
  uploadAgencyFile(params: QueryParameters, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('upFile', file);
    const query = getHttpOptions(params).params.toString();
    return this._httpClient.post<any>(`${this._baseUrl}/upload-agency-file?${query}`, formData, Constants.headersUpload);
  }

  /**
   * Sube un logo para una agencia específica
   * @param agencyId ID de la agencia
   * @param file Archivo de imagen a subir
   * @returns Observable con la respuesta del servidor
   */
  uploadAgencyLogo(params: QueryParameters, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('upFile', file);
    const query = getHttpOptions(params).params.toString();
    return this._httpClient.post<any>(`${this._baseUrl}/upload-agency-logo?${query}`, formData, Constants.headersUpload);
  }

  /**
   * Sube un avatar para un usuario
   * @param file Archivo de imagen a subir
   * @returns Observable con la respuesta del servidor
   */
  uploadUserAvatar(params: QueryParameters, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('upFile', file);
    const query = getHttpOptions(params).params.toString();
    return this._httpClient.post<any>(`${this._baseUrl}/upload-user-avatar?${query}`, formData, Constants.headersUpload);
  }

  /**
   * Normaliza una URL de imagen para asegurar que las barras invertidas se manejen correctamente
   * @param imageUrl URL de la imagen a normalizar
   * @returns URL normalizada
   */
  normalizeImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    return imageUrl.replace(/\\/g, '/');
  }
}
