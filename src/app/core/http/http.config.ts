import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { EnvironmentProviders } from '@angular/core';
import { authInterceptor } from 'app/core/auth/auth.interceptor';
import { cacheInterceptor } from './cache.interceptor';
import { metricsInterceptor } from './metrics.interceptor';
import { fuseLoadingInterceptor } from '@fuse/services/loading';

/**
 * Configuración consolidada de HTTP Client con todos los interceptores
 * Orden de ejecución: auth → cache → metrics → loading
 */
export function provideHttpClientWithInterceptors(): EnvironmentProviders {
  return provideHttpClient(
    withInterceptors([
      authInterceptor,        // 1. Agrega token de autenticación
      cacheInterceptor,       // 2. Cachea requests GET
      metricsInterceptor,    // 3. Registra métricas de rendimiento
      fuseLoadingInterceptor // 4. Maneja loading states
    ])
  );
}
