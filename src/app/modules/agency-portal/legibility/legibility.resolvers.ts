import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { HouseholdService } from 'app/shared/services/household.service';
import { forkJoin, map } from 'rxjs';

export const initialDataHouseholdListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const householdService = inject(HouseholdService);
  const requestParameters = {
    take: 25,
    skip: 0,
    alls: true,
  };
  return forkJoin([householdService.getAll(requestParameters)]).pipe(
    map(([households]) => ({
      households: households.body,
    }))
  );
};

export const initialDataHouseholdEditResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const householdService = inject(HouseholdService);
  const id = Number(route.paramMap.get('id'));
  return householdService.getById(id).pipe(
    map((household) => ({
      household: household.body,
    }))
  );
};
