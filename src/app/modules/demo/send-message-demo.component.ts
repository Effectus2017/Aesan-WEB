import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MessagesService } from 'app/shared/services/messages.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { Message } from 'app/shared/models/Message';

@Component({
  selector: 'app-send-message-demo',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen p-8">
      <mat-card class="w-full max-w-md">
        <mat-card-header>
          <mat-card-title>Demo: Enviar Mensaje</mat-card-title>
        </mat-card-header>
        <mat-card-content class="flex flex-col gap-4 p-6">
          <div class="text-sm text-gray-600">
            <p><strong>Usuario 1:</strong> 1db1104b-6c97-4f64-93e1-929296dea7bf</p>
            <p><strong>Usuario 2:</strong> 68828e21-4ac8-43ff-b717-160555d199e9</p>
          </div>
          
          <div class="flex items-center gap-2">
            <span class="text-sm">Estado SignalR:</span>
            <span [class]="isConnected() ? 'text-green-600' : 'text-red-600'">
              {{ isConnected() ? 'Conectado' : 'Desconectado' }}
            </span>
          </div>

          <button
            mat-raised-button
            color="primary"
            [disabled]="sending"
            (click)="sendMessage()"
            class="w-full">
            <mat-icon>send</mat-icon>
            <span class="ml-2">{{ sending ? 'Enviando...' : 'Enviar Mensaje a Usuario 2' }}</span>
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class SendMessageDemoComponent {
  private _messagesService = inject(MessagesService);
  private _notificationService = inject(NotificationService);

  // IDs hardcodeados para la demo
  private readonly USER_1_ID = '1db1104b-6c97-4f64-93e1-929296dea7bf';
  private readonly USER_2_ID = '68828e21-4ac8-43ff-b717-160555d199e9';

  sending = false;
  isConnected = this._messagesService.isConnected;

  sendMessage(): void {
    if (this.sending) return;

    this.sending = true;

    const message: Message = {
      id: 0, // Se asignará en el backend
      title: 'Mensaje de Prueba',
      description: `Este es un mensaje de prueba enviado desde Usuario 1 a Usuario 2. Fecha: ${new Date().toLocaleString()}`,
      time: new Date().toISOString(),
      read: false,
      userId: this.USER_2_ID, // Destinatario
      icon: 'heroicons_outline:mail',
      useRouter: false,
    };

    this._messagesService.insertMessage(message, {}).subscribe({
      next: (response) => {
        this.sending = false;
        this._notificationService.showSuccess(
          'Mensaje enviado correctamente a Usuario 2',
          'Éxito'
        );
        console.log('Mensaje enviado:', response);
      },
      error: (error) => {
        this.sending = false;
        this._notificationService.showError(
          'Error al enviar el mensaje: ' + (error.error?.message || error.message),
          'Error'
        );
        console.error('Error al enviar mensaje:', error);
      },
    });
  }
}

