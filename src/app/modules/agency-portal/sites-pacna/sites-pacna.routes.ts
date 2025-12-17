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
            // Rutas para Hogares (Day Care Home)
            {
              path: 'homes/add',
              loadComponent: () => import('./add-sites-home/add.component').then((c) => c.AddSitePacnaHomeComponent),
              canActivate: [PermissionGuard],
              data: { permission: 'site.create' },
              resolve: {
                data: initialDataSitesPacnaAddResolver,
              },
            },
            // {
            //   path: 'homes/edit/:id',
            //   loadComponent: () => import('./homes/edit/edit.component').then((c) => c.EditSitePacnaHomeComponent),
            //   canActivate: [PermissionGuard],
            //   data: { permission: 'site.edit' },
            //   resolve: {
            //     data: initialDataSitesPacnaEditResolver,
            //   },
            // },
            // Rutas para Centros (Centers)
            {
              path: 'centers/add',
              loadComponent: () => import('./add-sites-center/add.component').then((c) => c.AddSitePacnaCenterComponent),
              canActivate: [PermissionGuard],
              data: { permission: 'site.create' },
              resolve: {
                data: initialDataSitesPacnaAddResolver,
              },
            },
            {
              path: 'centers/edit/:id',
              loadComponent: () => import('./edit-sites-center/edit.component').then((c) => c.EditSitePacnaCenterComponent),
              canActivate: [PermissionGuard],
              data: { permission: 'site.edit' },
              resolve: {
                data: initialDataSitesPacnaEditResolver,
              },
            },
            // Rutas legacy (mantener temporalmente para compatibilidad)
            {
              path: 'homes/add',
              loadComponent: () => import('./add-sites-home/add.component').then((c) => c.AddSitePacnaHomeComponent),
              canActivate: [PermissionGuard],
              data: { permission: 'site.create' },
              resolve: {
                data: initialDataSitesPacnaAddResolver,
              },
            },
            {
              path: 'homes/edit/:id',
              loadComponent: () => import('./edit-sites-home/edit.component').then((c) => c.EditSitePacnaHomeComponent),
              canActivate: [PermissionGuard],
              data: { permission: 'site.edit' },
              resolve: {
                data: initialDataSitesPacnaEditResolver,
              },
            },
      {
        path: 'calendar/:id',
        loadComponent: () => import('../calendar/site-calendar/site-calendar.component').then((c) => c.SiteCalendarComponent),
        canActivate: [PermissionGuard],
        data: { permission: 'site.edit' },
        resolve: {
          data: initialDataSiteCalendarResolver,
        },
      },
    ],
  },
] as Routes;

