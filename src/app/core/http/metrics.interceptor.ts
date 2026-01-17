import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize, Observable } from 'rxjs';
import { environment } from 'environments/environment';

export interface RequestMetrics {
  url: string;
  method: string;
  duration: number;
  timestamp: number;
  status?: number;
  success: boolean;
}

const metrics: RequestMetrics[] = [];
const MAX_METRICS = 1000; // Limitar el tamaño del array de métricas

/**
 * Interceptor de métricas HTTP
 * Registra información sobre cada request para análisis de rendimiento
 */
export const metricsInterceptor = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  // Solo registrar métricas en desarrollo
  if (environment.production) {
    return next(req);
  }

  const startTime = performance.now();
  const method = req.method;
  const url = req.url;

  return next(req).pipe(
    finalize(() => {
      const duration = performance.now() - startTime;
      const metric: RequestMetrics = {
        url,
        method,
        duration,
        timestamp: Date.now(),
        success: true
      };

      // Intentar obtener el status code si es una respuesta HTTP
      // (esto se puede mejorar con un operador más específico)

      metrics.push(metric);

      // Limitar el tamaño del array
      if (metrics.length > MAX_METRICS) {
        metrics.shift(); // Remover el más antiguo
      }

      // Log requests lentas (> 1 segundo)
      if (duration > 1000) {
        console.warn(`⚠️ Request lenta detectada:`, {
          url,
          method,
          duration: `${duration.toFixed(2)}ms`
        });
      }
    })
  );
};

/**
 * Obtiene todas las métricas registradas
 */
export function getRequestMetrics(): RequestMetrics[] {
  return [...metrics];
}

/**
 * Obtiene estadísticas de las requests
 */
export function getRequestStats() {
  const recent = metrics.filter(m => 
    Date.now() - m.timestamp < 5 * 60 * 1000 // Últimos 5 minutos
  );

  if (recent.length === 0) {
    return {
      total: 0,
      average: 0,
      slowest: null,
      byMethod: {},
      slowRequests: []
    };
  }

  const durations = recent.map(m => m.duration);
  const average = durations.reduce((sum, d) => sum + d, 0) / durations.length;
  const slowest = recent.reduce((max, m) => 
    m.duration > max.duration ? m : max, 
    recent[0]
  );

  const byMethod = recent.reduce((acc, m) => {
    acc[m.method] = (acc[m.method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const slowRequests = recent
    .filter(m => m.duration > 1000)
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 10); // Top 10 más lentas

  return {
    total: recent.length,
    average: Math.round(average * 100) / 100,
    slowest,
    byMethod,
    slowRequests
  };
}

/**
 * Limpia todas las métricas
 */
export function clearMetrics(): void {
  metrics.length = 0;
  if (!environment.production) {
    console.log('🗑️ Metrics cleared');
  }
}

/**
 * Exporta las métricas a JSON
 */
export function exportMetricsToJson(): string {
  return JSON.stringify({
    metrics: getRequestMetrics(),
    stats: getRequestStats(),
    exportedAt: new Date().toISOString()
  }, null, 2);
}
