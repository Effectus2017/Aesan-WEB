import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AgencyCalendarResponse } from 'app/shared/models/AgencyAppointment';
import { AgencyAppointmentRequest } from 'app/shared/models/Request/AgencyAppointmentRequest';

@Injectable({
  providedIn: 'root'
})
export class AgencyCalendarService {
  private _httpClient = inject(HttpClient);

  getAppointments(agencyId: number, month?: number, year?: number): Observable<AgencyCalendarResponse> {
    let params = new HttpParams().set('AgencyId', agencyId.toString());
    
    if (month) {
      params = params.set('Month', month.toString());
    }
    if (year) {
      params = params.set('Year', year.toString());
    }

    return this._httpClient.get<AgencyCalendarResponse>('api/agency-calendar/get-agency-appointments', { params });
  }

  createAppointment(request: AgencyAppointmentRequest): Observable<{ id: number; success: boolean }> {
    return this._httpClient.post<{ id: number; success: boolean }>('api/agency-calendar/create-appointment', request);
  }

  updateAppointment(request: AgencyAppointmentRequest): Observable<boolean> {
    return this._httpClient.put<boolean>('api/agency-calendar/update-appointment', request);
  }

  deleteAppointment(id: number): Observable<boolean> {
    return this._httpClient.delete<boolean>(`api/agency-calendar/delete-appointment/${id}`);
  }
}
