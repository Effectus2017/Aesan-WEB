import { Routes } from '@angular/router';
import { PermissionGuard } from 'app/core/auth/guards/permission.guard';
import { SchoolsComponent } from './schools.component';
import { initialDataSchoolsEditResolver, initialDataSchoolsListResolver } from './schools.resolvers';
import { initialDataSchoolsAddResolver } from './schools.resolvers';
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
      {
        path: 'add',
        loadComponent: () => import('./add/add.component').then((c) => c.AddSchoolComponent),
        canActivate: [PermissionGuard],
        data: { permission: 'school.create' },
        resolve: {
          data: initialDataSchoolsAddResolver,
        },
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./edit/edit.component').then((c) => c.EditSchoolComponent),
        canActivate: [PermissionGuard],
        data: { permission: 'school.edit' },
        resolve: {
          data: initialDataSchoolsEditResolver,
        },
      },
      {
        path: 'calendar/:id',
        loadComponent: () => import('./school-calendar/school-calendar.component').then((c) => c.SchoolCalendarComponent),
        canActivate: [PermissionGuard],
        data: { permission: 'school.edit' },
      },
    ],
  },
] as Routes;
