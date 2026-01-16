import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/QueryParameters';
import { ResendEmailRequest } from '../models/EmailLog';

@Injectable({
  providedIn: 'root',
})
export class EmailLogService {
  private apiUrl = `${environment.baseHttpUrl}/emaillog`;
  private _httpClient = inject(HttpClient);

  /**
   * Obtiene todos los logs de correo electrónico de un usuario específico
   * @param queryParameters Parámetros de consulta que incluyen el UserId
   * @returns Observable con la lista de logs
   */
  getEmailLogsByUserId(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(
      `${this.apiUrl}/get-email-logs-by-user-id`,
      getHttpOptions(queryParameters)
    );
  }

  /**
   * Obtiene todos los logs de correo electrónico para un email específico
   * @param queryParameters Parámetros de consulta que incluyen el Email
   * @returns Observable con la lista de logs
   */
  getEmailLogsByEmail(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(
      `${this.apiUrl}/get-email-logs-by-email`,
      getHttpOptions(queryParameters)
    );
  }

  /**
   * Obtiene un log de correo electrónico específico por su ID
   * @param queryParameters Parámetros de consulta que incluyen el ID
   * @returns Observable con el log
   */
  getEmailLogById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(
      `${this.apiUrl}/get-email-log-by-id`,
      getHttpOptions(queryParameters)
    );
  }

  /**
   * Obtiene los logs de correos fallidos
   * @param queryParameters Parámetros de consulta que incluyen el Email (opcional)
   * @returns Observable con la lista de logs fallidos
   */
  getFailedEmailLogs(queryParameters: QueryParameters = {}): Observable<any> {
    return this._httpClient.get(
      `${this.apiUrl}/get-failed-email-logs`,
      getHttpOptions(queryParameters)
    );
  }

  /**
   * Reenvía un correo electrónico basado en un log existente
   * @param emailLogId ID del log de correo a reenviar
   * @param forceResend Si es true, reenvía incluso si el correo original fue exitoso
   * @returns Observable con el resultado del reenvío
   */
  resendEmail(emailLogId: number, forceResend: boolean = false): Observable<any> {
    const request: ResendEmailRequest = {
      emailLogId,
      forceResend
    };
    return this._httpClient.post(
      `${this.apiUrl}/resend`,
      request,
      getHttpOptions({})
    );
  }
}
