import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { HouseholdService } from 'app/shared/services/household.service';
import { forkJoin } from 'rxjs';

export const initialDataHouseholdListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const householdService = inject(HouseholdService);
  const requestParameters = {
    take: 25,
    skip: 0,
    alls: true,
  };
  return forkJoin([
    householdService.getAllHouseholdsFromDb(requestParameters)
  ]);
};

export const initialDataHouseholdEditResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const householdService = inject(HouseholdService);
  const id = Number(route.paramMap.get('id'));
  return householdService.getHouseholdById({ id });
};
