import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { HouseholdMemberService } from 'app/shared/services/household-member.service';
import { forkJoin, map } from 'rxjs';

// Resolver para la lista de miembros del hogar
// Resolver for household members list
export const initialDataHouseholdMemberListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  // Household member service
  // Servicio de miembros del hogar
  const householdMemberService = inject(HouseholdMemberService);

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: true,
  };

  return forkJoin([householdMemberService.getAllHouseholdMembersFromDb(requestParameters)]).pipe(
    map(([householdMembers]) => ({
      householdMembers: householdMembers.body,
    }))
  );
};

// Resolver para la edición de un miembro del hogar
// Resolver for household member editing
export const initialDataHouseholdMemberEditResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  // Household member service
  // Servicio de miembros del hogar
  const householdMemberService = inject(HouseholdMemberService);
  const requestParameters: QueryParameters = {
    id: Number(route.paramMap.get('id')),
  };
  return householdMemberService.getHouseholdMemberById(requestParameters).pipe(
    map((householdMember) => ({
      householdMember: householdMember.body,
    }))
  );
};
