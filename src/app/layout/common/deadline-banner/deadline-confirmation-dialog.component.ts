import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoService } from '@ngneat/transloco';
import { takeUntil } from 'rxjs';
import { Subject } from 'rxjs';

@Component({
    selector: 'deadline-confirmation-dialog',
    templateUrl: './deadline-confirmation-dialog.component.html',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule]
})
export class DeadlineConfirmationDialogComponent {
    private _dialogRef: MatDialogRef<DeadlineConfirmationDialogComponent> = inject(MatDialogRef);
    private _translocoService: TranslocoService = inject(TranslocoService);
    private _unsubscribeAll: Subject<void> = new Subject<void>();

    dialogTitle: string = '';
    dialogMessage: string = '';
    cancelButtonText: string = '';
    confirmButtonText: string = '';

    constructor() {
        this._loadTranslations();
    }

    /**
     * Carga las traducciones para el dialog
     */
    private _loadTranslations(): void {
        this._translocoService.selectTranslate('navigation.deadline.confirmation.title')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((translation) => {
                this.dialogTitle = translation;
            });

        this._translocoService.selectTranslate('navigation.deadline.confirmation.message')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((translation) => {
                this.dialogMessage = translation;
            });

        this._translocoService.selectTranslate('navigation.deadline.confirmation.cancel')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((translation) => {
                this.cancelButtonText = translation;
            });

        this._translocoService.selectTranslate('navigation.deadline.confirmation.confirm')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((translation) => {
                this.confirmButtonText = translation;
            });
    }

    /**
     * Maneja el click en el botón cancelar
     */
    onCancel(): void {
        this._dialogRef.close(false);
    }

    /**
     * Maneja el click en el botón confirmar
     */
    onConfirm(): void {
        this._dialogRef.close(true);
    }
}
