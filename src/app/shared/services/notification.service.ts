import { Injectable, inject } from '@angular/core';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoService } from '@ngneat/transloco';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private toastr = inject(ToastrService);
  private fuseConfirmationService = inject(FuseConfirmationService);
  private translocoService = inject(TranslocoService);

  showSuccess = (mensaje: string, titulo?: string) => this.toastr.success(mensaje, titulo);

  showError = (mensaje: string = 'Ocurrió un error', titulo?: string) => this.toastr.error(mensaje, titulo);

  showWarning = (mensaje: string, titulo?: string) => this.toastr.warning(mensaje, titulo);

  showInfo = (mensaje: string, titulo?: string) => this.toastr.info(mensaje, titulo);

  noImplementado = () => this.showInfo('Acción no implementada');

  clear = () => this.toastr.clear();

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
