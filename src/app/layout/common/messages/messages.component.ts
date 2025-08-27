import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DatePipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { MessagesService } from 'app/shared/services/messages.service';
import { Message } from 'app/shared/models/Message';
import { Subject, takeUntil } from 'rxjs';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'messages',
  templateUrl: './messages.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'messages',
  standalone: true,
  imports: [MatButtonModule, NgIf, MatIconModule, MatTooltipModule, NgFor, NgClass, NgTemplateOutlet, RouterLink, DatePipe, TranslocoModule],
})
export class MessagesComponent implements OnInit, OnDestroy {
  @ViewChild('messagesOrigin') private _messagesOrigin: MatButton;
  @ViewChild('messagesPanel') private _messagesPanel: TemplateRef<any>;

  // Usar signals del servicio en tiempo real
  messages: any;
  unreadCount: any;
  isConnected: any;

  private _overlayRef: OverlayRef;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  private _changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
  private _messagesService: MessagesService = inject(MessagesService);
  private _overlay: Overlay = inject(Overlay);
  private _viewContainerRef: ViewContainerRef = inject(ViewContainerRef);


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
    // Inicializar el servicio con mensajes y conectar SignalR
    await this._messagesService.init(/* userId si aplica */);
    
    // Asignar los signals del servicio
    this.messages = this._messagesService.messages;
    this.unreadCount = this._messagesService.unreadCount;
    this.isConnected = this._messagesService.isConnected;
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
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
    // Mark all as read
    this._messagesService.markAllMessagesAsRead({}).subscribe();
  }

  /**
   * Toggle read status of the given message
   */
  toggleRead(message: Message): void {
    // Toggle the read status
    message.read = !message.read;

    // Update the message
    this._messagesService.updateMessage(message, { id: message.id }).subscribe();
  }

  /**
   * Delete the given message
   */
  delete(message: Message): void {
    // Delete the message and reload the list
    this._messagesService.deleteMessage({ id: message.id }).subscribe({
      next: () => this._messagesService.getAllMessagesFromDb({}).subscribe(),
    });
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

  /**
   * Load messages from the service
   *
   * @private
   */
  private _loadMessages(): void {
    this._messagesService.getAllMessagesFromDb({}).subscribe();
  }

  /**
   * Calculate the unread count
   *
   * @private
   */
  private _calculateUnreadCount(): void {
    // No necesitamos calcular manualmente ya que el servicio en tiempo real maneja esto
    // Los signals se actualizan automáticamente
  }
}
