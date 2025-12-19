import { Routes } from '@angular/router';
import { PermissionGuard } from 'app/core/auth/guards/permission.guard';
import { PacnaProgramGuard } from 'app/core/auth/guards/pacna-program.guard';
import { CentersComponent } from './centers.component';
import { initialDataCentersListResolver } from './centers.resolvers';

export default [
  {
    path: '',
    component: CentersComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./list/list.component').then((c) => c.ListCentersComponent),
        canActivate: [PacnaProgramGuard, PermissionGuard],
        data: { permission: 'school.view' },
        resolve: {
          data: initialDataCentersListResolver,
        },
      },
    ],
  },
] as Routes;

