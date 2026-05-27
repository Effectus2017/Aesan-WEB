import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { map } from 'rxjs/operators';
import { TranslocoBundleId } from './transloco-bundle.config';
import { TranslocoBundleLoaderService } from './transloco-bundle-loader.service';

/**
 * Activa la carga del bundle de traducciones antes de renderizar rutas del área correspondiente.
 */
export function translocoBundleGuard(bundleId: TranslocoBundleId): CanActivateFn {
  return () =>
    inject(TranslocoBundleLoaderService)
      .ensureBundle(bundleId)
      .pipe(map(() => true));
}
