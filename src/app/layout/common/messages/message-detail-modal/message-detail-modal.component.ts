import { Component, Inject, ViewEncapsulation, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { TranslocoModule } from '@ngneat/transloco';
import { Message } from 'app/shared/models/user/Message';
import { MessagesService } from 'app/shared/services/messages.service';

export interface MessageDetailModalData {
  message: Message;
}

@Component({
  selector: 'app-message-detail-modal',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, DatePipe, TranslocoModule],
  templateUrl: './message-detail-modal.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class MessageDetailModalComponent {
  private _messagesService: MessagesService = inject(MessagesService);

  constructor(
    public dialogRef: MatDialogRef<MessageDetailModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MessageDetailModalData
  ) {}

  close(): void {
    this.dialogRef.close(null);
  }

  delete(): void {
    this._messagesService.deleteMessage({ id: this.data.message.id }).subscribe({
      next: () => {
        this.dialogRef.close('deleted');
      },
      error: (error) => {
        console.error('Error al eliminar mensaje:', error);
      }
    });
  }
}

