import { Routes } from '@angular/router';
import { AesanSponsorEvaluationComponent } from './sponsor-evaluation.component';
import {
  initialAesanSponsorEvaluationResolver,
  editAesanSponsorEvaluationResolver,
  visitCalendarPageResolver,
} from './sponsor-evaluation.resolvers';

export default [
  {
    path: '',
    component: AesanSponsorEvaluationComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./list/list.component').then((m) => m.AesanSponsorEvaluationListComponent),
        resolve: {
          data: initialAesanSponsorEvaluationResolver,
        },
      },
      {
        path: 'view-pdam/:id',
        loadComponent: () => import('./view-pdam/view-pdam.component').then((m) => m.ViewPDAMSponsorEvaluationComponent),
        resolve: {
          data: editAesanSponsorEvaluationResolver,
        },
      },
      {
        path: 'view-psav/:id',
        loadComponent: () => import('./view-psav/view-psav.component').then((m) => m.ViewPSAVSponsorEvaluationComponent),
        resolve: {
          data: editAesanSponsorEvaluationResolver,
        },
      },
      {
        path: 'view-pacna/:id',
        loadComponent: () => import('./view-pacna/view-pacna.component').then((m) => m.ViewPACNASponsorEvaluationComponent),
        resolve: {
          data: editAesanSponsorEvaluationResolver,
        },
      },
      {
        path: 'visit-calendar/:siteId',
        loadComponent: () => import('../calendar/agency-calendar/agency-calendar.component').then(m => m.AgencyCalendarComponent),
        resolve: {
          data: visitCalendarPageResolver,
        },
      },
    ],
  },
] as Routes;
