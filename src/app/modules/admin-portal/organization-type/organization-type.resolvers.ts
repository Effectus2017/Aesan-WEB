import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { OrganizationTypeService } from 'app/shared/services/organization-type.service';
import { forkJoin } from 'rxjs';

export const initialDataOrganizationTypeListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const organizationTypeService = inject(OrganizationTypeService);

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: true,
  };

  return forkJoin([
    organizationTypeService.getAll(requestParameters)
  ]);
};

export const initialDataOrganizationTypeEditResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const organizationTypeService = inject(OrganizationTypeService);
  const id = Number(route.paramMap.get('id'));
  return organizationTypeService.getById(id);
};
