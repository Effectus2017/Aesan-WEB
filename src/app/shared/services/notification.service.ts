import { Injectable, inject } from '@angular/core';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoService } from '@ngneat/transloco';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private toastr = inject(ToastrService);
  private fuseConfirmationService = inject(FuseConfirmationService);
  private translocoService = inject(TranslocoService);
  private snackBar = inject(MatSnackBar);

  // NOTA: NO SE USA
  showSuccess = (mensaje: string, titulo?: string) => this.snackBar.open(mensaje, titulo, { duration: 5000 });

  // NOTA: NO SE USA
  showError = (mensaje: string = 'Ocurrió un error', titulo?: string) => this.snackBar.open(mensaje, titulo, { duration: 5000 });

  // NOTA: NO SE USA
  showWarning = (mensaje: string, titulo?: string) => this.snackBar.open(mensaje, titulo, { duration: 5000 });

  // NOTA: NO SE USA
  showInfo = (mensaje: string, titulo?: string) => this.snackBar.open(mensaje, titulo, { duration: 5000 });

  // NOTA: NO SE USA
  noImplementado = () => this.showInfo('Acción no implementada');

  // NOTA: NO SE USA
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
   * @param message Clave i18n o mensaje; se traduce con Transloco (para claves como 'sites.edit.groups.group-exceeds-capacity')
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

  /**
   * Muestra un diálogo de error con un mensaje en texto plano (sin traducir).
   * Útil para mostrar el mensaje de error que devuelve el servidor/API.
   */
  showErrorDialogWithRawMessage(message: string): void {
    this.fuseConfirmationService.open({
      title: this.translocoService.translate('dialog.error.title'),
      icon: {
        show: true,
        name: 'heroicons_outline:x-circle',
        color: 'error',
      },
      message,
      actions: {
        confirm: {
          label: this.translocoService.translate('dialog.error.confirm'),
          color: 'warn',
        },
      },
    });
  }

  /**
   * Muestra un diálogo de advertencia usando FuseConfirmationService
   * Utiliza inyección de dependencias interna para obtener los servicios necesarios
   */
  showWarningDialog(message: string = 'dialog.warning.message'): void {
    this.fuseConfirmationService.open({
      title: this.translocoService.translate('dialog.warning.title'),
      icon: {
        show: true,
        name: 'heroicons_outline:exclamation-triangle',
        color: 'warning',
      },
      message: this.translocoService.translate(message),
      actions: {
        confirm: {
          label: this.translocoService.translate('dialog.warning.confirm'),
          color: 'warn',
        },
      },
    });
  }

  /**
   * Muestra un diálogo de advertencia con un mensaje en texto plano (sin traducir).
   * Útil para mostrar el mensaje que devuelve el servidor/API (p. ej. SITE_DATES_OUTSIDE_COMEDOR_RANGE).
   */
  showWarningDialogWithRawMessage(message: string): void {
    this.fuseConfirmationService.open({
      title: this.translocoService.translate('dialog.warning.title'),
      icon: {
        show: true,
        name: 'heroicons_outline:exclamation-triangle',
        color: 'warning',
      },
      message,
      actions: {
        confirm: {
          label: this.translocoService.translate('dialog.warning.confirm'),
          color: 'warn',
        },
      },
    });
  }

  // ============================================================================
  // NUEVOS MÉTODOS CON ACCESO A EVENTOS
  // ============================================================================

  /**
   * Muestra un diálogo de éxito y retorna el MatDialogRef para manejar eventos
   * @param message Mensaje a mostrar
   * @returns MatDialogRef para subscribirse a eventos
   */
  showSuccessDialogWithEvents(message: string = 'dialog.success.message'): MatDialogRef<any> {
    return this.fuseConfirmationService.open({
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
   * Muestra un diálogo de error y retorna el MatDialogRef para manejar eventos
   * @param message Mensaje a mostrar
   * @returns MatDialogRef para subscribirse a eventos
   */
  showErrorDialogWithEvents(message: string = 'dialog.error.message'): MatDialogRef<any> {
    return this.fuseConfirmationService.open({
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

  /**
   * Muestra un diálogo de éxito con callback para manejar la respuesta del usuario
   * @param message Mensaje a mostrar
   * @param callback Función que se ejecuta cuando se cierra el diálogo
   */
  showSuccessDialogWithCallback(
    message: string = 'dialog.success.message',
    callback: (result: string | undefined) => void
  ): void {
    const dialogRef = this.showSuccessDialogWithEvents(message);

    dialogRef.afterClosed().subscribe(callback);
  }

  /**
   * Muestra un diálogo de error con callback para manejar la respuesta del usuario
   * @param message Mensaje a mostrar
   * @param callback Función que se ejecuta cuando se cierra el diálogo
   */
  showErrorDialogWithCallback(
    message: string = 'dialog.error.message',
    callback: (result: string | undefined) => void
  ): void {
    const dialogRef = this.showErrorDialogWithEvents(message);

    dialogRef.afterClosed().subscribe(callback);
  }

  /**
   * Muestra un diálogo de confirmación personalizable con callback
   * @param config Configuración del diálogo
   * @param callback Función que se ejecuta cuando se cierra el diálogo
   */
  showConfirmationDialogWithCallback(
    config: {
      title?: string;
      message: string;
      icon?: {
        show?: boolean;
        name?: string;
        color?: 'primary' | 'accent' | 'warn' | 'basic' | 'info' | 'success' | 'warning' | 'error';
      };
      actions?: {
        confirm?: {
          show?: boolean;
          label?: string;
          color?: 'primary' | 'accent' | 'warn';
        };
        cancel?: {
          show?: boolean;
          label?: string;
        };
      };
    },
    callback: (result: string | undefined) => void
  ): void {
    const dialogRef = this.fuseConfirmationService.open({
      title: config.title ? this.translocoService.translate(config.title) : this.translocoService.translate('dialog.confirm.title'),
      message: this.translocoService.translate(config.message),
      icon: config.icon || {
        show: true,
        name: 'heroicons_outline:question-mark-circle',
        color: 'info',
      },
      actions: {
        confirm: {
          show: config.actions?.confirm?.show ?? true,
          label: config.actions?.confirm?.label ? this.translocoService.translate(config.actions.confirm.label) : this.translocoService.translate('dialog.confirm.confirm'),
          color: config.actions?.confirm?.color || 'primary',
        },
        cancel: {
          show: config.actions?.cancel?.show ?? true,
          label: config.actions?.cancel?.label ? this.translocoService.translate(config.actions.cancel.label) : this.translocoService.translate('dialog.confirm.cancel'),
        },
      },
    });

    dialogRef.afterClosed().subscribe(callback);
  }

  /**
   * Muestra un diálogo de confirmación personalizable y retorna el MatDialogRef
   * @param config Configuración del diálogo
   * @returns MatDialogRef para subscribirse a eventos
   */
  showConfirmationDialogWithEvents(config: {
    title?: string;
    message: string;
    icon?: {
      show?: boolean;
      name?: string;
      color?: 'primary' | 'accent' | 'warn' | 'basic' | 'info' | 'success' | 'warning' | 'error';
    };
    actions?: {
      confirm?: {
        show?: boolean;
        label?: string;
        color?: 'primary' | 'accent' | 'warn';
      };
      cancel?: {
        show?: boolean;
        label?: string;
      };
    };
  }): MatDialogRef<any> {
    return this.fuseConfirmationService.open({
      title: config.title ? this.translocoService.translate(config.title) : this.translocoService.translate('dialog.confirm.title'),
      message: this.translocoService.translate(config.message),
      icon: config.icon || {
        show: true,
        name: 'heroicons_outline:question-mark-circle',
        color: 'info',
      },
      actions: {
        confirm: {
          show: config.actions?.confirm?.show ?? true,
          label: config.actions?.confirm?.label ? this.translocoService.translate(config.actions.confirm.label) : this.translocoService.translate('dialog.confirm.confirm'),
          color: config.actions?.confirm?.color || 'primary',
        },
        cancel: {
          show: config.actions?.cancel?.show ?? true,
          label: config.actions?.cancel?.label ? this.translocoService.translate(config.actions.cancel.label) : this.translocoService.translate('dialog.confirm.cancel'),
        },
      },
    });
  }
}
