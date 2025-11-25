import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MessagesService } from 'app/shared/services/messages.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { AuthService } from 'app/core/auth/auth.service';
import { Message } from 'app/shared/models/Message';

@Component({
    selector: 'complete-button-banner',
    templateUrl: './complete-button-banner.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [MatButtonModule, MatIconModule]
})
export class CompleteButtonBannerComponent {
    private _changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
    private _messagesService: MessagesService = inject(MessagesService);
    private _notificationService: NotificationService = inject(NotificationService);
    private _authService: AuthService = inject(AuthService);

    sending: boolean = false;

    // ID del Usuario 2 para la demo
    private readonly USER_2_ID = '68828e21-4ac8-43ff-b717-160555d199e9';

    /**
     * Envía un mensaje de prueba al Usuario 2
     */
    sendTestMessage(): void {
        if (this.sending) return;

        this.sending = true;
        this._changeDetectorRef.markForCheck();

        const message: Message = {
            id: 0,
            title: 'Mensaje de Prueba',
            description: `Este es un mensaje de prueba enviado desde el botón Completar. Fecha: ${new Date().toLocaleString()}`,
            time: new Date().toISOString(),
            read: false,
            userId: this.USER_2_ID,
            icon: 'heroicons_outline:mail',
            useRouter: false,
        };

        this._messagesService.insertMessage(message, {}).subscribe({
            next: (response) => {
                this.sending = false;
                this._changeDetectorRef.markForCheck();
                this._notificationService.showSuccess(
                    'Mensaje enviado correctamente',
                    'Éxito'
                );
            },
            error: (error) => {
                this.sending = false;
                this._changeDetectorRef.markForCheck();
                this._notificationService.showError(
                    'Error al enviar el mensaje: ' + (error.error?.message || error.message),
                    'Error'
                );
                console.error('Error al enviar mensaje:', error);
            },
        });
    }
}

