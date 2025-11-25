import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

export interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class BrowserNotificationService {
  private _router: Router = inject(Router);
  private permission: NotificationPermission = 'default';

  // Subject para emitir cuando se hace clic en una notificación
  private _notificationClick$ = new Subject<number>();
  public notificationClick$ = this._notificationClick$.asObservable();

  constructor() {
    // Verificar si el navegador soporta notificaciones
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  /**
   * Verifica si el navegador soporta notificaciones
   */
  isSupported(): boolean {
    return 'Notification' in window;
  }

  /**
   * Obtiene el estado actual del permiso
   */
  getPermission(): NotificationPermission {
    if (!this.isSupported()) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Solicita permiso al usuario para mostrar notificaciones
   * Debe ser llamado después de una interacción del usuario
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      console.warn('Este navegador no soporta notificaciones');
      return 'denied';
    }

    if (Notification.permission === 'default') {
      try {
        this.permission = await Notification.requestPermission();
        return this.permission;
      } catch (error) {
        console.error('Error solicitando permiso de notificaciones:', error);
        return 'denied';
      }
    }

    this.permission = Notification.permission;
    return this.permission;
  }

  /**
   * Muestra una notificación del navegador
   * @param options Opciones de la notificación
   */
  async showNotification(options: NotificationOptions): Promise<Notification | null> {
    if (!this.isSupported()) {
      console.warn('Este navegador no soporta notificaciones');
      return null;
    }

    // Si no tenemos permiso, intentar solicitarlo
    if (Notification.permission === 'default') {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.warn('Permiso de notificaciones denegado');
        return null;
      }
    }

    if (Notification.permission !== 'granted') {
      console.warn('No se tiene permiso para mostrar notificaciones. Permiso actual:', Notification.permission);
      return null;
    }

    try {
      // Construir opciones usando solo propiedades estándar y bien soportadas
      const notificationOptions: any = {
        body: options.body || '',
        icon: options.icon || '/favicon.ico',
        tag: options.tag || 'message',
        requireInteraction: options.requireInteraction !== undefined ? options.requireInteraction : true, // Por defecto true para que no se cierren automáticamente
        silent: options.silent || false,
      };

      // Agregar propiedades opcionales solo si están definidas y son soportadas
      if (options.badge) {
        notificationOptions.badge = options.badge;
      }

      // vibrate puede no ser soportado en todos los navegadores
      if (options.vibrate && Array.isArray(options.vibrate)) {
        notificationOptions.vibrate = options.vibrate;
      }

      // data se pasa en las opciones (algunos navegadores lo soportan)
      // Si no se soporta, lo guardamos en un Map para acceso posterior
      const notificationData = options.data || {};
      if (notificationData && Object.keys(notificationData).length > 0) {
        notificationOptions.data = notificationData;
      }

      const notification = new Notification(options.title, notificationOptions);

      // Manejar clic en la notificación
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();

        // Intentar obtener los datos de la notificación (puede estar en notification.data o en notificationData)
        const data = (notification as any).data || notificationData;

        // Si hay un messageId, emitirlo para que el componente de mensajes lo maneje
        if (data?.messageId) {
          this._notificationClick$.next(data.messageId);
        } else if (data?.route) {
          // Fallback: si no hay messageId pero hay ruta, navegar
          this._router.navigate([data.route]);
        }

        // Cerrar la notificación
        notification.close();
      };

      // Manejar errores de la notificación
      notification.onerror = (error) => {
        console.error('Error en la notificación:', error);
      };

      // Cerrar automáticamente después de 10 segundos (solo si no requiere interacción)
      if (!notificationOptions.requireInteraction) {
        setTimeout(() => {
          if (notification) {
            notification.close();
          }
        }, 10000); // Aumentado a 10 segundos
      }

      console.log('✅ Notificación mostrada:', options.title);
      return notification;
    } catch (error) {
      console.error('Error mostrando notificación:', error);
      return null;
    }
  }

  /**
   * Muestra una notificación para un mensaje nuevo
   * @param title Título del mensaje
   * @param body Cuerpo del mensaje
   * @param messageId ID del mensaje (opcional, para navegación)
   */
  async showMessageNotification(title: string, body?: string, messageId?: number): Promise<void> {
    try {
      console.log('🔔 Intentando mostrar notificación de mensaje:', { title, body, messageId });
      console.log('🔔 Estado de permisos:', Notification.permission);

      const notification = await this.showNotification({
        title,
        body: body || '',
        icon: '/favicon.ico',
        tag: `message-${messageId || Date.now()}`,
        requireInteraction: true, // Cambiado a true para que requiera interacción y no se cierre automáticamente
        silent: false,
        vibrate: [200, 100, 200],
        data: {
          type: 'message',
          messageId,
          route: '/messages'
        }
      });

      if (notification) {
        console.log('✅ Notificación creada exitosamente');
        console.log('📍 La notificación debería aparecer en:');
        console.log('   - macOS: Esquina superior derecha');
        console.log('   - Windows: Esquina inferior derecha o centro de notificaciones');
        console.log('   - Linux: Depende del entorno de escritorio');
        console.log('💡 Si no la ves, verifica la configuración de notificaciones del sistema operativo');
      } else {
        console.warn('⚠️ No se pudo crear la notificación');
      }
    } catch (error) {
      console.error('❌ Error en showMessageNotification:', error);
    }
  }

  /**
   * Cierra todas las notificaciones con un tag específico
   */
  closeNotificationsByTag(tag: string): void {
    // Las notificaciones se cierran automáticamente o manualmente
    // Este método es principalmente para referencia futura
  }
}

