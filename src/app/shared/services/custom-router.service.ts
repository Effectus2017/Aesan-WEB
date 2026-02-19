import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { isAdminRole, isAgencyRole } from 'app/shared/constants/role-keys';

/**
 * Servicio para la navegación personalizada.
 * Usa el portal actual (URL) como prefijo; si la URL no contiene ningún portal, usa el rol del usuario.
 * Portales: admin-portal, agency-portal, aesan-portal.
 */

@Injectable({
  providedIn: 'root',
})
export class CustomRouterService {
  private _router: Router = inject(Router);
  private _authService: AuthService = inject(AuthService);

  constructor() {}

  navigate(commands: any[], extras?: any): Promise<boolean> {
    const currentUrl = this._router.url;

    let prefix: string;
    if (currentUrl.startsWith('/admin-portal')) {
      prefix = '/admin-portal/';
    } else if (currentUrl.startsWith('/agency-portal')) {
      prefix = '/agency-portal/';
    } else if (currentUrl.startsWith('/aesan-portal')) {
      prefix = '/aesan-portal/';
    } else {
      const userRole = this._authService.getUserRole();
      if (isAdminRole(userRole)) {
        prefix = '/admin-portal/';
      } else if (isAgencyRole(userRole)) {
        prefix = '/agency-portal/';
      } else {
        prefix = '/aesan-portal/';
      }
    }

    // Añadir el prefijo solo si el primer segmento no es 'sign-in' o 'sign-up'
    if (typeof commands[0] === 'string' && !commands[0].startsWith('/sign-in') && !commands[0].startsWith('/sign-up')) {
      commands[0] = `${prefix}${commands[0]}`;
    }

    return this._router.navigate(commands, extras);
  }
}
