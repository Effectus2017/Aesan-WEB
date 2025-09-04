import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { AgencyFilesService } from 'app/shared/services/agency-files.service';
import { forkJoin, map } from 'rxjs';


export const initialDataDocumentsListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {

  const agencyFileService = inject(AgencyFilesService);
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
