import { Injectable, signal } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import type { Message } from '../../shared/models/Message';
import { AuthService } from '../../core/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class MessagesRealtimeService {
  private hubConnection?: HubConnection;

  readonly messages = signal<Message[]>([]);
  readonly unreadCount = signal<number>(0);
  readonly isConnected = signal<boolean>(false);

  constructor(private _authService: AuthService) {}

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
    this.hubConnection = this.buildConnection();
    this.registerHandlers(this.hubConnection);

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

  private reconnect(): void {
    console.log('🔄 Reintentando conexión SignalR...');
    this.disconnect();
    setTimeout(() => this.connect(), 1000);
  }

  disconnect(): void {
    console.log('🔌 Desconectando SignalR...');
    this.hubConnection?.stop().finally(() => {
      console.log('✅ SignalR desconectado');
      this.isConnected.set(false);
    });
  }

  private registerHandlers(connection: HubConnection): void {
    console.log('📡 Registrando handlers de SignalR...');

    connection.on('MessageCreated', (message: Message) => {
      console.log('📨 Mensaje creado recibido:', message);
      this.messages.update((prev) => [message, ...prev]);
      if (!message.read) this.unreadCount.update((c) => c + 1);
    });

    connection.on('MessageUpdated', (message: Message) => {
      console.log('✏️ Mensaje actualizado recibido:', message);
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
      this.messages.update((prev) => prev.filter((m) => m.id !== id));
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
      console.log('🔢 Contador no leídos actualizado:', count);
      this.unreadCount.set(count);
    });

    console.log('✅ Handlers de SignalR registrados');
  }

  setInitialMessages(initial: Message[], unread: number): void {
    this.messages.set(initial);
    this.unreadCount.set(unread);
  }
}
