import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { forkJoin } from 'rxjs';


export const initialDataAdminDashboardResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  return forkJoin([]);
};
