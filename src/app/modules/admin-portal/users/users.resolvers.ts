import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable, map } from 'rxjs';

import { QueryParameters } from 'app/shared/models/QueryParameters';
import { UsersService } from '../../../shared/services/users.service';
import { AgencyService } from 'app/shared/services/agency.service';
import { PermissionService } from 'app/shared/services/permission.service';

@Injectable({
  providedIn: 'root',
})
export class UsersListsResolver implements Resolve<any> {
  /**
   * Constructor
   */
  constructor(private _usersService: UsersService) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Resolver
   *
   * @param route
   * @param state
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const requestParameters: QueryParameters = {
      take: 25,
      skip: 0,
    };

    return forkJoin([this._usersService.getAllUsersFromDbWithSP(requestParameters)]).pipe(
      map(([users]) => ({
        users: users.body
      }))
    );
  }
}

export const initialAgenciesUsersListResolver: ResolveFn<any> = () => {
  const agencyService = inject(AgencyService);
  const usersService = inject(UsersService);
  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
  };

  return forkJoin([usersService.getAllUsersFromDbWithSP(requestParameters)]).pipe(
    map(([users]) => ({
      users: users.body,
    }))
  );
};

export const initialRolesResolver: ResolveFn<any> = () => {
  const usersService = inject(UsersService);

  return forkJoin([usersService.getAllRolesFromDb({ take: 25, skip: 0 })]).pipe(
    map(([roles]) => ({
      roles: roles.body
    }))
  );
};

export const initialAddUsersResolver: ResolveFn<any> = () => {
  const agencyService = inject(AgencyService);
  const usersService = inject(UsersService);

  return forkJoin([
    agencyService.getAllAgenciesFromDb({ alls: true, isList: true, isPropietary: true }),
    usersService.getAllRolesFromDb({ take: 25, skip: 0 })
  ]).pipe(
    map(([agencies, roles]) => ({
      agencies: agencies.body,
      roles: roles.body
    }))
  );
};

/**
 * Resolver para editar un usuario
 *
 * @param route
 * @returns Observable<any>
 */
export const initialEditUsersResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const agencyService = inject(AgencyService);
  const usersService = inject(UsersService);
  const permissionService = inject(PermissionService);

  return forkJoin([
    agencyService.getAllAgenciesFromDb({ alls: true, isList: true, isPropietary: true }),
    usersService.getUserByIdWithSP({ userId: route.paramMap.get('id') }),
    usersService.getAllRolesFromDb({
      take: 25,
      skip: 0,
    }),
    permissionService.getUserPermissions({
      userId: route.paramMap.get('id'),
    }),
  ]).pipe(
    map(([agencies, user, roles, permissions]) => ({
      agencies: agencies.body,
      user: user.body,
      roles: roles.body,
      permissions: permissions.body
    }))
  );
};
