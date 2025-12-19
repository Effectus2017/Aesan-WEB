import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { NotificationService } from 'app/shared/services/notification.service';
import { PROGRAM_IDS } from 'app/shared/const';

@Injectable({ providedIn: 'root' })
export class PsavProgramGuard implements CanActivate {
  private _notificationService = inject(NotificationService);

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Obtener los programas de la agencia desde localStorage
    const programsRaw = localStorage.getItem('agencyPrograms');

    if (!programsRaw) {
      console.log('PsavProgramGuard - No agency programs found, denying access');
      this._notificationService.showErrorDialog(
        'global.tooltips.noAccessPermission'
      );
      return false;
    }

    try {
      const programs: Array<{ id: number }> = JSON.parse(programsRaw);

      // Verificar si la agencia está en el programa PSAV
      const isPSAV = Array.isArray(programs) && programs.some((program) => program?.id === PROGRAM_IDS.PSAV);

      if (!isPSAV) {
        console.log('PsavProgramGuard - Agency is not in PSAV program, denying access');
        this._notificationService.showErrorDialog(
          'global.tooltips.noAccessPermission'
        );
        return false;
      }

      console.log('PsavProgramGuard - Agency is in PSAV program, allowing access');
      return true;
    } catch (error) {
      console.error('PsavProgramGuard - Error parsing agency programs:', error);
      this._notificationService.showErrorDialog(
        'global.tooltips.noAccessPermission'
      );
      return false;
    }
  }
}

