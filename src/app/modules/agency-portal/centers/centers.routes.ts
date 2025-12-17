import { Routes } from '@angular/router';
import { PermissionGuard } from 'app/core/auth/guards/permission.guard';
import { CentersComponent } from './centers.component';
import { initialDataCentersListResolver } from './centers.resolvers';

export default [
  {
    path: '',
    component: CentersComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./list/list.component').then((c) => c.ListComponent),
        canActivate: [PermissionGuard],
        data: { permission: 'school.view' },
        resolve: {
          data: initialDataCentersListResolver,
        },
      },
    ],
  },
] as Routes;

