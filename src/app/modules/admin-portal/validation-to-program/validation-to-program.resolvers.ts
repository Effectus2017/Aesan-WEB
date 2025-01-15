import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { AgencyStatusService } from 'app/shared/services/agency-status.service';
import { AgencyService } from 'app/shared/services/agency.service';
import { GeoService } from 'app/shared/services/geo.service';
import { UserService } from 'app/shared/services/user.service';
import { forkJoin } from 'rxjs';


export const initialDataValidationToProgramListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const agencyService = inject(AgencyService);
  const geoService = inject(GeoService);
  const userService = inject(UserService);

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: true,
  };

  return forkJoin([agencyService.getAllAgenciesFromDb(requestParameters), geoService.getCitiesFromDb(requestParameters), userService.getAllProgramsFromDb(requestParameters)]);
};

export const initialDataValidationToProgramEditResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const agencyService = inject(AgencyService);
  const agencyStatusService = inject(AgencyStatusService);
  const geoService = inject(GeoService);
  const userService = inject(UserService);

  const agencyId = route.paramMap.get('id');

  const requestParameters: QueryParameters = {
    agencyId: Number(agencyId),
  };

  return forkJoin([
    agencyService.getAgencyById(requestParameters),
     agencyService.getAllAgenciesFromDb({ take: 25, skip: 0, alls: true }),
     agencyStatusService.getAllAgencyStatusFromDb({ take: 25, skip: 0, alls: true }),
     geoService.getCitiesFromDb({ take: 25, skip: 0, alls: true }),
     geoService.getRegionsFromDb({ take: 25, skip: 0, alls: true }),
     userService.getAllProgramsFromDb({ take: 25, skip: 0, alls: true }),
  ]);
};
