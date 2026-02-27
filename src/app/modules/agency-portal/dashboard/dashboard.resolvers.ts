import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { map } from 'rxjs';
import { AgencyDashboardService } from 'app/shared/services/agency-dashboard.service';

// Resolver para el dashboard de la agencia
// Resolver for agency dashboard
export const initialDataDashboardResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  // Agency dashboard service
  // Servicio de dashboard de agencia
  const agencyDashboardService = inject(AgencyDashboardService);

  return agencyDashboardService.getDashboardMetrics().pipe(
    map((response) => {
      // La respuesta puede venir directamente o dentro de response.body
      return response?.body ?? response;
    })
  );
};
