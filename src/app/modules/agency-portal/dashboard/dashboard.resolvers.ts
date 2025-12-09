import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { forkJoin, map } from 'rxjs';
import { AgencyDashboardService } from 'app/shared/services/agency-dashboard.service';

export const initialDataAdminDashboardResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  return forkJoin([]);
};

export const agencyDashboardResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const _agencyDashboardService: AgencyDashboardService = inject(AgencyDashboardService);

  return _agencyDashboardService.getDashboardMetrics().pipe(
    map((response) => {
      // La respuesta puede venir directamente o dentro de response.body
      return response?.body || response;
    })
  );
};
