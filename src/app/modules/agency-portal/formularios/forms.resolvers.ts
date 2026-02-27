import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { forkJoin, map } from 'rxjs';
import { AgencyService } from 'app/shared/services/agency.service';
import { AuthService } from 'app/core/auth/auth.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';

// Resolver para el formulario de solicitud PDAM
// Resolver for PDAM request form
export const initialDataFormsPdamSolicitudResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  // Agency service
  // Servicio de agencias
  const agencyService = inject(AgencyService);
  // Auth service
  // Servicio de autenticación
  const authService = inject(AuthService);

  const agencyId = authService.getAgencyId();

  const requestParameters: QueryParameters = {
    agencyId: agencyId,
  };

  return forkJoin([agencyService.getAgencyById(requestParameters)]).pipe(
    map(([agency]) => ({
      agency: agency.body,
    }))
  );
};
