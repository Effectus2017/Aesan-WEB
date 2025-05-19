import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/QueryParameters';
import { HouseholdMember } from '../models/HouseholdMember';
import { HouseholdMemberRequest } from '../models/Request/HouseholdMemberRequest';

@Injectable({
  providedIn: 'root',
})
export class HouseholdMemberService {
  private _householdMembers: BehaviorSubject<HouseholdMember[] | null> = new BehaviorSubject(null);
  private _householdMember: BehaviorSubject<HouseholdMember | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/household-member`;
  private _httpClient = inject(HttpClient);

  constructor() {}

  get householdMembers$(): Observable<HouseholdMember[] | null> {
    return this._householdMembers.asObservable();
  }

  get householdMember$(): Observable<HouseholdMember | null> {
    return this._householdMember.asObservable();
  }

  getHouseholdMemberById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-household-member-by-id`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._householdMember.next(response)));
  }

  getAllHouseholdMembersFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-all-household-members-from-db`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._householdMembers.next(response)));
  }

  insertHouseholdMember(householdMember: HouseholdMember | HouseholdMemberRequest, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/insert-household-member`, householdMember, getHttpOptions(queryParameters));
  }

  updateHouseholdMember(householdMember: HouseholdMember, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-household-member`, householdMember, getHttpOptions(queryParameters));
  }

  deleteHouseholdMember(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-household-member`, getHttpOptions(queryParameters));
  }
}
