import { Routes } from '@angular/router';
import { AesanSponsorEvaluationComponent } from './sponsor-evaluation.component';
import { AesanSponsorEvaluationListComponent } from './list/list.component';
import { initialAesanSponsorEvaluationResolver, editAesanSponsorEvaluationResolver } from './sponsor-evaluation.resolvers';
import { EditPDAMSponsorEvaluationComponent } from './edit-pdam/edit-pdam.component';
import { EditPSAVSponsorEvaluationComponent } from './edit-psav/edit-psav.component';
import { EditPACNASponsorEvaluationComponent } from './edit-pacna/edit-pacna.component';

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
        path: 'edit-pdam/:id',
        component: EditPDAMSponsorEvaluationComponent,
        resolve: {
          data: editAesanSponsorEvaluationResolver,
        },
      },
      {
        path: 'edit-psav/:id',
        component: EditPSAVSponsorEvaluationComponent,
        resolve: {
          data: editAesanSponsorEvaluationResolver,
        },
      },
      {
        path: 'edit-pacna/:id',
        component: EditPACNASponsorEvaluationComponent,
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
