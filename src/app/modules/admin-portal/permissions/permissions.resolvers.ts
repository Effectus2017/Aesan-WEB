import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { PermissionService } from 'app/shared/services/permission.service';
import { map } from 'rxjs';

export const initialDataPermissionsListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const permissionService = inject(PermissionService);

  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
    alls: true,
  };

  return permissionService.getAllPermissionsFromDb(requestParameters).pipe(
    map((permissions) => ({
      permissions: permissions.body,
    }))
  );
};

export const initialDataPermissionsEditResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const permissionService = inject(PermissionService);
  const idParam = route.paramMap.get('id');

  // Validar que el ID sea válido (debe ser un string no vacío)
  if (!idParam || idParam.trim() === '') {
    throw new Error('Invalid permission ID');
  }

  const requestParameters: QueryParameters = {
    permissionId: idParam,
  };
  return permissionService.getPermissionById(requestParameters).pipe(
    map((permission) => ({
      permission: permission.body,
    }))
  );
};
