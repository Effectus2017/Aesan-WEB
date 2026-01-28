import { Injectable, inject } from '@angular/core';
import { environment } from 'environments/environment';
import { getRequestMetrics, getRequestStats, clearMetrics, exportMetricsToJson, RequestMetrics } from 'app/core/http/metrics.interceptor';

@Injectable({
  providedIn: 'root',
})
export class MetricsService {
  /**
   * Obtiene todas las métricas de requests registradas
   */
  getMetrics(): RequestMetrics[] {
    if (environment.production) {
      return [];
    }
    return getRequestMetrics();
  }

  /**
   * Obtiene estadísticas de las requests
   */
  getStats() {
    if (environment.production) {
      return {
        total: 0,
        average: 0,
        slowest: null,
        byMethod: {},
        slowRequests: []
      };
    }
    return getRequestStats();
  }

  /**
   * Limpia todas las métricas
   */
  clear(): void {
    if (!environment.production) {
      clearMetrics();
    }
  }

  /**
   * Exporta las métricas a JSON
   */
  exportToJson(): string {
    if (environment.production) {
      return JSON.stringify({ message: 'Metrics not available in production' });
    }
    return exportMetricsToJson();
  }

  /**
   * Muestra un dashboard simple en consola
   */
  showDashboard(): void {
    if (environment.production) {
      console.log('Metrics dashboard not available in production');
      return;
    }

    const stats = this.getStats();
    const metrics = this.getMetrics();

    console.group('📊 HTTP Request Metrics Dashboard');
    console.log(`Total requests (last 5 min): ${stats.total}`);
    console.log(`Average duration: ${stats.average}ms`);
    
    if (stats.slowest) {
      console.log(`Slowest request: ${stats.slowest.duration.toFixed(2)}ms - ${stats.slowest.method} ${stats.slowest.url}`);
    }

    console.log('\nRequests by method:');
    Object.entries(stats.byMethod).forEach(([method, count]) => {
      console.log(`  ${method}: ${count}`);
    });

    if (stats.slowRequests.length > 0) {
      console.log('\n⚠️ Slow requests (>1s):');
      stats.slowRequests.forEach(req => {
        console.log(`  ${req.duration.toFixed(2)}ms - ${req.method} ${req.url}`);
      });
    }

    console.log(`\nTotal metrics stored: ${metrics.length}`);
    console.groupEnd();
  }
}
