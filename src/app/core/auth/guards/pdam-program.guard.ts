import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { NotificationService } from 'app/shared/services/notification.service';
import { TranslocoService } from '@ngneat/transloco';
import { PROGRAM_IDS } from 'app/shared/const';

@Injectable({ providedIn: 'root' })
export class PdamProgramGuard implements CanActivate {
  private _notificationService = inject(NotificationService);
  private _translocoService = inject(TranslocoService);

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Obtener los programas de la agencia desde localStorage
    const programsRaw = localStorage.getItem('agencyPrograms');

    if (!programsRaw) {
      console.log('PdamProgramGuard - No agency programs found, denying access');
      this._notificationService.showErrorDialog(
        this._translocoService.translate('global.tooltips.noAccessPermission')
      );
      return false;
    }

    try {
      const programs: Array<{ id: number }> = JSON.parse(programsRaw);

      // Verificar si la agencia está en el programa PDAM
      const isPDAM = Array.isArray(programs) && programs.some((program) => program?.id === PROGRAM_IDS.PDAM);

      if (!isPDAM) {
        console.log('PdamProgramGuard - Agency is not in PDAM program, denying access');
        this._notificationService.showErrorDialog(
          this._translocoService.translate('global.tooltips.noAccessPermission')
        );
        return false;
      }

      console.log('PdamProgramGuard - Agency is in PDAM program, allowing access');
      return true;
    } catch (error) {
      console.error('PdamProgramGuard - Error parsing agency programs:', error);
      this._notificationService.showErrorDialog(
        this._translocoService.translate('global.tooltips.noAccessPermission')
      );
      return false;
    }
  }
}

