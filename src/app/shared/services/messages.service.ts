import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/QueryParameters';
import { Message } from '../models/Message';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  private _messages: BehaviorSubject<Message[] | null> = new BehaviorSubject(null);
  private _message: BehaviorSubject<Message | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/messages`;
  private _httpClient = inject(HttpClient);

  constructor() {}

  /**
   * Obtiene todos los mensajes
   * @returns Los mensajes
   */
  get messages$(): Observable<Message[] | null> {
    return this._messages.asObservable();
  }

  /**
   * Obtiene un mensaje
   * @returns El mensaje
   */
  get message$(): Observable<Message | null> {
    return this._message.asObservable();
  }

  /**
   * Obtiene un mensaje por su ID
   * @param queryParameters Los parámetros de consulta
   * @returns El mensaje
   */
  getMessageById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-message-by-id`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._message.next(response)));
  }

  /**
   * Obtiene todos los mensajes de la base de datos
   * @param queryParameters Los parámetros de consulta
   * @returns Los mensajes
   */
  getAllMessagesFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-all-messages`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._messages.next(response)));
  }

  /**
   * Inserta un mensaje
   * @param message El mensaje
   * @param queryParameters Los parámetros de consulta
   * @returns El mensaje insertado
   */
  insertMessage(message: Message, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/insert-message`, message, getHttpOptions(queryParameters));
  }

  /**
   * Actualiza un mensaje
   * @param message El mensaje
   * @param queryParameters Los parámetros de consulta
   * @returns El mensaje actualizado
   */
  updateMessage(message: Message, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-message`, message, getHttpOptions(queryParameters));
  }

  /**
   * Elimina un mensaje
   * @param queryParameters Los parámetros de consulta
   * @returns True si se eliminó correctamente
   */
  deleteMessage(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-message`, getHttpOptions(queryParameters));
  }

  /**
   * Marca todos los mensajes como leídos
   * @param queryParameters Los parámetros de consulta
   * @returns True si se marcaron correctamente
   */
  markAllMessagesAsRead(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/mark-all-as-read`, {}, getHttpOptions(queryParameters));
  }

  /**
   * Marca un mensaje como leído
   * @param queryParameters Los parámetros de consulta
   * @returns True si se marcó correctamente
   */
  markMessageAsRead(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/mark-as-read`, {}, getHttpOptions(queryParameters));
  }

  /**
   * Obtiene el conteo de mensajes no leídos
   * @param queryParameters Los parámetros de consulta
   * @returns El conteo de mensajes no leídos
   */
  getUnreadMessageCount(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-unread-message-count`, getHttpOptions(queryParameters));
  }
}
