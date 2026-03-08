import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { getHttpOptions } from '../utils';
import { TemplateVariable } from '../models/log/TemplateVariable';

@Injectable({
  providedIn: 'root',
})
export class TemplateVariableService {
  private apiUrl = `${environment.baseHttpUrl}/template-variable`;
  private _httpClient = inject(HttpClient);
  private _cachedVariables$: Observable<TemplateVariable[]> | null = null;

  /**
   * Obtiene todas las variables disponibles para usar en templates
   * @returns Observable con la lista de variables disponibles
   */
  getAllTemplateVariables(): Observable<TemplateVariable[]> {
    // Si ya tenemos las variables en caché, retornarlas
    if (this._cachedVariables$) {
      return this._cachedVariables$;
    }

    // Si no, hacer la petición y cachear el resultado
    this._cachedVariables$ = this._httpClient.get<TemplateVariable[]>(
      `${this.apiUrl}/get-all-template-variables`,
      getHttpOptions({})
    ).pipe(
      shareReplay(1) // Cachear el resultado para reutilizarlo
    );

    return this._cachedVariables$;
  }

  /**
   * Limpia la caché de variables (útil para forzar una nueva petición)
   */
  clearCache(): void {
    this._cachedVariables$ = null;
  }
}

