import { Injectable, signal } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import type { Message } from '../../shared/models/user/Message';
import { AuthService } from '../../core/auth/auth.service';
import { AudioService } from '../services/audio.service';
import { BrowserNotificationService } from './browser-notification.service';

@Injectable({ providedIn: 'root' })
export class MessagesRealtimeService {
  private hubConnection?: HubConnection;
  private _isManualDisconnect = false;
  private _handlersRegistered = false;

  private _messages = signal<Message[]>([]);
  private _unreadCount = signal<number>(0);
  private _isConnected = signal<boolean>(false);

  readonly messages = this._messages.asReadonly();
  readonly unreadCount = this._unreadCount.asReadonly();
  readonly isConnected = this._isConnected.asReadonly();

  constructor(
    private _authService: AuthService,
    private _audioService: AudioService,
    private _browserNotificationService: BrowserNotificationService
  ) {}

  /**
   * El hub exige JWT ([Authorize]); el token va vía accessTokenFactory (negociación SignalR / query access_token en el servidor).
   */
  private buildConnection(): HubConnection {
    const hubUrl = `${environment.baseHttpUrl}/hubs/messages`;

    return new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => {
          const token = this._authService.accessToken;
          return token
            ? Promise.resolve(token)
            : Promise.reject(new Error('JWT requerido para conectar al hub de mensajes'));
        },
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();
  }

  async connect(): Promise<void> {
    if (this.hubConnection?.state === HubConnectionState.Connected) return;

    // Verificar que el usuario esté autenticado antes de conectar
    if (!this._authService.accessToken) {
      console.log('⏳ Usuario no autenticado, esperando...');
      return;
    }

    console.log('🔄 Iniciando conexión SignalR...');

    // Si ya existe una conexión, desconectarla primero
    if (this.hubConnection) {
      await this.disconnect();
    }

    this.hubConnection = this.buildConnection();
    this._handlersRegistered = false;
    this.registerHandlers(this.hubConnection);
    this.registerLifecycleHandlers(this.hubConnection);

    try {
      await this.hubConnection.start();
      console.log('✅ SignalR conectado exitosamente');
      this._isConnected.set(true);
    } catch (err: any) {
      console.error('❌ SignalR connection error:', err);
      this._isConnected.set(false);

      // Si es error de autenticación, intentar reconectar después de un delay
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        console.log('🔄 Error de autenticación, reintentando en 5 segundos...');
        setTimeout(() => {
          if (this._authService.accessToken) {
            this.reconnect();
          }
        }, 5000);
      }
    }
  }

  private async reconnect(): Promise<void> {
    console.log('🔄 Reintentando conexión SignalR...');
    await this.disconnect();
    setTimeout(() => this.connect(), 1000);
  }

  async disconnect(): Promise<void> {
    console.log('🔌 Desconectando SignalR...');
    if (this.hubConnection) {
      try {
        this._isManualDisconnect = true;
        await this.hubConnection.stop();
        console.log('✅ SignalR desconectado');
      } catch (error) {
        console.error('❌ Error al desconectar SignalR:', error);
      } finally {
        this._isManualDisconnect = false;
        this._isConnected.set(false);
      }
    }
  }

  private registerLifecycleHandlers(connection: HubConnection): void {
    connection.onreconnecting(() => {
      console.log('🔄 SignalR reconectando...');
      this._isConnected.set(false);
    });

    connection.onreconnected(() => {
      console.log('✅ SignalR reconectado exitosamente');
      this._isConnected.set(true);
      this._handlersRegistered = false;
      this.registerHandlers(connection);
    });

    connection.onclose((error) => {
      this._isConnected.set(false);

      if (error) {
        console.error('❌ ========== SignalR CONNECTION CLOSED ==========');
        console.error('❌ Error:', error);
        console.error('❌ Error message:', error?.message);
        return;
      }

      if (this._isManualDisconnect) {
        console.log('ℹ️ SignalR cerrado manualmente durante logout');
        return;
      }

      console.warn('⚠️ SignalR cerrado sin objeto de error');
    });
  }

  private registerHandlers(connection: HubConnection): void {
    if (this._handlersRegistered) {
      return;
    }

    console.log('📡 Registrando handlers de SignalR...');
    console.log('📡 Connection state:', connection.state);

    // Limpiar handlers anteriores si existen para evitar duplicados
    connection.off('MessageCreated');
    connection.off('MessageUpdated');
    connection.off('MessageDeleted');
    connection.off('MessageRead');
    connection.off('UnreadCountChanged');

    connection.on('MessageCreated', (message: Message) => {
      console.log('📨 ========== MessageCreated RECIBIDO ==========');
      console.log('📨 Mensaje completo:', JSON.stringify(message, null, 2));
      console.log('📨 Message ID:', message.id);
      console.log('📨 Message UserId:', message.userId);
      console.log('📨 Message Title:', message.title);
      console.log('📨 Message Description:', message.description);

      // Prevenir duplicados verificando si el mensaje ya existe
      this._messages.update((prev) => {
        const exists = prev.some((m) => m.id === message.id);
        if (exists) {
          console.log('⚠️ Mensaje duplicado ignorado:', message.id);
          return prev;
        }

        // Agregar mensaje al inicio de la lista
        const updated = [message, ...prev];

        // Reproducir sonido de alerta cuando llega un mensaje nuevo
        if (!message.read) {
          this._audioService.playNotificationSound().catch(error => {
            // Silenciosamente ignorar errores de audio (puede requerir interacción del usuario)
            console.warn('No se pudo reproducir sonido de notificación:', error);
          });

          // Mostrar notificación del navegador
          this._browserNotificationService.showMessageNotification(
            message.title || 'Nuevo mensaje',
            message.description || '',
            message.id
          ).catch(error => {
            console.warn('No se pudo mostrar notificación del navegador:', error);
          });
        }

        return updated;
      });

      // Actualizar contador de no leídos
      if (!message.read) {
        this._unreadCount.update((c) => c + 1);
      }
    });

    connection.on('MessageUpdated', (message: Message) => {
      console.log('✏️ ========== MessageUpdated RECIBIDO ==========');
      console.log('✏️ Mensaje completo:', JSON.stringify(message, null, 2));
      this._messages.update((prev) => {
        const idx = prev.findIndex((m) => m.id === message.id);
        if (idx === -1) return prev;
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...message };
        return copy;
      });
    });

    connection.on('MessageDeleted', (id: number) => {
      console.log('🗑️ Mensaje eliminado recibido, ID:', id);
      this._messages.update((prev) => {
        // Buscar el mensaje antes de eliminarlo para verificar si estaba no leído
        const messageToDelete = prev.find((m) => m.id === id);
        const wasUnread = messageToDelete && !messageToDelete.read;

        // Eliminar el mensaje de la lista
        const filtered = prev.filter((m) => m.id !== id);

        // Si el mensaje eliminado estaba no leído, disminuir el contador
        if (wasUnread) {
          this._unreadCount.update((c) => Math.max(0, c - 1));
        }

        return filtered;
      });
    });

    connection.on('MessageRead', (id: number) => {
      console.log('👁️ Mensaje marcado como leído, ID:', id);
      this._messages.update((prev) => {
        const idx = prev.findIndex((m) => m.id === id);
        if (idx === -1) return prev;
        const copy = [...prev];
        const wasUnread = !copy[idx].read;
        copy[idx] = { ...copy[idx], read: true };
        if (wasUnread) this._unreadCount.update((c) => Math.max(0, c - 1));
        return copy;
      });
    });

    connection.on('UnreadCountChanged', (count: number) => {
      console.log('🔢 ========== UnreadCountChanged RECIBIDO ==========');
      console.log('🔢 Nuevo contador:', count);
      this._unreadCount.set(count);
      if (count === 0) {
        this.markAllAsReadLocal();
      }
    });

    console.log('✅ Handlers de SignalR registrados');
    console.log('✅ Verificando que los handlers estén activos...');

    // Verificar que los handlers estén registrados
    setTimeout(() => {
      console.log('✅ Connection state después de registrar handlers:', connection.state);
      console.log('✅ Handlers registrados correctamente');
    }, 1000);

    this._handlersRegistered = true;
  }

  setInitialMessages(initial: Message[], unread: number): void {
    this._messages.set(initial);
    this._unreadCount.set(unread);
  }

  /**
   * Marca todos los mensajes cargados como leídos en memoria local.
   * Mantiene sincronizado el panel cuando el backend solo publica el cambio de contador.
   */
  markAllAsReadLocal(): void {
    this._messages.update((prev) => prev.map((message) => ({ ...message, read: true })));
    this._unreadCount.set(0);
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this._authService.accessToken;
  }
}
