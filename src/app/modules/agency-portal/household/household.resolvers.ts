import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { HouseholdService } from 'app/shared/services/household.service';
import { forkJoin, map } from 'rxjs';

// Resolver para la lista de hogares
// Resolver for households list
export const initialDataHouseholdListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  // Household service
  // Servicio de hogares
  const householdService = inject(HouseholdService);

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: true,
  };
  return forkJoin([householdService.getAllHouseholdsFromDb(requestParameters)]).pipe(
    map(([households]) => ({
      households: households.body,
    }))
  );
};

// Resolver para la edición de un hogar
// Resolver for household editing
export const initialDataHouseholdEditResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  // Household service
  // Servicio de hogares
  const householdService = inject(HouseholdService);
  const id = Number(route.paramMap.get('id'));
  return householdService.getHouseholdById({ id }).pipe(
    map((household) => ({
      household: household.body,
    }))
  );
};
