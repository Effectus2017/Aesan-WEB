import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { OperatingPolicyService } from 'app/shared/services/operating-policy.service';
import { forkJoin, map } from 'rxjs';

export const initialDataOperatingPolicyListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const operatingPolicyService = inject(OperatingPolicyService);

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: true,
  };

  return forkJoin([operatingPolicyService.getAllOperatingPoliciesFromDb(requestParameters)]).pipe(
    map(([operatingPolicies]) => ({
      operatingPolicies: operatingPolicies.body,
    }))
  );
};

export const initialDataOperatingPolicyEditResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const operatingPolicyService = inject(OperatingPolicyService);
  const requestParameters: QueryParameters = {
    id: Number(route.paramMap.get('id')),
  };
  return operatingPolicyService.getOperatingPolicyById(requestParameters).pipe(
    map((operatingPolicy) => ({
      operatingPolicy: operatingPolicy.body,
    }))
  );
};
