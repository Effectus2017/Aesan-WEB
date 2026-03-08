import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { AgencyFilesService } from 'app/shared/services/agency-files.service';
import { forkJoin, map } from 'rxjs';


// Resolver para la lista de documentos de la agencia
// Resolver for agency documents list
export const initialDataDocumentsListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  // Agency files service
  // Servicio de archivos de agencia
  const agencyFileService = inject(AgencyFilesService);
  // Auth service
  // Servicio de autenticación
  const authService = inject(AuthService);

  const agencyId = authService.getAgencyId();

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: true,
    agencyId: agencyId,
  };

  return forkJoin([agencyFileService.getAgencyFiles(requestParameters)]).pipe(
    map(([documents]) => ({
      documents: documents.body,
    }))
  );
};
