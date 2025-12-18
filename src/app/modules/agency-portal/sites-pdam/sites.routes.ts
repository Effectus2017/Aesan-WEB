import { Routes } from '@angular/router';
import { PermissionGuard } from 'app/core/auth/guards/permission.guard';
import { PdamProgramGuard } from 'app/core/auth/guards/pdam-program.guard';
import { SitesComponent } from './sites.component';
import { initialDataSitesEditResolver, initialDataSitesListResolver, initialDataSiteCalendarResolver } from './sites.resolvers';
import { initialDataSitesAddResolver } from './sites.resolvers';
export default [
  {
    path: '',
    component: SitesComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./list/list.component').then((c) => c.ListComponent),
        canActivate: [PdamProgramGuard, PermissionGuard],
        data: { permission: 'site.view' },
        resolve: {
          data: initialDataSitesListResolver,
        },
      },
      {
        path: 'add',
        loadComponent: () => import('./add/add.component').then((c) => c.AddSiteComponent),
        canActivate: [PdamProgramGuard, PermissionGuard],
        data: { permission: 'site.create' },
        resolve: {
          data: initialDataSitesAddResolver,
        },
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./edit/edit.component').then((c) => c.EditSiteComponent),
        canActivate: [PdamProgramGuard, PermissionGuard],
        data: { permission: 'site.edit' },
        resolve: {
          data: initialDataSitesEditResolver,
        },
      },
      {
        path: 'calendar/:id',
        loadComponent: () => import('../calendar/site-calendar/site-calendar.component').then((c) => c.SiteCalendarComponent),
        canActivate: [PdamProgramGuard, PermissionGuard],
        data: { permission: 'site.edit' },
        resolve: {
          data: initialDataSiteCalendarResolver,
        },
      },
    ],
  },
] as Routes;
