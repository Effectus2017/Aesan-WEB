import { Routes } from '@angular/router';
import { PermissionGuard } from 'app/core/auth/guards/permission.guard';
import { PdamProgramGuard } from 'app/core/auth/guards/pdam-program.guard';
import { SitesComponent } from './sites.component';
import { initialDataSiteCalendarResolver, initialDataSitesPdamProgramResolver, schoolForAddSiteResolver } from './sites.resolvers';
import { initialDataSitesCommonAddResolver, initialDataSitesCommonEditResolver } from 'app/shared/resolvers/sites-common.resolvers';


export default [
  {
    path: '',
    component: SitesComponent,
    children: [
      {
        path: 'add',
        loadComponent: () => import('./add/add.component').then((c) => c.AddSitePdamComponent),
        canActivate: [PdamProgramGuard, PermissionGuard],
        data: { permission: 'site.create' },
        resolve: {
          commonData: initialDataSitesCommonAddResolver,
          programData: initialDataSitesPdamProgramResolver,
          schoolData: schoolForAddSiteResolver,
        },
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./edit/edit.component').then((c) => c.EditSitePdamComponent),
        canActivate: [PdamProgramGuard, PermissionGuard],
        data: { permission: 'site.edit' },
        runGuardsResolvers: 'always',
        resolve: {
          commonData: initialDataSitesCommonEditResolver,
          programData: initialDataSitesPdamProgramResolver,
        },
      },
      {
        path: 'calendar/:id',
        loadComponent: () => import('../calendar/site-calendar/site-calendar.component').then((c) => c.SiteCalendarComponent),
        canActivate: [PdamProgramGuard, PermissionGuard],
        data: { permission: 'site.view' },
        resolve: {
          data: initialDataSiteCalendarResolver,
        },
      },
    ],
  },
] as Routes;
