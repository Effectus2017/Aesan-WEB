import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface SiteOperatingDay {
  id: number;
  siteId: number;
  date: string;
  startTime: string;
  endTime: string;
  isOperating: boolean;
  comment: string;
  isWeekendOverride: boolean;
  isExcluded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SiteOperatingDayRequest {
  id?: number;
  siteId: number;
  date: string;
  startTime: string;
  endTime: string;
  isOperating: boolean;
  comment: string;
  isWeekendOverride: boolean;
  isExcluded: boolean;
}

export interface SiteCalendarResponse {
  operatingDays: SiteOperatingDay[];
  siteName: string;
}

@Injectable({
  providedIn: 'root'
})
export class SiteCalendarService {
  private apiUrl = `${environment.baseHttpUrl}/site-calendar`;

  constructor(private http: HttpClient) {}

  getOperatingDays(params: { siteId: number }): Observable<SiteCalendarResponse> {
    return this.http.get<SiteCalendarResponse>(`${this.apiUrl}/operating-days`, { params: params as any });
  }

  toggleOperatingDay(request: SiteOperatingDayRequest, params: { siteId: number }): Observable<SiteOperatingDay> {
    return this.http.post<SiteOperatingDay>(`${this.apiUrl}/toggle-operating-day`, request, { params: params as any });
  }

  deleteOperatingDay(params: { id: number }): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/operating-day`, { params: params as any });
  }
}
