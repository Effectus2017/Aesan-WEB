import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';

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

    return forkJoin([this._usersService.getAllUsersFromDbWithSP(requestParameters)]);
  }
}

export const initialAgenciesUsersListResolver: ResolveFn<any> = () => {
  const agencyService = inject(AgencyService);
  const usersService = inject(UsersService);
  const requestParameters: QueryParameters = {
    take: 25,
    skip: 0,
  };

  return forkJoin([usersService.getAllUsersFromDbWithSP(requestParameters)]);
};

export const initialRolesResolver: ResolveFn<any> = () => {
  const usersService = inject(UsersService);

  return forkJoin([usersService.getAllRolesFromDb({ take: 25, skip: 0 })]);
};

export const initialAddUsersResolver: ResolveFn<any> = () => {
  const agencyService = inject(AgencyService);
  const usersService = inject(UsersService);

  return forkJoin([agencyService.getAllAgenciesFromDb({ alls: true, isList: true }), usersService.getAllRolesFromDb({ take: 25, skip: 0 })]);
};

export const initialEditUsersResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const agencyService = inject(AgencyService);
  const usersService = inject(UsersService);
  const permissionService = inject(PermissionService);

  return forkJoin([
    agencyService.getAllAgenciesList({ alls: true }),
    usersService.getUserByIdFromDb({ userId: route.paramMap.get('id') }),
    usersService.getAllRolesFromDb({
      take: 25,
      skip: 0,
    }),
    permissionService.getUserPermissions({
      userId: route.paramMap.get('id'),
    }),
  ]);
};
