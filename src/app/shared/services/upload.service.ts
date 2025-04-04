import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { QueryParameters } from '../models/QueryParameters';
import { environment } from 'environments/environment';
import { Constants } from '../const';
import { getHttpOptions, normalizeImageUrl } from '../utils';

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private http: HttpClient = inject(HttpClient);
  private apiUrl = `${environment.baseHttpUrl}/upload/uploadFile`;

  fileUpload(params: QueryParameters, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('upFile', file);
    const query = getHttpOptions(params).params.toString();
    return this.http.post<any>(this.apiUrl + `?${query}`, formData, Constants.headersUpload);
  }

  /**
   * Normaliza una URL de imagen para asegurar que las barras invertidas se manejen correctamente
   * @param imageUrl URL de la imagen a normalizar
   * @returns URL normalizada
   */
  normalizeImageUrl(imageUrl: string): string {
    return normalizeImageUrl(imageUrl);
  }
}
