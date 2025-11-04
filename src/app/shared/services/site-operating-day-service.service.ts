import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { QueryParameters } from '../models/QueryParameters';
import { SiteOperatingDayService } from '../models/SiteOperatingDayService';
import { SiteOperatingDayServiceRequest } from '../models/Request/SiteOperatingDayServiceRequest';

@Injectable({
  providedIn: 'root',
})
export class SiteOperatingDayServiceService {
  private apiUrl = `${environment.baseHttpUrl}/site-operating-day-service`;
  private _httpClient = inject(HttpClient);

  constructor() {}

  /**
   * Obtiene todos los servicios de un día de funcionamiento
   * @param operatingDayId ID del día de funcionamiento
   * @returns Lista de servicios del día
   */
  getServicesByOperatingDay(operatingDayId: number): Observable<SiteOperatingDayService[]> {
    return this._httpClient.get<SiteOperatingDayService[]>(
      `${this.apiUrl}/${operatingDayId}`,
      getHttpOptions()
    );
  }

  /**
   * Obtiene un servicio por su ID
   * @param id ID del servicio
   * @returns El servicio encontrado
   */
  getServiceById(id: number): Observable<SiteOperatingDayService> {
    return this._httpClient.get<SiteOperatingDayService>(
      `${this.apiUrl}/by-id/${id}`,
      getHttpOptions()
    );
  }

  /**
   * Crea un nuevo servicio para un día de funcionamiento
   * @param request Datos del servicio a crear
   * @returns ID del servicio creado
   */
  createService(request: SiteOperatingDayServiceRequest): Observable<{ id: number }> {
    return this._httpClient.post<{ id: number }>(
      this.apiUrl,
      request,
      getHttpOptions()
    );
  }

  /**
   * Actualiza un servicio existente
   * @param id ID del servicio
   * @param request Datos actualizados del servicio
   * @returns True si la operación fue exitosa
   */
  updateService(id: number, request: SiteOperatingDayServiceRequest): Observable<boolean> {
    return this._httpClient.put<boolean>(
      `${this.apiUrl}/${id}`,
      request,
      getHttpOptions()
    );
  }

  /**
   * Elimina un servicio
   * @param id ID del servicio
   * @returns True si la operación fue exitosa
   */
  deleteService(id: number): Observable<boolean> {
    return this._httpClient.delete<boolean>(
      `${this.apiUrl}/${id}`,
      getHttpOptions()
    );
  }

  /**
   * Habilita o deshabilita un servicio
   * @param id ID del servicio
   * @param isEnabled Estado a establecer (true = habilitado, false = deshabilitado)
   * @returns True si la operación fue exitosa
   */
  toggleService(id: number, isEnabled: boolean): Observable<boolean> {
    return this._httpClient.post<boolean>(
      `${this.apiUrl}/${id}/toggle`,
      isEnabled,
      getHttpOptions()
    );
  }
}

