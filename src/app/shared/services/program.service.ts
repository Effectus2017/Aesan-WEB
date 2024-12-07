import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions, handleError } from '../utils';
import { QueryParameters } from '../models/QueryParameters';

@Injectable({
  providedIn: 'root',
})
export class ProgramsService {
  private _programInscriptions: BehaviorSubject<any | null> = new BehaviorSubject(null);
  private _http: HttpClient = inject(HttpClient);
  private apiUrl = `${environment.baseHttpUrl}/program`;

  constructor() {}

  getPrograms(): Observable<any> {
    return this._http.get(this.apiUrl);
  }

  getProgramsById(id: number): Observable<any> {
    return this._http.get(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene todas las inscripciones a programas
   */
  getAllProgramInscriptions(requestParameters: QueryParameters): Observable<any> {
    return <Observable<any>>this._http.get<any>(`${this.apiUrl}` + '/get-all-program-inscriptions', getHttpOptions(requestParameters)).pipe(
      tap((response: any) => {
        this._programInscriptions.next(response);
      }),
      catchError(handleError)
    );
  }

  createProgram(program: any): Observable<any> {
    return this._http.post(this.apiUrl, program);
  }

  updateProgram(id: number, program: any): Observable<any> {
    return this._http.put(`${this.apiUrl}/${id}`, program);
  }

  deleteProgram(id: number): Observable<any> {
    return this._http.delete(`${this.apiUrl}/${id}`);
  }
}
