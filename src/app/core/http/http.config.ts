import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { EnvironmentProviders } from '@angular/core';
import { authInterceptor } from 'app/core/auth/auth.interceptor';
// Cache deshabilitado en todo el proyecto
// import { cacheInterceptor } from './cache.interceptor';
import { metricsInterceptor } from './metrics.interceptor';
import { fuseLoadingInterceptor } from '@fuse/services/loading';

/**
 * Configuración consolidada de HTTP Client con todos los interceptores
 * Orden de ejecución: auth → metrics → loading (cache deshabilitado)
 */
export function provideHttpClientWithInterceptors(): EnvironmentProviders {
  return provideHttpClient(
    withInterceptors([
      authInterceptor,        // 1. Agrega token de autenticación
      // cacheInterceptor,    // 2. Cache deshabilitado
      metricsInterceptor,    // 2. Registra métricas de rendimiento
      fuseLoadingInterceptor // 3. Maneja loading states
    ])
  );
}
