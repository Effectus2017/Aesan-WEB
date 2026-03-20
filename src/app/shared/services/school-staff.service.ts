import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/common/QueryParameters';
import { SchoolStaffRequest, UpdateSchoolStaffRequest } from '../models/request/SchoolStaffRequest';
import { SchoolStaffResponse } from '../models/response/SchoolStaffResponse';

@Injectable({
  providedIn: 'root',
})
export class SchoolStaffService {
  private _schoolStaffs = new BehaviorSubject<SchoolStaffResponse[] | null>(null);
  private _schoolStaff = new BehaviorSubject<SchoolStaffResponse | null>(null);

  private apiUrl = `${environment.baseHttpUrl}/school-staff`;
  private _httpClient = inject(HttpClient);

  get schoolStaffs$(): Observable<SchoolStaffResponse[] | null> {
    return this._schoolStaffs.asObservable();
  }

  get schoolStaff$(): Observable<SchoolStaffResponse | null> {
    return this._schoolStaff.asObservable();
  }

  getSchoolStaffById(queryParameters: QueryParameters): Observable<SchoolStaffResponse | null> {
    return this._httpClient.get(`${this.apiUrl}/get-assignment-by-id`, getHttpOptions(queryParameters)).pipe(
      tap((response: { body: SchoolStaffResponse | null }) => this._schoolStaff.next(response.body)),
      map((response: { body: SchoolStaffResponse | null }) => response.body)
    );
  }

  insertSchoolStaff(request: SchoolStaffRequest, queryParameters: QueryParameters): Observable<unknown> {
    return this._httpClient.post(`${this.apiUrl}/assign-staff`, request, getHttpOptions(queryParameters)).pipe(
      map((response: { body: unknown }) => response.body)
    );
  }

  updateSchoolStaff(assignmentId: number, request: UpdateSchoolStaffRequest, queryParameters: QueryParameters): Observable<unknown> {
    return this._httpClient
      .put(`${this.apiUrl}/update-assignment/${assignmentId}`, request, getHttpOptions(queryParameters))
      .pipe(map((response: { body: unknown }) => response.body));
  }

  deleteSchoolStaff(queryParameters: QueryParameters): Observable<unknown> {
    return this._httpClient.delete(`${this.apiUrl}/unassign-staff`, getHttpOptions(queryParameters)).pipe(
      map((response: { body: unknown }) => response.body)
    );
  }

  getStaffBySchool(queryParameters: QueryParameters): Observable<SchoolStaffResponse[] | null> {
    return this._httpClient.get(`${this.apiUrl}/get-staff-by-school`, getHttpOptions(queryParameters)).pipe(
      tap((response: { body: SchoolStaffResponse[] | null }) => this._schoolStaffs.next(response.body)),
      map((response: { body: SchoolStaffResponse[] | null }) => response.body)
    );
  }

  getSchoolsByStaff(queryParameters: QueryParameters): Observable<SchoolStaffResponse[] | null> {
    return this._httpClient.get(`${this.apiUrl}/get-schools-by-staff`, getHttpOptions(queryParameters)).pipe(
      tap((response: { body: SchoolStaffResponse[] | null }) => this._schoolStaffs.next(response.body)),
      map((response: { body: SchoolStaffResponse[] | null }) => response.body)
    );
  }
}
