import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HouseholdService {
  private baseUrl = '/api/household';

  constructor(private http: HttpClient) {}

  getAll(params?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/list`, { params });
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  add(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, data);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/edit/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }
}
