import { Routes } from '@angular/router';
import { PermissionGuard } from 'app/core/auth/guards/permission.guard';
import { PsavProgramGuard } from 'app/core/auth/guards/psav-program.guard';
import { SitesPsavComponent } from './sites-psav.component';
import { initialDataSitesPsavProgramAddResolver, initialDataSitesPsavProgramEditResolver } from './sites-psav.resolvers';
import { initialDataSiteCalendarResolver } from '../sites-pdam/sites.resolvers';
import { initialDataSitesCommonAddResolver, initialDataSitesCommonEditResolver } from 'app/shared/resolvers/sites-common.resolvers';

export default [
  {
    path: '',
    component: SitesPsavComponent,
    children: [
    //   {
    //     path: '',
    //     loadComponent: () => import('./list/list.component').then((c) => c.SitesPsavListComponent),
    //     canActivate: [PsavProgramGuard, PermissionGuard],
    //     data: { permission: 'site.view' },
    //     resolve: {
    //       data: initialDataSitesPsavListResolver,
    //     },
    //   },
      {
        path: 'add',
        loadComponent: () => import('./add/add.component').then((c) => c.AddSitePsavComponent),
        canActivate: [PsavProgramGuard, PermissionGuard],
        data: { permission: 'site.create' },
        resolve: {
          commonData: initialDataSitesCommonAddResolver,
          programData: initialDataSitesPsavProgramAddResolver,
        },
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./edit/edit.component').then((c) => c.EditSitePsavComponent),
        canActivate: [PsavProgramGuard, PermissionGuard],
        data: { permission: 'site.edit' },
        runGuardsResolvers: 'always',
        resolve: {
          commonData: initialDataSitesCommonEditResolver,
          programData: initialDataSitesPsavProgramEditResolver,
        },
      },
      {
        path: 'calendar/:id',
        loadComponent: () => import('../calendar/site-calendar/site-calendar.component').then((c) => c.SiteCalendarComponent),
        canActivate: [PsavProgramGuard, PermissionGuard],
        data: { permission: 'site.edit' },
        resolve: {
          data: initialDataSiteCalendarResolver,
        },
      },
    ],
  },
] as Routes;

