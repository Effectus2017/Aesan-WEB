import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { HouseholdMemberService } from 'app/shared/services/household-member.service';
import { forkJoin } from 'rxjs';

export const initialDataHouseholdMemberListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const householdMemberService = inject(HouseholdMemberService);

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: true,
  };

  return forkJoin([
    householdMemberService.getAllHouseholdMembersFromDb(requestParameters)
  ]);
};

export const initialDataHouseholdMemberEditResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const householdMemberService = inject(HouseholdMemberService);
  const requestParameters: QueryParameters = {
    id: Number(route.paramMap.get('id')),
  };
  return householdMemberService.getHouseholdMemberById(requestParameters);
};
