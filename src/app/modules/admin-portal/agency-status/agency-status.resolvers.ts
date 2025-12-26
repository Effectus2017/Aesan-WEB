import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { AgencyStatusService } from 'app/shared/services/agency-status.service';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
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

export const initialDataAgencyStatusAddResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const agencyStatusService = inject(AgencyStatusService);
  const optionSelectionService = inject(OptionSelectionService);

  const requestParameters: QueryParameters = {
    take: 1000,
    skip: 0,
    alls: true,
  };

  return forkJoin([
    agencyStatusService.getAllAgencyStatusFromDb(requestParameters),
    optionSelectionService.getOptionSelectionByOptionKey({ optionKey: 'isActive' })
  ]).pipe(
    map(([agencyStatuses, isActiveOptions]) => ({
      agencyStatuses: agencyStatuses.body,
      isActiveOptions: isActiveOptions.body,
    }))
  );
};

export const initialDataAgencyStatusEditResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const agencyStatusService = inject(AgencyStatusService);
  const optionSelectionService = inject(OptionSelectionService);
  const id = Number(route.paramMap.get('id'));
  
  return forkJoin([
    agencyStatusService.getAgencyStatusById({ id }),
    optionSelectionService.getOptionSelectionByOptionKey({ optionKey: 'isActive' })
  ]).pipe(
    map(([agencyStatus, isActiveOptions]) => ({
      agencyStatus: agencyStatus.body,
      isActiveOptions: isActiveOptions.body,
    }))
  );
};
