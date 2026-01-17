import { getRequestMetrics, getRequestStats, RequestMetrics } from 'app/core/http/metrics.interceptor';
import { getCacheStats } from 'app/core/http/cache.interceptor';
import { environment } from 'environments/environment';

/**
 * Analiza las requests de red usando Performance API
 * Útil para usar en la consola del navegador
 */
export function analyzeNetworkRequests(): any[] {
  if (environment.production) {
    console.warn('Performance analysis not available in production');
    return [];
  }

  const entries = performance.getEntriesByType('resource')
    .filter((e: any) => e.name.includes('/api/'))
    .map((e: any) => ({
      url: e.name,
      duration: Math.round(e.duration * 100) / 100,
      size: e.transferSize || 0,
      type: e.initiatorType,
      startTime: Math.round(e.startTime * 100) / 100
    }))
    .sort((a, b) => b.duration - a.duration);

  console.group('🌐 Network Requests Analysis');
  console.log(`Total API requests: ${entries.length}`);
  console.log(`Total time: ${entries.reduce((sum, e) => sum + e.duration, 0).toFixed(2)}ms`);
  console.log(`Average: ${(entries.reduce((sum, e) => sum + e.duration, 0) / entries.length || 0).toFixed(2)}ms`);
  console.log(`Total size: ${(entries.reduce((sum, e) => sum + e.size, 0) / 1024).toFixed(2)}KB`);
  console.table(entries);
  console.groupEnd();

  return entries;
}

/**
 * Identifica requests duplicadas
 */
export function findDuplicateRequests(): void {
  if (environment.production) {
    console.warn('Duplicate analysis not available in production');
    return;
  }

  const metrics = getRequestMetrics();
  const urlCounts = new Map<string, number>();

  metrics.forEach(metric => {
    const count = urlCounts.get(metric.url) || 0;
    urlCounts.set(metric.url, count + 1);
  });

  const duplicates = Array.from(urlCounts.entries())
    .filter(([_, count]) => count > 1)
    .sort((a, b) => b[1] - a[1]);

  if (duplicates.length === 0) {
    console.log('✅ No duplicate requests found');
    return;
  }

  console.group('🔄 Duplicate Requests');
  duplicates.forEach(([url, count]) => {
    console.log(`${url}: ${count} times`);
  });
  console.groupEnd();
}

/**
 * Analiza el rendimiento completo del sistema
 */
export function analyzePerformance(): void {
  if (environment.production) {
    console.warn('Performance analysis not available in production');
    return;
  }

  console.group('📈 Complete Performance Analysis');

  // Métricas de requests HTTP
  const stats = getRequestStats();
  console.log('\n📊 HTTP Request Stats:');
  console.log(`  Total: ${stats.total}`);
  console.log(`  Average: ${stats.average}ms`);
  if (stats.slowest) {
    console.log(`  Slowest: ${stats.slowest.duration.toFixed(2)}ms`);
  }

  // Estadísticas de caché
  const cacheStats = getCacheStats();
  console.log('\n💾 Cache Stats:');
  console.log(`  Total entries: ${cacheStats.total}`);
  console.log(`  Valid entries: ${cacheStats.valid}`);
  console.log(`  Expired entries: ${cacheStats.expired}`);

  // Análisis de red
  console.log('\n🌐 Network Analysis:');
  analyzeNetworkRequests();

  // Requests duplicadas
  console.log('\n🔄 Duplicate Analysis:');
  findDuplicateRequests();

  console.groupEnd();
}

/**
 * Exporta un reporte completo de rendimiento
 */
export function exportPerformanceReport(): string {
  if (environment.production) {
    return JSON.stringify({ message: 'Performance report not available in production' });
  }

  const stats = getRequestStats();
  const cacheStats = getCacheStats();
  const networkEntries = performance.getEntriesByType('resource')
    .filter((e: any) => e.name.includes('/api/'))
    .map((e: any) => ({
      url: e.name,
      duration: e.duration,
      size: e.transferSize || 0,
      type: e.initiatorType
    }));

  return JSON.stringify({
    timestamp: new Date().toISOString(),
    httpStats: stats,
    cacheStats,
    networkRequests: networkEntries,
    exportedAt: new Date().toISOString()
  }, null, 2);
}

// Hacer las funciones disponibles globalmente en desarrollo
if (!environment.production && typeof window !== 'undefined') {
  (window as any).analyzeNetworkRequests = analyzeNetworkRequests;
  (window as any).findDuplicateRequests = findDuplicateRequests;
  (window as any).analyzePerformance = analyzePerformance;
  (window as any).exportPerformanceReport = exportPerformanceReport;
  
  console.log('🔧 Performance analysis tools available:');
  console.log('  - analyzeNetworkRequests()');
  console.log('  - findDuplicateRequests()');
  console.log('  - analyzePerformance()');
  console.log('  - exportPerformanceReport()');
}
