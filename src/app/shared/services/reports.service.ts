import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { HierarchyStructureResponse } from '../models/common/HierarchyStructure';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private apiUrl = `${environment.baseHttpUrl}/reports`;
  private _httpClient = inject(HttpClient);

  constructor() {}

  /**
   * Obtiene la estructura jerárquica para el árbol de jerarquía de escuelas
   * @param year Año para filtrar la estructura
   * @param sponsorId ID del auspiciador (opcional). Si no se proporciona, obtiene todos los auspiciadores
   * @returns Observable con la estructura jerárquica
   */
  getSchoolHierarchyTree(year: number, sponsorId?: number): Observable<HierarchyStructureResponse> {
    let params = new HttpParams().set('year', year.toString());
    
    if (sponsorId) {
      params = params.set('sponsorId', sponsorId.toString());
    }

    return this._httpClient.get<HierarchyStructureResponse>(
      `${this.apiUrl}/school-hierarchy-tree`,
      { params }
    );
  }
}

