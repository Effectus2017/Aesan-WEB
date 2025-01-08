import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/QueryParameters';
import { Program, ProgramInscription } from '../models/Program';

@Injectable({
  providedIn: 'root',
})
export class ProgramService {
  private _programs: BehaviorSubject<Program[] | null> = new BehaviorSubject(null);
  private _program: BehaviorSubject<Program | null> = new BehaviorSubject(null);
  private _programInscriptions: BehaviorSubject<ProgramInscription[] | null> = new BehaviorSubject(null);
  private apiUrl = `${environment.baseHttpUrl}/program`;
  private _httpClient = inject(HttpClient);

  constructor() {}

  /**
   * Obtiene todos los programas
   * @returns Los programas
   */
  get programs$(): Observable<Program[] | null> {
    return this._programs.asObservable();
  }

  /**
   * Obtiene un programa
   * @returns El programa
   */
  get program$(): Observable<Program | null> {
    return this._program.asObservable();
  }

  /**
   * Obtiene todas las inscripciones a programas
   * @returns Las inscripciones a programas
   */
  get programInscriptions$(): Observable<ProgramInscription[] | null> {
    return this._programInscriptions.asObservable();
  }

  /**
   * Obtiene un programa por su ID
   * @param queryParameters Los parámetros de consulta
   * @returns El programa
   */
  getProgramById(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient
      .get(`${this.apiUrl}/get-program-by-id`, getHttpOptions(queryParameters))
      .pipe(tap((response: any) => this._program.next(response)));
  }

  /**
   * Obtiene todos los programas de la base de datos
   * @param queryParameters Los parámetros de consulta
   * @returns Los programas
   */
  getAllProgramsFromDb(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-all-programs-from-db`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._programs.next(response)));
  }

  /**
   * Obtiene todas las inscripciones a programas
   * @param queryParameters Los parámetros de consulta
   * @returns Las inscripciones a programas
   */
  getAllProgramInscriptions(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/get-all-program-inscriptions`, getHttpOptions(queryParameters)).pipe(tap((response: any) => this._programInscriptions.next(response)));
  }

  /**
   * Inserta un programa
   * @param program El programa
   * @param queryParameters Los parámetros de consulta
   * @returns El programa insertado
   */
  insertProgram(program: Program, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/insert-program`, program, getHttpOptions(queryParameters));
  }

  /**
   * Actualiza un programa
   * @param program El programa
   * @param queryParameters Los parámetros de consulta
   * @returns El programa actualizado
   */
  updateProgram(program: Program, queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.put(`${this.apiUrl}/update-program`, program, getHttpOptions(queryParameters));
  }

  /**
   * Elimina un programa
   * @param queryParameters Los parámetros de consulta
   * @returns True si se eliminó correctamente
   */
  deleteProgram(queryParameters: QueryParameters): Observable<any> {
    return this._httpClient.delete(`${this.apiUrl}/delete-program`, getHttpOptions(queryParameters));
  }
}
