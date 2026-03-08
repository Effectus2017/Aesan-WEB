import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { getHttpOptions } from '../../../shared/utils';
import { QueryParameters } from '../../../shared/models/common/QueryParameters';

// Interfaces para los datos
export interface SchoolOperatingDay {
  id: number;
  schoolId: number;
  operatingDate: Date;
  startTime: string;
  endTime: string;
  isWeekend: boolean;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SchoolOperatingDayRequest {
  schoolId: number;
  operatingDate: Date;
  startTime?: string;
  endTime?: string;
  isWeekend: boolean;
  comment?: string;
}

export interface SchoolCalendarResponse {
  schoolId: number;
  schoolName: string;
  operatingDays: SchoolOperatingDay[];
}

@Injectable({
  providedIn: 'root'
})
export class SchoolCalendarService {
  private apiUrl = `${environment.baseHttpUrl}/school-calendar`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene los días de funcionamiento de un sitio
   */
  getOperatingDays(queryParameters: QueryParameters): Observable<any> {
    return this.http.get(`${this.apiUrl}/get-operating-days`, getHttpOptions(queryParameters)).pipe(tap((response: any) => console.log('Operating days response:', response)));
  }

  /**
   * Alterna el estado de funcionamiento de un día específico
   */
  toggleOperatingDay(request: SchoolOperatingDayRequest, queryParameters: QueryParameters): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/toggle-operating-day`, request, getHttpOptions(queryParameters));
  }

  /**
   * Actualiza múltiples días de funcionamiento
   */
  bulkUpdateOperatingDays(schoolId: number, days: SchoolOperatingDayRequest[]): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/bulk-update-operating-days`, {
      schoolId,
      days
    });
  }


  /**
   * Elimina un día de funcionamiento
   */
  deleteOperatingDay(queryParameters: QueryParameters): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/delete-operating-day`, getHttpOptions(queryParameters));
  }

}
