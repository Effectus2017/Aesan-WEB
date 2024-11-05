import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';

/**
 * Servicio para la navegación personalizada
 * Segun el rol y la agencia del usuario, se redirige a la ruta correspondiente
 */


@Injectable({
  providedIn: 'root',
})
export class CustomRouterService {
  private _router: Router = inject(Router);
  private _authService: AuthService = inject(AuthService);

  constructor() {}

  navigate(commands: any[], extras?: any): Promise<boolean> {
    const userRole = this._authService.getUserRole();
    const userAgency = this._authService.getUserAgency();
    const userPrograms = this._authService.getUserPrograms();

    let prefix = '/admin-portal/';

    switch (userPrograms[0]) {
      case 'PDAM':
        prefix = '/pdam-portal/';
        break;
      case 'PSAV':
        prefix = '/psav-portal/';
        break;
      case 'PACNA':
        prefix = '/pacna-portal/';
        break;
      case 'PFHF':
        prefix = '/pfhf-portal/';
        break;
      case 'PAF':
        prefix = '/paf-portal/';
        break;
      case 'PDFE':
        prefix = '/pdf-portal/';
        break;
      default:
        prefix = '/admin-portal/';
        break;
    }

    // Añadir el prefijo solo si el primer segmento no es 'sign-in' o 'sign-up'
    if (typeof commands[0] === 'string' && !commands[0].startsWith('/sign-in') && !commands[0].startsWith('/sign-up')) {
      commands[0] = `${prefix}${commands[0]}`;
    }

    return this._router.navigate(commands, extras);
  }
}
