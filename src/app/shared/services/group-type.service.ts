import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/QueryParameters';
import { GroupType } from '../models/GroupType';
import { GroupTypeRequest } from '../models/Request/GroupTypeRequest';

@Injectable({
  providedIn: 'root',
})
export class GroupTypeService {
  private _groupTypes: BehaviorSubject<GroupType[] | null> = new BehaviorSubject(null);
  private _groupType: BehaviorSubject<GroupType | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/group-type`;
  private _httpClient = inject(HttpClient);

  constructor() {}

  get groupTypes$(): Observable<GroupType[] | null> {
    return this._groupTypes.asObservable();
  }

  get groupType$(): Observable<GroupType | null> {
    return this._groupType.asObservable();
  }

  /**
   * Get a group type by id
   * @param queryParameters - Query parameters
   * @returns Observable<GroupType>
   */
  getGroupTypeById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-group-type-by-id`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._groupType.next(response)));
  }

  /**
   * Get all group types from the database
   * @param queryParameters - Query parameters
   * @returns Observable<GroupType[]>
   */
  getAllGroupTypesFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-all-group-types-from-db`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._groupTypes.next(response)));
  }

  /**
   * Insert a group type
   * @param groupType - Group type
   * @param queryParameters - Query parameters
   * @returns Observable<any>
   */
  insertGroupType(groupType: GroupTypeRequest, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/insert-group-type`, groupType, getHttpOptions(queryParameters));
  }

  /**
   * Update a group type
   * @param groupType - Group type
   * @param queryParameters - Query parameters
   * @returns Observable<any>
   */
  updateGroupType(groupType: GroupType, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-group-type`, groupType, getHttpOptions(queryParameters));
  }

  /**
   * Delete a group type
   * @param queryParameters - Query parameters
   * @returns Observable<any>
   */
  deleteGroupType(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-group-type`, getHttpOptions(queryParameters));
  }

  /**
   * Obtiene Site Location por Group Type
   * @param queryParameters Los parámetros de consulta que incluyen el ID del tipo de grupo
   * @returns Un observable que emite el Site Location obtenido
   */
  getSiteLocationByGroupType(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-site-location-by-group-type`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._groupTypes.next(response)));
  }

  /**
   * Get group types by program
   * @param queryParameters - Query parameters that include the program ID
   * @returns Observable<GroupType[]>
   */
  getGroupTypesByProgram(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-group-types-by-program`, getHttpOptions(queryParameters));
  }
}
