import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { SchoolService } from 'app/shared/services/school.service';
import { AuthService } from 'app/core/auth/auth.service';
import { forkJoin, map } from 'rxjs';

// Resolver para la lista de escuelas
// Resolver for schools list
export const initialDataSchoolsListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  // School service
  // Servicio de escuelas
  const schoolService = inject(SchoolService);
  // Auth service
  // Servicio de autenticación
  const authService = inject(AuthService);
  const agencyId = authService.getAgencyId();

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: false,
    forDropdown: false,
    agencyId: agencyId,
  };

  return forkJoin([schoolService.getSchoolsByAgencyId(requestParameters)]).pipe(
    map(([schools]) => ({
      schools: schools.body,
    }))
  );
};
