import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { forkJoin, map } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { ProgramService } from 'app/shared/services/program.service';

// Resolver para la lista de solicitudes de programas
// Resolver for program requests list
export const initialDataProgramRequestsListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  // Program service
  // Servicio de programas
  const programService = inject(ProgramService);
  // Auth service
  // Servicio de autenticación
  const authService = inject(AuthService);

  const agencyId = authService.getAgencyId();

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    agencyId: agencyId,
    alls: true,
  };

  return forkJoin([programService.getAllProgramInscriptions(requestParameters)]).pipe(
    map(([programInscriptions]) => ({
      programInscriptions: programInscriptions.body,
    }))
  );
};
