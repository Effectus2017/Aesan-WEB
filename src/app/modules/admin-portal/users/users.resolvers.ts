import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable, map } from 'rxjs';

import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { UsersService } from '../../../shared/services/users.service';
import { GeoService } from 'app/shared/services/geo.service';
import { PermissionService } from 'app/shared/services/permission.service';
import { ProgramService } from 'app/shared/services/program.service';
import { AuthService } from 'app/core/auth/auth.service';

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
      isPropietary: true,
    };

    return forkJoin([this._usersService.getAllUsersFromDbWithSP(requestParameters)]).pipe(
      map(([users]) => ({
        users: users.body
      }))
    );
  }
}

export const initialAgenciesUsersListResolver: ResolveFn<any> = () => {
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
  const usersService = inject(UsersService);
  const programService = inject(ProgramService);
  const geoService = inject(GeoService);

  return forkJoin([
    usersService.getAllRolesFromDb({ aesanOnly: true, forDropdown: true }),
    programService.getAllProgramsFromDb({ alls: true, forDropdown: true }),
    geoService.getCitiesFromDb({ take: 25, skip: 0, alls: true, forDropdown: true }),
    geoService.getRegionsFromDb({ take: 25, skip: 0, alls: true, forDropdown: true }),
  ]).pipe(
    map(([roles, programs, cities, regions]) => ({
      roles: roles?.body ?? [],
      programs: programs?.body ?? [],
      cities: cities?.body ?? [],
      regions: regions?.body ?? [],
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
  const usersService = inject(UsersService);
  const permissionService = inject(PermissionService);
  const programService = inject(ProgramService);
  const geoService = inject(GeoService);

  return forkJoin([
    usersService.getUserByIdWithSP({ userId: route.paramMap.get('id') }),
    usersService.getAllRolesFromDb({ aesanOnly: true, forDropdown: true }),
    permissionService.getUserPermissions({
      userId: route.paramMap.get('id'),
    }),
    programService.getAllProgramsFromDb({ alls: true, forDropdown: true }),
    geoService.getCitiesFromDb({ take: 25, skip: 0, alls: true, forDropdown: true }),
    geoService.getRegionsFromDb({ take: 25, skip: 0, alls: true, forDropdown: true }),
  ]).pipe(
    map(([user, roles, permissions, programs, cities, regions]) => ({
      user: user.body,
      roles: roles?.body ?? [],
      permissions: permissions.body,
      programs: programs?.body ?? [],
      cities: cities?.body ?? [],
      regions: regions?.body ?? [],
    }))
  );
};

/**
 * Resolver para el perfil del usuario actual en admin-portal (misma estructura que edit).
 */
export const initialProfileUsersResolver: ResolveFn<any> = () => {
  const usersService = inject(UsersService);
  const permissionService = inject(PermissionService);
  const programService = inject(ProgramService);
  const authService = inject(AuthService);

  const userId = authService.getUserId();
  
  if (!userId) {
    throw new Error('Usuario no autenticado');
  }

  return forkJoin([
    usersService.getUserByIdWithSP({ userId }),
    usersService.getAllRolesFromDb({ aesanOnly: true, forDropdown: true }),
    permissionService.getUserPermissions({ userId }),
    programService.getAllProgramsFromDb({ alls: true, forDropdown: true })
  ]).pipe(
    map(([user, roles, permissions, programs]) => ({
      user: user.body,
      roles: roles?.body ?? [],
      permissions: permissions.body,
      programs: programs?.body ?? []
    }))
  );
};
