import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { AUTH_ERROR_QUERY_NO_AGENCY_ASSIGNED } from 'app/shared/constants/auth-error-keys';
import { isAgencyRole } from 'app/shared/constants/role-keys';
import { of } from 'rxjs';

/**
 * Guard que restringe el acceso a agency-portal: usuarios con rol de agencia
 * deben tener un agencyId válido en el token. Si no, se redirige a sign-in con mensaje.
 */
export const AgencyPortalGuard: CanActivateFn | CanActivateChildFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const userRole = authService.getUserRole();
  if (!isAgencyRole(userRole)) {
    return of(true);
  }

  const agencyId = authService.getAgencyId();
  const hasValidAgencyId = agencyId != null && agencyId !== undefined && Number(agencyId) > 0;
  if (hasValidAgencyId) {
    return of(true);
  }

  return of(router.parseUrl(`/sign-in?error=${AUTH_ERROR_QUERY_NO_AGENCY_ASSIGNED}`));
};
