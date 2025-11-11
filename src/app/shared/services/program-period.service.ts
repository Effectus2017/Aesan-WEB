import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { ProgramPeriodResponse, ProgramPeriodRequest } from '../models/ProgramPeriod';

@Injectable({
  providedIn: 'root',
})
export class ProgramPeriodService {
  private apiUrl = `${environment.baseHttpUrl}/program-period`;
  private _httpClient = inject(HttpClient);

  /**
   * Obtiene todos los períodos de un programa
   * @param programId ID del programa
   * @returns Los períodos del programa
   */
  getProgramPeriodsByProgramId(programId: number): Observable<ProgramPeriodResponse[]> {
    return this._httpClient.get<ProgramPeriodResponse[]>(
      `${this.apiUrl}/get-by-program-id?programId=${programId}`,
      getHttpOptions({})
    );
  }

  /**
   * Obtiene un período específico de un programa por año
   * @param programId ID del programa
   * @param year Año del período
   * @returns El período encontrado
   */
  getProgramPeriodByProgramIdAndYear(programId: number, year: number): Observable<ProgramPeriodResponse> {
    return this._httpClient.get<ProgramPeriodResponse>(
      `${this.apiUrl}/get-by-program-id-and-year?programId=${programId}&year=${year}`,
      getHttpOptions({})
    );
  }

  /**
   * Inserta un nuevo período de programa
   * @param request Datos del período a insertar
   * @returns El período insertado
   */
  insertProgramPeriod(request: ProgramPeriodRequest): Observable<ProgramPeriodResponse> {
    return this._httpClient.post<ProgramPeriodResponse>(
      `${this.apiUrl}/insert`,
      request,
      getHttpOptions({})
    );
  }

  /**
   * Actualiza un período de programa existente
   * @param request Datos del período a actualizar
   * @returns Resultado de la actualización
   */
  updateProgramPeriod(request: ProgramPeriodRequest): Observable<any> {
    return this._httpClient.put(
      `${this.apiUrl}/update`,
      request,
      getHttpOptions({})
    );
  }

  /**
   * Calcula automáticamente las fechas de inicio y fin para un programa y año
   * @param programId ID del programa
   * @param year Año del período
   * @returns Fechas calculadas
   */
  calculateProgramPeriodDates(programId: number, year: number): Observable<{ startDate: string; endDate: string }> {
    return this._httpClient.get<{ startDate: string; endDate: string }>(
      `${this.apiUrl}/calculate-dates?programId=${programId}&year=${year}`,
      getHttpOptions({})
    );
  }
}

