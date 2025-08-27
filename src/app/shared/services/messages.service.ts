import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/QueryParameters';
import { Message } from '../models/Message';
import { MessagesRealtimeService } from './messages-realtime.service';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  private _messages: BehaviorSubject<Message[] | null> = new BehaviorSubject(null);
  private _message: BehaviorSubject<Message | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/messages`;
  private _httpClient = inject(HttpClient);
  private _realtime = inject(MessagesRealtimeService);

  constructor() {}

  // Getters para el servicio en tiempo real
  get messages() { return this._realtime.messages; }
  get unreadCount() { return this._realtime.unreadCount; }
  get isConnected() { return this._realtime.isConnected; }

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
      .pipe(
        tap((response: any) => {
          const list = Array.isArray(response)
            ? response
            : Array.isArray(response?.body?.data)
            ? response.body.data
            : Array.isArray(response?.body)
            ? response.body
            : Array.isArray(response?.data)
            ? response.data
            : [];
          this._messages.next(list);
        })
      );
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

  /**
   * Inicializa el servicio con mensajes iniciales y conecta SignalR
   * @param userId ID del usuario (opcional)
   */
  async init(userId?: string): Promise<void> {
    console.log('🚀 Inicializando servicio de mensajes...', { userId });

    try {
      // Crear parámetros solo si userId está definido
      const params = userId ? { userId } : {};

      const [list, unread] = await Promise.all([
        this._httpClient.get<Message[]>(`${this.apiUrl}/get-all-messages`, getHttpOptions(params)).toPromise(),
        this._httpClient.get<number>(`${this.apiUrl}/get-unread-message-count`, getHttpOptions(params)).toPromise(),
      ]);

      console.log('📋 Mensajes iniciales cargados:', { count: list?.length || 0, unread: unread || 0 });

      this._realtime.setInitialMessages(list ?? [], unread ?? 0);

      // Intentar conectar SignalR cuando la autenticación esté lista
      this.tryConnectSignalR();

      console.log('✅ Servicio de mensajes inicializado correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar servicio de mensajes:', error);
      throw error;
    }
  }

  /**
   * Intenta conectar SignalR cuando la autenticación esté lista
   */
  private async tryConnectSignalR(): Promise<void> {
    // Esperar hasta que el usuario esté autenticado
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      if (this._realtime['_authService'].accessToken) {
        console.log('🔐 Usuario autenticado, conectando SignalR...');
        await this._realtime.connect();
        return;
      }

      console.log(`⏳ Esperando autenticación... (intento ${attempts + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    console.log('⚠️ No se pudo conectar SignalR después de varios intentos');
  }

  /**
   * Desconecta SignalR y limpia recursos
   */
  dispose(): void {
    this._realtime.disconnect();
  }
}
