import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DatePipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MessagesService } from 'app/shared/services/messages.service';
import { Message } from 'app/shared/models/user/Message';
import { Subject, takeUntil } from 'rxjs';
import { TranslocoModule } from '@ngneat/transloco';
import { AuthService } from 'app/core/auth/auth.service';
import { MessageDetailModalComponent } from './message-detail-modal/message-detail-modal.component';
import { BrowserNotificationService } from 'app/shared/services/browser-notification.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'messages',
  templateUrl: './messages.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'messages',
  standalone: true,
  imports: [MatButtonModule, NgIf, MatIconModule, MatTooltipModule, NgFor, NgClass, NgTemplateOutlet, DatePipe, TranslocoModule, MatDialogModule, RouterLink],
})
export class MessagesComponent implements OnInit, OnDestroy {
  @ViewChild('messagesOrigin') private _messagesOrigin: MatButton;
  @ViewChild('messagesPanel') private _messagesPanel: TemplateRef<any>;

  // Getters para los signals del servicio en tiempo real
  get messages() { return this._messagesService.messages; }
  get unreadCount() { return this._messagesService.unreadCount; }
  get isConnected() { return this._messagesService.isConnected; }

  activeFilter = signal<'all' | 'unread' | 'read'>('all');
  readonly filteredMessages = computed(() => {
    const currentMessages = this.messages();
    const filter = this.activeFilter();

    if (filter === 'unread') {
      return currentMessages.filter((message) => !message.read);
    }

    if (filter === 'read') {
      return currentMessages.filter((message) => message.read);
    }

    return currentMessages;
  });

  private _overlayRef: OverlayRef;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  private _messagesService: MessagesService = inject(MessagesService);
  private _authService: AuthService = inject(AuthService);
  private _overlay: Overlay = inject(Overlay);
  private _viewContainerRef: ViewContainerRef = inject(ViewContainerRef);
  private _dialog: MatDialog = inject(MatDialog);
  private _browserNotificationService: BrowserNotificationService = inject(BrowserNotificationService);
  private _router: Router = inject(Router);


  /**
   * Constructor
   */
  constructor() {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  async ngOnInit(): Promise<void> {
    // Obtener userId del usuario autenticado
    const userId = this._authService.getUserId();

    // Inicializar el servicio con mensajes y conectar SignalR
    await this._messagesService.init(userId || undefined);

    // Suscribirse a los clics en notificaciones del navegador
    this._browserNotificationService.notificationClick$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((messageId: number) => {
        this.openMessageDetailById(messageId);
      });
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();

    // Dispose del servicio en tiempo real
    this._messagesService.dispose();

    // Dispose the overlay
    if (this._overlayRef) {
      this._overlayRef.dispose();
    }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Open the messages panel
   */
  openPanel(): void {
    // Return if the messages panel or its origin is not defined
    if (!this._messagesPanel || !this._messagesOrigin) {
      return;
    }

    // Create the overlay if it doesn't exist
    if (!this._overlayRef) {
      this._createOverlay();
    }

    // Attach the portal to the overlay
    this._overlayRef.attach(new TemplatePortal(this._messagesPanel, this._viewContainerRef));
  }

  /**
   * Close the messages panel
   */
  closePanel(): void {
    this._overlayRef.detach();
  }

  /**
   * Mark all messages as read
   */
  markAllAsRead(): void {
    const userId = this._authService.getUserId();
    this._messagesService.markAllMessagesAsRead({ userId: userId || undefined }).subscribe();
  }

  /**
   * Actualiza el filtro activo de mensajes.
   * @param filter Filtro que se debe aplicar en el panel
   */
  setFilter(filter: 'all' | 'unread' | 'read'): void {
    this.activeFilter.set(filter);
  }

  /**
   * Toggle read status of the given message
   */
  toggleRead(message: Message): void {
    if (message.read) {
      // Si está leído, no hacemos nada (no hay endpoint para marcar como no leído)
      return;
    }

    // Marcar como leído usando el endpoint correcto
    this._messagesService.markMessageAsRead({ id: message.id }).subscribe();
  }

  /**
   * Devuelve la ruta del centro de mensajes según el portal actual.
   */
  getMessagesCenterLink(): string {
    const firstSegment = this._router.url.split('/').filter(Boolean)[0];
    const validPortals = ['admin-portal', 'agency-portal', 'aesan-portal'];

    if (firstSegment && validPortals.includes(firstSegment)) {
      return `/${firstSegment}/messages`;
    }

    return '/admin-portal/messages';
  }

  /**
   * Delete the given message
   */
  delete(message: Message): void {
    // Delete the message - SignalR actualizará automáticamente la lista
    this._messagesService.deleteMessage({ id: message.id }).subscribe();
  }

  /**
   * Open message detail modal
   */
  openMessageDetail(message: Message): void {
    // Marcar el mensaje como leído si no está leído
    if (!message.read) {
      this._messagesService.markMessageAsRead({ id: message.id }).subscribe();
    }

    // Abrir el modal
    this._dialog.open(MessageDetailModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        message: message
      }
    });
  }

  /**
   * Abre el modal de detalle de mensaje por ID
   * @param messageId ID del mensaje
   */
  openMessageDetailById(messageId: number): void {
    // Buscar el mensaje en la lista actual
    const message = this.messages().find(m => m.id === messageId);

    if (message) {
      // Si está en la lista, abrir el modal directamente
      this.openMessageDetail(message);
    } else {
      // Si no está en la lista, intentar obtenerlo del servidor
      this._messagesService.getMessageById({ id: messageId }).subscribe({
        next: (response: any) => {
          // El mensaje puede venir directamente o dentro de un objeto response
          const message = response?.body?.data || response?.body || response?.data || response;
          if (message && message.id) {
            this.openMessageDetail(message);
          } else {
            console.warn('Mensaje no encontrado:', messageId);
          }
        },
        error: (error) => {
          console.error('Error obteniendo mensaje:', error);
        }
      });
    }
  }

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Create the overlay
   */
  private _createOverlay(): void {
    // Create the overlay
    this._overlayRef = this._overlay.create({
      hasBackdrop: true,
      backdropClass: 'fuse-backdrop-on-mobile',
      scrollStrategy: this._overlay.scrollStrategies.block(),
      positionStrategy: this._overlay
        .position()
        .flexibleConnectedTo(this._messagesOrigin._elementRef.nativeElement)
        .withLockedPosition(true)
        .withPush(true)
        .withPositions([
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top',
          },
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'bottom',
          },
          {
            originX: 'end',
            originY: 'bottom',
            overlayX: 'end',
            overlayY: 'top',
          },
          {
            originX: 'end',
            originY: 'top',
            overlayX: 'end',
            overlayY: 'bottom',
          },
        ]),
    });

    // Detach the overlay from the portal on backdrop click
    this._overlayRef.backdropClick().subscribe(() => {
      this._overlayRef.detach();
    });
  }

}
