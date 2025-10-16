import { Routes } from '@angular/router';
import { PermissionGuard } from 'app/core/auth/guards/permission.guard';
import { SchoolsComponent } from './schools.component';
import { initialDataSchoolsListResolver } from './schools.resolvers';

export default [
  {
    path: '',
    component: SchoolsComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./list/list.component').then((c) => c.ListComponent),
        canActivate: [PermissionGuard],
        data: { permission: 'school.view' },
        resolve: {
          data: initialDataSchoolsListResolver,
        },
      },
    ],
  },
] as Routes;
