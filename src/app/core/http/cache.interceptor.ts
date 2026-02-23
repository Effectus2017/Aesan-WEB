import { HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'environments/environment';

interface CacheEntry {
  response: HttpResponse<any>;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos por defecto
const cache = new Map<string, CacheEntry>();

// Endpoints que NO deben cachearse (tiempo real o datos que cambian al crear/editar)
const EXCLUDED_ENDPOINTS = [
  '/messages',
  '/notifications',
  '/realtime',
  '/signalr',
  '/api/logs', // centro de logs: datos en tiempo real, no cachear (evita 401 o datos obsoletos)
  '/get-operating-days', // días de funcionamiento y servicios del calendario (cambian al agregar/editar servicios)
  '/site/', // sitios (cambian al agregar/editar sitios)
  '/staff/', // personal (cambian al agregar/editar personal)
  '/site-staff/', // personal por sitio (cambian al agregar/editar personal en un sitio)
  '/get-all-agencies-from-db', // búsqueda/listado de agencias: filtros dinámicos, no cachear
];

/**
 * Verifica si un endpoint debe ser excluido del caché
 */
function shouldExcludeFromCache(url: string): boolean {
  return EXCLUDED_ENDPOINTS.some(endpoint => url.includes(endpoint));
}

/**
 * Interceptor de caché HTTP
 * Cachea automáticamente las requests GET que no estén en la lista de exclusiones
 */
export const cacheInterceptor = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  // Solo cachear GET requests
  if (req.method !== 'GET') {
    return next(req);
  }

  // Verificar si hay un header que indique no cachear
  if (req.headers.get('X-No-Cache') === 'true') {
    return next(req);
  }

  // Verificar si el endpoint está en la lista de exclusiones
  if (shouldExcludeFromCache(req.url)) {
    return next(req);
  }

  // Crear clave única para el caché (URL + query params)
  const cacheKey = req.urlWithParams;
  const cachedResponse = cache.get(cacheKey);
  const now = Date.now();

  // Si hay una respuesta cacheada y no ha expirado
  if (cachedResponse && (now - cachedResponse.timestamp) < CACHE_DURATION) {
    if (!environment.production) {
      console.log(`✅ Cache hit: ${req.url}`);
    }
    return of(cachedResponse.response.clone());
  }

  // Hacer la request y cachear la respuesta
  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        cache.set(cacheKey, {
          response: event.clone(),
          timestamp: now
        });
        if (!environment.production) {
          console.log(`💾 Cache miss (stored): ${req.url}`);
        }
      }
    })
  );
};

/**
 * Limpia todo el caché HTTP
 */
export function clearHttpCache(): void {
  cache.clear();
  if (!environment.production) {
    console.log('🗑️ HTTP Cache cleared');
  }
}

/**
 * Invalida el caché para un patrón de URL específico
 * @param urlPattern Patrón de URL a invalidar (puede ser parcial)
 */
export function invalidateCache(urlPattern: string): void {
  let invalidatedCount = 0;
  Array.from(cache.keys()).forEach(key => {
    if (key.includes(urlPattern)) {
      cache.delete(key);
      invalidatedCount++;
    }
  });
  if (!environment.production) {
    console.log(`🗑️ Invalidated ${invalidatedCount} cache entries for pattern: ${urlPattern}`);
  }
}

/**
 * Obtiene estadísticas del caché
 */
export function getCacheStats() {
  const now = Date.now();
  const entries = Array.from(cache.entries());
  const valid = entries.filter(([_, entry]) => (now - entry.timestamp) < CACHE_DURATION);
  const expired = entries.filter(([_, entry]) => (now - entry.timestamp) >= CACHE_DURATION);

  return {
    total: entries.length,
    valid: valid.length,
    expired: expired.length,
    size: cache.size
  };
}
