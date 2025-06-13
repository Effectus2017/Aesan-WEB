import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/QueryParameters';
import { HouseholdMember } from '../models/HouseholdMember';
import { HouseholdMemberRequest } from "../models/Request/HouseholdMemberRequest";

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

  /**
   * Obtiene un miembro del hogar por su ID
   * @param queryParameters Los parámetros de consulta
   * @returns El miembro del hogar
   */
  getHouseholdMemberById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-household-member-by-id`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._householdMember.next(response)));
  }

  /**
   * Obtiene todos los miembros del hogar de la base de datos
   * @param queryParameters Los parámetros de consulta
   * @returns Todos los miembros del hogar
   */
  getAllHouseholdMembersFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-all-household-members-from-db`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._householdMembers.next(response)));
  }

  /**
   * Inserta un miembro del hogar
   * @param householdMember El miembro del hogar
   * @param queryParameters Los parámetros de consulta
   * @returns El miembro del hogar
   */
  insertHouseholdMember(householdMember: HouseholdMember | HouseholdMemberRequest, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/insert-household-member`, householdMember, getHttpOptions(queryParameters));
  }

  /**
   * Actualiza un miembro del hogar
   * @param householdMember El miembro del hogar
   * @param queryParameters Los parámetros de consulta
   * @returns El miembro del hogar
   */
  updateHouseholdMember(householdMember: HouseholdMember, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-household-member`, householdMember, getHttpOptions(queryParameters));
  }

  /**
   * Elimina un miembro del hogar
   * @param queryParameters Los parámetros de consulta
   * @returns El miembro del hogar
   */
  deleteHouseholdMember(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-household-member`, getHttpOptions(queryParameters));
  }
}
