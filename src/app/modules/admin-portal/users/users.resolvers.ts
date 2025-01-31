import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';

import { QueryParameters } from 'app/shared/models/QueryParameters';
import { UsersService } from '../../../shared/services/users.service';


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

@Injectable({
  providedIn: 'root',
})
export class AddUsersResolver implements Resolve<any> {
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
    return forkJoin([
      this._usersService.getAllRolesFromDb(requestParameters),
    ]);
  }
}

@Injectable({
  providedIn: 'root',
})
export class EditUsersResolver implements Resolve<any> {
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
    const requestUser: QueryParameters = {
      userId: route.paramMap.get('id'),
    };
    return forkJoin([
      this._usersService.getUserByIdFromDb(requestUser),
      this._usersService.getAllRolesFromDb({
        take: 25,
        skip: 0,
      }),
    ]);
  }
}

@Injectable({
  providedIn: 'root',
})
export class RolesListsResolver implements Resolve<any> {
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

    return forkJoin([this._usersService.getAllRolesFromDb(requestParameters)]);
  }
}
