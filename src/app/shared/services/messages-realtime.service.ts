import { Injectable, signal } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import type { Message } from '../../shared/models/Message';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../services/notification.service';
import { AudioService } from '../services/audio.service';
import { BrowserNotificationService } from './browser-notification.service';

@Injectable({ providedIn: 'root' })
export class MessagesRealtimeService {
  private hubConnection?: HubConnection;

  readonly messages = signal<Message[]>([]);
  readonly unreadCount = signal<number>(0);
  readonly isConnected = signal<boolean>(false);

  constructor(
    private _authService: AuthService,
    private _notificationService: NotificationService,
    private _audioService: AudioService,
    private _browserNotificationService: BrowserNotificationService
  ) {}

  private buildConnection(): HubConnection {
    const token = this._authService.accessToken;
    const url = token
      ? `${environment.baseHttpUrl}/hubs/messages?access_token=${token}`
      : `${environment.baseHttpUrl}/hubs/messages`;

    return new HubConnectionBuilder()
      .withUrl(url, {
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
    this.registerHandlers(this.hubConnection);

    // Agregar eventos de reconexión
    this.hubConnection.onreconnecting(() => {
      console.log('🔄 SignalR reconectando...');
      this.isConnected.set(false);
    });

    this.hubConnection.onreconnected(() => {
      console.log('✅ SignalR reconectado exitosamente');
      this.isConnected.set(true);
      // Re-registrar handlers después de reconexión
      if (this.hubConnection) {
        this.registerHandlers(this.hubConnection);
      }
    });

    this.hubConnection.onclose((error) => {
      console.log('🔌 SignalR desconectado', error);
      this.isConnected.set(false);
    });

    try {
      await this.hubConnection.start();
      console.log('✅ SignalR conectado exitosamente');
      this.isConnected.set(true);
    } catch (err: any) {
      console.error('❌ SignalR connection error:', err);
      this.isConnected.set(false);

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
        await this.hubConnection.stop();
      console.log('✅ SignalR desconectado');
      } catch (error) {
        console.error('❌ Error al desconectar SignalR:', error);
      } finally {
      this.isConnected.set(false);
      }
    }
  }

  private registerHandlers(connection: HubConnection): void {
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
      this.messages.update((prev) => {
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
        this.unreadCount.update((c) => c + 1);
      }
    });

    connection.on('MessageUpdated', (message: Message) => {
      console.log('✏️ ========== MessageUpdated RECIBIDO ==========');
      console.log('✏️ Mensaje completo:', JSON.stringify(message, null, 2));
      this.messages.update((prev) => {
        const idx = prev.findIndex((m) => m.id === message.id);
        if (idx === -1) return prev;
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...message };
        return copy;
      });
    });

    connection.on('MessageDeleted', (id: number) => {
      console.log('🗑️ Mensaje eliminado recibido, ID:', id);
      this.messages.update((prev) => {
        // Buscar el mensaje antes de eliminarlo para verificar si estaba no leído
        const messageToDelete = prev.find((m) => m.id === id);
        const wasUnread = messageToDelete && !messageToDelete.read;
        
        // Eliminar el mensaje de la lista
        const filtered = prev.filter((m) => m.id !== id);
        
        // Si el mensaje eliminado estaba no leído, disminuir el contador
        if (wasUnread) {
          this.unreadCount.update((c) => Math.max(0, c - 1));
        }
        
        return filtered;
      });
    });

    connection.on('MessageRead', (id: number) => {
      console.log('👁️ Mensaje marcado como leído, ID:', id);
      this.messages.update((prev) => {
        const idx = prev.findIndex((m) => m.id === id);
        if (idx === -1) return prev;
        const copy = [...prev];
        const wasUnread = !copy[idx].read;
        copy[idx] = { ...copy[idx], read: true };
        if (wasUnread) this.unreadCount.update((c) => Math.max(0, c - 1));
        return copy;
      });
    });

    connection.on('UnreadCountChanged', (count: number) => {
      console.log('🔢 ========== UnreadCountChanged RECIBIDO ==========');
      console.log('🔢 Nuevo contador:', count);
      this.unreadCount.set(count);
    });

    // Agregar handler para errores de conexión
    connection.onclose((error) => {
      console.error('❌ ========== SignalR CONNECTION CLOSED ==========');
      console.error('❌ Error:', error);
      console.error('❌ Error message:', error?.message);
    });

    console.log('✅ Handlers de SignalR registrados');
    console.log('✅ Verificando que los handlers estén activos...');
    
    // Verificar que los handlers estén registrados
    setTimeout(() => {
      console.log('✅ Connection state después de registrar handlers:', connection.state);
      console.log('✅ Handlers registrados correctamente');
    }, 1000);
  }

  setInitialMessages(initial: Message[], unread: number): void {
    this.messages.set(initial);
    this.unreadCount.set(unread);
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this._authService.accessToken;
  }
}
