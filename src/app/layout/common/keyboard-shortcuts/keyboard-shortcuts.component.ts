import { Component, Input, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { TranslocoModule } from '@ngneat/transloco';
import { KeyboardShortcutsModalComponent } from 'app/shared/components/keyboard-shortcuts-modal/keyboard-shortcuts-modal.component';

@Component({
  selector: 'keyboard-shortcuts',
  standalone: true,
  imports: [NgIf, MatButtonModule, MatIconModule, MatTooltipModule, MatMenuModule, TranslocoModule],
  template: `
    <!-- Botón para header (icono) -->
    <button
      *ngIf="!menuItem"
      mat-icon-button
      (click)="openModal()"
      [matTooltip]="'keyboard-shortcuts.button.tooltip' | transloco">
      <mat-icon [svgIcon]="'heroicons_outline:key'"></mat-icon>
    </button>

    <!-- Item de menú -->
    <button
      *ngIf="menuItem"
      mat-menu-item
      (click)="openModal()">
      <mat-icon [svgIcon]="'heroicons_outline:key'"></mat-icon>
      <span>{{ 'keyboard-shortcuts.button.menu-item' | transloco }}</span>
    </button>
  `,
})
export class KeyboardShortcutsComponent {
  @Input() menuItem: boolean = false;

  private readonly _dialog = inject(MatDialog);

  openModal(): void {
    this._dialog.open(KeyboardShortcutsModalComponent, {
      width: '800px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      panelClass: 'keyboard-shortcuts-modal',
    });
  }
}
