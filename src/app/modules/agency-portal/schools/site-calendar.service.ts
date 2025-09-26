import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces para los datos
export interface SiteOperatingDay {
  Id: number;
  SchoolId: number;
  OperatingDate: Date;
  StartTime: string;
  EndTime: string;
  IsWeekendOverride: boolean;
  IsExcluded: boolean;
  Comment: string;
  CreatedAt: Date;
  UpdatedAt: Date;
}

export interface SiteOperatingDayRequest {
  SchoolId: number;
  OperatingDate: Date;
  StartTime?: string;
  EndTime?: string;
  IsWeekendOverride: boolean;
  IsExcluded: boolean;
  Comment?: string;
}

export interface SiteCalendarResponse {
  SchoolId: number;
  SchoolName: string;
  OperatingDays: SiteOperatingDay[];
}

@Injectable({
  providedIn: 'root'
})
export class SiteCalendarService {
  private apiUrl = '/api/site-calendar';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene los días de funcionamiento de un sitio
   */
  getOperatingDays(schoolId: number): Observable<SiteCalendarResponse> {
    return this.http.get<SiteCalendarResponse>(`${this.apiUrl}/get-operating-days/${schoolId}`);
  }

  /**
   * Alterna el estado de funcionamiento de un día específico
   */
  toggleOperatingDay(request: SiteOperatingDayRequest): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/toggle-operating-day`, request);
  }

  /**
   * Actualiza múltiples días de funcionamiento
   */
  bulkUpdateOperatingDays(schoolId: number, days: SiteOperatingDayRequest[]): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/bulk-update-operating-days`, {
      schoolId,
      days
    });
  }
}
