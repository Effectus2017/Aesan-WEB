import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { of } from 'rxjs';

// Resolver placeholder para el módulo de programas (no usado actualmente en rutas)
// Resolver placeholder for programs module (not currently used in routes)
export const initialDataProgramsListResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  return of({});
};
