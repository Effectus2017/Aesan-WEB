import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { SponsorTypeService } from 'app/shared/services/sponsor-type.service';
import { forkJoin } from 'rxjs';

export const initialDataSponsorTypeListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const sponsorTypeService = inject(SponsorTypeService);

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: true,
  };

  return forkJoin([
    sponsorTypeService.getAllSponsorTypesFromDb(requestParameters)
  ]);
};

export const initialDataSponsorTypeEditResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const sponsorTypeService = inject(SponsorTypeService);
  const requestParameters: QueryParameters = {
    id: Number(route.paramMap.get('id')),
  };
  return sponsorTypeService.getSponsorTypeById(requestParameters);
};
