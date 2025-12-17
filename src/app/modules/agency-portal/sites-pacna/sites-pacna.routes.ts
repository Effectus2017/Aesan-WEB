import { Routes } from '@angular/router';
import { PermissionGuard } from 'app/core/auth/guards/permission.guard';
import { SitesPacnaComponent } from './sites-pacna.component';
import { initialDataSitesPacnaEditResolver, initialDataSitesPacnaAddResolver, initialDataSitesPacnaListResolver } from './sites-pacna.resolvers';
import { initialDataSiteCalendarResolver } from '../sites/sites.resolvers';

export default [
  {
    path: '',
    component: SitesPacnaComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./list/list.component').then((c) => c.SitesPacnaListComponent),
        canActivate: [PermissionGuard],
        data: { permission: 'site.view' },
        resolve: {
          data: initialDataSitesPacnaListResolver,
        },
      },
      {
        path: 'add',
        loadComponent: () => import('./add/add.component').then((c) => c.AddSitePacnaComponent),
        canActivate: [PermissionGuard],
        data: { permission: 'site.create' },
        resolve: {
          data: initialDataSitesPacnaAddResolver,
        },
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./edit/edit.component').then((c) => c.EditSitePacnaComponent),
        canActivate: [PermissionGuard],
        data: { permission: 'site.edit' },
        resolve: {
          data: initialDataSitesPacnaEditResolver,
        },
      },
      {
        path: 'calendar/:id',
        loadComponent: () => import('../sites/site-calendar/site-calendar.component').then((c) => c.SiteCalendarComponent),
        canActivate: [PermissionGuard],
        data: { permission: 'site.edit' },
        resolve: {
          data: initialDataSiteCalendarResolver,
        },
      },
    ],
  },
] as Routes;

