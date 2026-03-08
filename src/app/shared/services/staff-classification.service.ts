import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { QueryParameters } from '../models/common/QueryParameters';
import { StaffClassification } from '../models/staff/StaffClassification';
import { StaffClassificationRequest } from '../models/request/StaffClassificationRequest';
import { getHttpOptions } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class StaffClassificationService {
  private _staffClassifications: BehaviorSubject<StaffClassification[] | null> = new BehaviorSubject(null);
  private _staffClassification: BehaviorSubject<StaffClassification | null> = new BehaviorSubject(null);

  private apiUrl = `${environment.baseHttpUrl}/staff-classification`;
  private _httpClient = inject(HttpClient);

  // Getters para observables
  get staffClassifications$(): Observable<StaffClassification[] | null> {
    return this._staffClassifications.asObservable();
  }

  get staffClassification$(): Observable<StaffClassification | null> {
    return this._staffClassification.asObservable();
  }

  // Métodos para obtener datos
  getAllStaffClassificationsFromDb(queryParams: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-all-staff-classifications-from-db`, getHttpOptions(queryParams))
      .pipe(
        tap((response: any) => {
          this._staffClassifications.next(response);
        })
      );
  }

  getStaffClassificationById(queryParams: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-staff-classification-by-id`, getHttpOptions(queryParams))
      .pipe(
        tap((response: any) => {
          this._staffClassification.next(response);
        })
      );
  }

  // Métodos para crear y actualizar
  insertStaffClassification(staffClassificationRequest: StaffClassificationRequest, options: any = {}): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/insert-staff-classification`, staffClassificationRequest, getHttpOptions(options));
  }

  updateStaffClassification(staffClassificationRequest: StaffClassificationRequest, options: any = {}): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-staff-classification`, staffClassificationRequest, getHttpOptions(options));
  }

  // Método para eliminar
  deleteStaffClassification(queryParams: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-staff-classification`, getHttpOptions(queryParams));
  }


}
