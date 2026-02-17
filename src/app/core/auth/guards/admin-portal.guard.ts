import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { of } from 'rxjs';

/**
 * Guard que restringe el acceso a admin-portal solo a usuarios con rol
 * Administrator o Super-Administrator. El resto se redirige a aesan-portal/dashboard.
 */
export const AdminPortalGuard: CanActivateFn | CanActivateChildFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const userRole = authService.getUserRole();
  const isAdmin = userRole === 'Administrator' || userRole === 'Super-Administrator';

  if (isAdmin) {
    return of(true);
  }

  return of(router.parseUrl('/aesan-portal/dashboard'));
};
