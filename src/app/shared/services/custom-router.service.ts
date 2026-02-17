import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';

/**
 * Servicio para la navegación personalizada.
 * Según el rol: Administrator/Super-Administrator → admin-portal; Agency-* → agency-portal; resto → aesan-portal.
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

    let prefix: string;
    if (userRole === 'Administrator' || userRole === 'Super-Administrator') {
      prefix = '/admin-portal/';
    } else if (userRole === 'Agency-Administrator' || userRole === 'Agency-User') {
      prefix = '/agency-portal/';
    } else {
      prefix = '/aesan-portal/';
    }

    // Añadir el prefijo solo si el primer segmento no es 'sign-in' o 'sign-up'
    if (typeof commands[0] === 'string' && !commands[0].startsWith('/sign-in') && !commands[0].startsWith('/sign-up')) {
      commands[0] = `${prefix}${commands[0]}`;
    }

    return this._router.navigate(commands, extras);
  }
}
