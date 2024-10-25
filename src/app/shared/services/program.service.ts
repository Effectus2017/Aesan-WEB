import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProgramsService {
  private apiUrl = `${environment.baseHttpUrl}/programs`;

  constructor(private http: HttpClient) { }

  getPrograms(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getProgramsById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createProgram(program: any): Observable<any> {
    return this.http.post(this.apiUrl, program);
  }

  updateProgram(id: number, program: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, program);
  }

  deleteProgram(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
