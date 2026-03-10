import { Routes } from '@angular/router';
import { PermissionGuard } from 'app/core/auth/guards/permission.guard';
import { PacnaProgramGuard } from 'app/core/auth/guards/pacna-program.guard';
import { SitesPacnaComponent } from './sites-pacna.component';
import { initialDataSitesPacnaListResolver, initialDataSitesPacnaProgramAddResolver, initialDataSitesPacnaProgramEditResolver } from './sites-pacna.resolvers';
import { initialDataSiteCalendarResolver, initialDataSitesAddSchoolResolver } from '../sites-pdam/sites.resolvers';
import { initialDataSitesCommonAddResolver, initialDataSitesCommonEditResolver } from 'app/shared/resolvers/sites-common.resolvers';
import { initialDataSitesPacnaCenterAddResolver, initialDataSitesPacnaCenterEditResolver } from './sites-pacna.resolvers';

export default [
  {
    path: '',
    component: SitesPacnaComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./list/list.component').then((c) => c.SitesPacnaListComponent),
        canActivate: [PacnaProgramGuard, PermissionGuard],
        data: { permission: 'site.view' },
        resolve: {
          data: initialDataSitesPacnaListResolver,
        },
      },
      // Rutas para Hogares (Day Care Home)
      {
        path: 'homes/add',
        loadComponent: () => import('./add-sites-home/add.component').then((c) => c.AddSitePacnaHomeComponent),
        canActivate: [PacnaProgramGuard, PermissionGuard],
        data: { permission: 'site.create' },
        resolve: {
          commonData: initialDataSitesCommonAddResolver,
          programData: initialDataSitesPacnaProgramAddResolver,
          schoolData: initialDataSitesAddSchoolResolver,
        },
      },
      // Rutas para Centros (Centers)
      {
        path: 'centers/add',
        loadComponent: () => import('./add-sites-center/add.component').then((c) => c.AddSitePacnaCenterComponent),
        canActivate: [PacnaProgramGuard, PermissionGuard],
        data: { permission: 'site.create' },
        resolve: {
          commonData: initialDataSitesPacnaCenterAddResolver,
          programData: initialDataSitesPacnaProgramAddResolver,
          schoolData: initialDataSitesAddSchoolResolver,
        },
      },
      {
        path: 'centers/edit/:id',
        loadComponent: () => import('./edit-sites-center/edit.component').then((c) => c.EditSitePacnaCenterComponent),
        canActivate: [PacnaProgramGuard, PermissionGuard],
        data: { permission: 'site.edit' },
        runGuardsResolvers: 'always',
        resolve: {
          commonData: initialDataSitesPacnaCenterEditResolver,
          programData: initialDataSitesPacnaProgramEditResolver,
        },
      },
      // Rutas legacy (mantener temporalmente para compatibilidad)
      {
        path: 'homes/add',
        loadComponent: () => import('./add-sites-home/add.component').then((c) => c.AddSitePacnaHomeComponent),
        canActivate: [PacnaProgramGuard, PermissionGuard],
        data: { permission: 'site.create' },
        resolve: {
          commonData: initialDataSitesCommonAddResolver,
          programData: initialDataSitesPacnaProgramAddResolver,
          schoolData: initialDataSitesAddSchoolResolver,
        },
      },
      {
        path: 'homes/edit/:id',
        loadComponent: () => import('./edit-sites-home/edit.component').then((c) => c.EditSitePacnaHomeComponent),
        canActivate: [PacnaProgramGuard, PermissionGuard],
        data: { permission: 'site.edit' },
        runGuardsResolvers: 'always',
        resolve: {
          commonData: initialDataSitesCommonEditResolver,
          programData: initialDataSitesPacnaProgramEditResolver,
        },
      },
      {
        path: 'calendar/:id',
        loadComponent: () => import('../calendar/site-calendar/site-calendar.component').then((c) => c.SiteCalendarComponent),
        canActivate: [PacnaProgramGuard, PermissionGuard],
        data: { permission: 'site.edit' },
        resolve: {
          data: initialDataSiteCalendarResolver,
        },
      },
    ],
  },
] as Routes;
