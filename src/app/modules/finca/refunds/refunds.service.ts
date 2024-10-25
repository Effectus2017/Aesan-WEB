import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RefundsService {
  private apiUrl = `${environment.apiUrl}/refunds`;

  constructor(private http: HttpClient) { }

  getRefunds(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getRefundById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createRefund(refund: any): Observable<any> {
    return this.http.post(this.apiUrl, refund);
  }

  updateRefund(id: number, refund: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, refund);
  }

  deleteRefund(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
