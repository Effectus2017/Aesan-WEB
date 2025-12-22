import { Routes } from '@angular/router';
import { PermissionGuard } from 'app/core/auth/guards/permission.guard';
import { PdamProgramGuard } from 'app/core/auth/guards/pdam-program.guard';
import { SitesComponent } from './sites.component';
import { initialDataSiteCalendarResolver, initialDataSitesPdamProgramResolver } from './sites.resolvers';
import { initialDataSitesCommonAddResolver, initialDataSitesCommonEditResolver } from 'app/shared/resolvers/sites-common.resolvers';


export default [
  {
    path: '',
    component: SitesComponent,
    children: [
      {
        path: 'add',
        loadComponent: () => import('./add/add.component').then((c) => c.AddSiteComponent),
        canActivate: [PdamProgramGuard, PermissionGuard],
        data: { permission: 'site.create' },
        resolve: {
          commonData: initialDataSitesCommonAddResolver,
          programData: initialDataSitesPdamProgramResolver,
        },
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./edit/edit.component').then((c) => c.EditSiteComponent),
        canActivate: [PdamProgramGuard, PermissionGuard],
        data: { permission: 'site.edit' },
        resolve: {
          commonData: initialDataSitesCommonEditResolver,
          programData: initialDataSitesPdamProgramResolver,
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
