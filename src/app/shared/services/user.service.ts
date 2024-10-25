import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { environment } from 'environments/environment';
import { TokenUser } from '../models/user.types';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/QueryParameters';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.baseHttpUrl}/user`;

  private _httpClient = inject(HttpClient);
  private _user: ReplaySubject<TokenUser> = new ReplaySubject<TokenUser>(1);

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  set user(value: TokenUser)
  {
      this._user.next(value);
  }

  get user$(): Observable<TokenUser>
  {
      return this._user.asObservable();
  }

  getUserById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-user-by-id`, getHttpOptions(queryParameters));
  }

  getAllUsersFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-all-users-from-db`, getHttpOptions(queryParameters));
  }

  getAllRolesFromDb(): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-all-roles-from-db`);
  }

  getAllProgramsFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-all-programs-from-db`, getHttpOptions(queryParameters));
  }

  registerUserAgency(model: any): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/register-user-agency`, model);
  }
}

