import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { environment } from 'environments/environment';
import { QueryParameters } from '../models/QueryParameters';
import { Role, RequestUser } from '../../modules/admin-portal/users/users.types';
import { handleError } from '../utils';
import { getHttpOptions } from '../utils';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  // Private
  private _users: BehaviorSubject<RequestUser[] | null> = new BehaviorSubject(null);
  private _user: BehaviorSubject<RequestUser | null> = new BehaviorSubject(null);

  private _roles: BehaviorSubject<Role[] | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/user`;

  constructor(private _httpClient: HttpClient) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Getter for Users
   */
  get users$(): Observable<RequestUser[]> {
    return this._users.asObservable();
  }

  get user$(): Observable<RequestUser> {
    return this._user.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  get roles$(): Observable<Role[]> {
    return this._roles.asObservable();
  }

  get getPassword(): string {
    return localStorage.getItem('password') ?? '';
  }

  set setPassword(password: any) {
    localStorage.setItem('password', password);
  }

  removePassword() {
    localStorage.removeItem('password');
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  getUserByIdFromDb(requestParameters: QueryParameters): Observable<any> {
    return <Observable<any>>this._httpClient.get<any>(`${this.apiUrl}` + '/get-user-by-id', getHttpOptions(requestParameters)).pipe(
      tap((response: any) => {
        this._user.next(response);
      }),
      catchError(handleError)
    );
  }

  getAllUsersFromDb(requestParameters: QueryParameters): Observable<any> {
    return <Observable<any>>this._httpClient.get<any>(`${this.apiUrl}` + '/get-all-users-from-db', getHttpOptions(requestParameters)).pipe(
      tap((response: any) => {
        this._users.next(response);
      }),
      catchError(handleError)
    );
  }

  getAllUsersFromDbWithSP(requestParameters: QueryParameters): Observable<any> {
    return <Observable<any>>this._httpClient.get<any>(`${this.apiUrl}` + '/get-all-users-from-db-with-sp', getHttpOptions(requestParameters)).pipe(
      tap((response: any) => {
        this._users.next(response);
      }),
      catchError(handleError)
    );
  }

  getAllRolesFromDb(requestParameters: QueryParameters): Observable<Role[]> {
    return <Observable<any>>this._httpClient.get<any>(`${this.apiUrl}` + '/get-all-roles-from-db', getHttpOptions(requestParameters)).pipe(
      tap((response: any) => {
        this._roles.next(response);
      }),
      catchError(handleError)
    );
  }

  add(param: RequestUser, requestParameters: QueryParameters): Observable<any> {
    return <Observable<any>>this._httpClient.post<any>(`${this.apiUrl}` + '/add-user-to-db', param, getHttpOptions(requestParameters)).pipe(catchError(handleError));
  }

  update(param: RequestUser, requestParameters: QueryParameters): Observable<any> {
    return <Observable<any>>this._httpClient.put<any>(`${this.apiUrl}` + '/update-user-from-db', param, getHttpOptions(requestParameters)).pipe(catchError(handleError));
  }

  delete(requestParameters: QueryParameters): Observable<any> {
    return <Observable<any>>this._httpClient.delete<any>(`${this.apiUrl}` + '/delete-user-from-db', getHttpOptions(requestParameters)).pipe(catchError(handleError));
  }

  changePassword(param: any, requestParameters: QueryParameters): Observable<any> {
    return <Observable<any>>this._httpClient.post<any>(`${this.apiUrl}` + '/change-password', param, getHttpOptions(requestParameters)).pipe(catchError(handleError));
  }

}
