import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { OrganizationTypeService } from 'app/shared/services/organization-type.service';
import { forkJoin, map } from 'rxjs';

export const initialDataOrganizationTypeListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const organizationTypeService = inject(OrganizationTypeService);

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: true,
  };

  return forkJoin([organizationTypeService.getAllOrganizationTypesFromDb(requestParameters)]).pipe(
    map(([organizationTypes]) => ({
      organizationTypes: organizationTypes.body,
    }))
  );
};

export const initialDataOrganizationTypeEditResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const organizationTypeService = inject(OrganizationTypeService);
  const id = Number(route.paramMap.get('id'));
  const requestParameters: QueryParameters = {
    id: id,
  };
  return organizationTypeService.getOrganizationTypeById(requestParameters).pipe(
    map((organizationType) => ({
      organizationType: organizationType.body,
    }))
  );
};
