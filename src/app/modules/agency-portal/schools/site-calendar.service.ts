import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

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
  private useMockData = true; // Cambiar a false cuando el backend esté listo

  constructor(private http: HttpClient) {}

  /**
   * Obtiene los días de funcionamiento de un sitio
   */
  getOperatingDays(schoolId: number): Observable<SiteCalendarResponse> {
    if (this.useMockData) {
      return of(this.generateMockData(schoolId)).pipe(delay(500));
    }
    return this.http.get<SiteCalendarResponse>(`${this.apiUrl}/get-operating-days/${schoolId}`);
  }

  /**
   * Alterna el estado de funcionamiento de un día específico
   */
  toggleOperatingDay(request: SiteOperatingDayRequest): Observable<boolean> {
    if (this.useMockData) {
      console.log('Mock toggle operating day:', request);
      return of(true).pipe(delay(300));
    }
    return this.http.post<boolean>(`${this.apiUrl}/toggle-operating-day`, request);
  }

  /**
   * Actualiza múltiples días de funcionamiento
   */
  bulkUpdateOperatingDays(schoolId: number, days: SiteOperatingDayRequest[]): Observable<boolean> {
    if (this.useMockData) {
      console.log('Mock bulk update operating days:', { schoolId, days });
      return of(true).pipe(delay(500));
    }
    return this.http.post<boolean>(`${this.apiUrl}/bulk-update-operating-days`, {
      schoolId,
      days
    });
  }

  /**
   * Genera datos de prueba basados en los modelos del backend
   */
  private generateMockData(schoolId: number): SiteCalendarResponse {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Generar días para el mes actual y el siguiente
    const operatingDays: SiteOperatingDay[] = [];
    let id = 1;

    // Mes actual
    for (let day = 1; day <= 31; day++) {
      const date = new Date(currentYear, currentMonth, day);
      if (date.getMonth() !== currentMonth) break; // Salir si cambia el mes

      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // Simular diferentes escenarios
      let isExcluded = false;
      let isWeekendOverride = false;
      let startTime = '08:00:00';
      let endTime = '16:00:00';
      let comment = 'Día de funcionamiento normal';

      // Fines de semana
      if (isWeekend) {
        if (day % 3 === 0) {
          // Algunos fines de semana funcionan por excepción
          isWeekendOverride = true;
          comment = 'Fin de semana - Funciona por excepción';
        } else {
          // La mayoría de fines de semana no funcionan
          isExcluded = true;
          startTime = '';
          endTime = '';
          comment = 'Fin de semana - No funciona';
        }
      } else {
        // Días de semana
        if (day % 7 === 0) {
          // Algunos días de semana están excluidos
          isExcluded = true;
          startTime = '';
          endTime = '';
          comment = 'Día excluido - No funciona';
        } else if (day % 5 === 0) {
          // Algunos días tienen horarios especiales
          startTime = '09:00:00';
          endTime = '15:00:00';
          comment = 'Horario especial';
        }
      }

      operatingDays.push({
        Id: id++,
        SchoolId: schoolId,
        OperatingDate: date,
        StartTime: startTime,
        EndTime: endTime,
        IsWeekendOverride: isWeekendOverride,
        IsExcluded: isExcluded,
        Comment: comment,
        CreatedAt: new Date(currentYear, currentMonth, day - 10),
        UpdatedAt: new Date(currentYear, currentMonth, day - 5)
      });
    }

    // Mes siguiente
    for (let day = 1; day <= 15; day++) {
      const date = new Date(currentYear, currentMonth + 1, day);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      let isExcluded = false;
      let isWeekendOverride = false;
      let startTime = '08:00:00';
      let endTime = '16:00:00';
      let comment = 'Día de funcionamiento normal';

      if (isWeekend) {
        if (day % 4 === 0) {
          isWeekendOverride = true;
          comment = 'Fin de semana - Funciona por excepción';
        } else {
          isExcluded = true;
          startTime = '';
          endTime = '';
          comment = 'Fin de semana - No funciona';
        }
      } else {
        if (day % 6 === 0) {
          isExcluded = true;
          startTime = '';
          endTime = '';
          comment = 'Día excluido - No funciona';
        }
      }

      operatingDays.push({
        Id: id++,
        SchoolId: schoolId,
        OperatingDate: date,
        StartTime: startTime,
        EndTime: endTime,
        IsWeekendOverride: isWeekendOverride,
        IsExcluded: isExcluded,
        Comment: comment,
        CreatedAt: new Date(currentYear, currentMonth, 20),
        UpdatedAt: new Date(currentYear, currentMonth, 25)
      });
    }

    return {
      SchoolId: schoolId,
      SchoolName: `Escuela de Prueba ${schoolId}`,
      OperatingDays: operatingDays
    };
  }
}
