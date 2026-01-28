import {
  Component,
  Inject,
  ViewEncapsulation,
} from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@ngneat/transloco';

export interface KeyboardShortcutsModalData {
  // No se necesitan datos adicionales por ahora
}

interface ShortcutItem {
  key: string;
  action: string;
}

@Component({
  selector: 'app-keyboard-shortcuts-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TranslocoModule,
  ],
  templateUrl: './keyboard-shortcuts-modal.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class KeyboardShortcutsModalComponent {
  shortcuts: ShortcutItem[] = [
    { key: 'Enter', action: 'keyboard-shortcuts.list.enter-save' },
    { key: 'Escape', action: 'keyboard-shortcuts.list.escape-close' },
    { key: 'Ctrl+A', action: 'keyboard-shortcuts.list.ctrl-a-add' },
  ];

  constructor(
    public dialogRef: MatDialogRef<KeyboardShortcutsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: KeyboardShortcutsModalData
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
