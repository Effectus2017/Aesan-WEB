import { Injectable, inject } from '@angular/core';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoService } from '@ngneat/transloco';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private toastr = inject(ToastrService);
  private fuseConfirmationService = inject(FuseConfirmationService);
  private translocoService = inject(TranslocoService);
  private snackBar = inject(MatSnackBar);

  showSuccess = (mensaje: string, titulo?: string) => this.snackBar.open(mensaje, titulo, { duration: 5000 });

  showError = (mensaje: string = 'Ocurrió un error', titulo?: string) => this.snackBar.open(mensaje, titulo, { duration: 5000 });

  showWarning = (mensaje: string, titulo?: string) => this.snackBar.open(mensaje, titulo, { duration: 5000 });

  showInfo = (mensaje: string, titulo?: string) => this.snackBar.open(mensaje, titulo, { duration: 5000 });

  noImplementado = () => this.showInfo('Acción no implementada');

  clear = () => this.snackBar.dismiss();

  /**
   * Muestra un diálogo de éxito usando FuseConfirmationService
   * Utiliza inyección de dependencias interna para obtener los servicios necesarios
   */
  showSuccessDialog(message: string = 'dialog.success.message'): void {
    this.fuseConfirmationService.open({
      title: this.translocoService.translate('dialog.success.title'),
      icon: {
        show: true,
        name: 'heroicons_outline:check-circle',
        color: 'success',
      },
      message: this.translocoService.translate(message),
      actions: {
        confirm: {
          label: this.translocoService.translate('dialog.success.confirm'),
          color: 'primary',
        },
      },
    });
  }

  /**
   * Muestra un diálogo de error usando FuseConfirmationService
   * Utiliza inyección de dependencias interna para obtener los servicios necesarios
   */
  showErrorDialog(message: string = 'dialog.error.message'): void {
    this.fuseConfirmationService.open({
      title: this.translocoService.translate('dialog.error.title'),
      icon: {
        show: true,
        name: 'heroicons_outline:x-circle',
        color: 'error',
      },
      message: this.translocoService.translate(message),
      actions: {
        confirm: {
          label: this.translocoService.translate('dialog.error.confirm'),
          color: 'warn',
        },
      },
    });
  }
}
