import { Routes } from '@angular/router';
import { AesanSponsorEvaluationComponent } from './sponsor-evaluation.component';
import { AesanSponsorEvaluationListComponent } from './list/list.component';
import { initialAesanSponsorEvaluationResolver, editAesanSponsorEvaluationResolver } from './sponsor-evaluation.resolvers';
import { ViewPDAMSponsorEvaluationComponent } from './view-pdam/view-pdam.component';
import { ViewPSAVSponsorEvaluationComponent } from './view-psav/view-psav.component';
import { ViewPACNASponsorEvaluationComponent } from './view-pacna/view-pacna.component';

export default [
  {
    path: '',
    component: AesanSponsorEvaluationComponent,
    children: [
      {
        path: '',
        component: AesanSponsorEvaluationListComponent,
        resolve: {
          data: initialAesanSponsorEvaluationResolver,
        },
      },
      {
        path: 'view-pdam/:id',
        component: ViewPDAMSponsorEvaluationComponent,
        resolve: {
          data: editAesanSponsorEvaluationResolver,
        },
      },
      {
        path: 'view-psav/:id',
        component: ViewPSAVSponsorEvaluationComponent,
        resolve: {
          data: editAesanSponsorEvaluationResolver,
        },
      },
      {
        path: 'view-pacna/:id',
        component: ViewPACNASponsorEvaluationComponent,
        resolve: {
          data: editAesanSponsorEvaluationResolver,
        },
      },
      {
        path: 'calendar/:id',
        loadComponent: () => import('../calendar/agency-calendar/agency-calendar.component').then(m => m.AgencyCalendarComponent),
      },
    ],
  },
] as Routes;
