import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { AgencyStatusService } from 'app/shared/services/agency-status.service';
import { forkJoin, map } from 'rxjs';

export const initialDataAgencyStatusListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const agencyStatusService = inject(AgencyStatusService);

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: true,
  };

  return forkJoin([agencyStatusService.getAllAgencyStatusFromDb(requestParameters)]).pipe(
    map(([agencyStatuses]) => ({
      agencyStatuses: agencyStatuses.body,
    }))
  );
};

export const initialDataAgencyStatusEditResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const agencyStatusService = inject(AgencyStatusService);
  const id = Number(route.paramMap.get('id'));
  return agencyStatusService.getAgencyStatusById({ id }).pipe(
    map((agencyStatus) => ({
      agencyStatus: agencyStatus.body,
    }))
  );
};
