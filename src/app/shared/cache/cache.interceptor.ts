import {
    HttpEvent,
    HttpHandlerFn,
    HttpRequest,
    HttpResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CacheService } from './cache.service';
import { CacheConfig } from './cache.config';

const CACHEABLE_METHODS = ['GET'];

export function cacheInterceptor(
    request: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
    const cacheService = inject(CacheService);

    // Solo cachear peticiones GET
    if (!CACHEABLE_METHODS.includes(request.method)) {
        return next(request);
    }

    // No cachear si el header indica no-cache
    if (request.headers.get('Cache-Control') === CacheConfig.CACHE_CONTROL.NO_CACHE) {
        return next(request);
    }

    const cachedResponse = cacheService.get<HttpResponse<unknown>>(request.url);
    if (cachedResponse) {
        return of(cachedResponse);
    }

    return next(request).pipe(
        tap((event) => {
            if (event instanceof HttpResponse) {
                cacheService.set(
                    request.url,
                    event,
                    getTTLForUrl(request.url)
                );
            }
        }),
        catchError((error) => {
            console.error('Error en la petición HTTP:', error);
            return throwError(() => error);
        })
    );
}

/**
 * Determina el tiempo de vida del caché según la URL
 */
function getTTLForUrl(url: string): number {
    // TTL específico para agencias
    if (url.includes('/get-agency-by-id') ||
        url.includes('/get-all-agencies-from-db')) {
        return CacheConfig.TTL.AGENCY;
    }

    // Datos que cambian poco frecuentemente
    if (url.includes('/regions') ||
        url.includes('/cities') ||
        url.includes('/education-levels')) {
        return CacheConfig.TTL.VERY_LONG;
    }

    // Datos que cambian con frecuencia media
    if (url.includes('/programs')) {
        return CacheConfig.TTL.MEDIUM;
    }

    // Por defecto, caché corto
    return CacheConfig.TTL.SHORT;
}
