import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { PermissionService } from 'app/shared/services/permission.service';
import { forkJoin, map } from 'rxjs';

export const initialDataPermissionsListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const permissionService = inject(PermissionService);

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: true,
  };

  return forkJoin([permissionService.getAllPermissionsFromDb(requestParameters)]).pipe(
    map(([permissions]) => ({
      permissions: permissions.body,
    }))
  );
};

export const initialDataPermissionsEditResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const permissionService = inject(PermissionService);
  const requestParameters: QueryParameters = {
    id: Number(route.paramMap.get('id')),
  };
  return permissionService.getPermissionById(requestParameters).pipe(
    map((permission) => ({
      permission: permission.body,
    }))
  );
};
