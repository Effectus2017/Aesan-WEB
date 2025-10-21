import { Routes } from '@angular/router';
import { AesanSponsorEvaluationComponent } from './sponsor-evaluation.component';
import { AesanSponsorEvaluationListComponent } from './list/list.component';
import { initialAesanSponsorEvaluationResolver, editAesanSponsorEvaluationResolver } from './sponsor-evaluation.resolvers';
import { EditAesanSponsorEvaluationComponent } from './edit/edit.component';

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
        path: 'edit/:id',
        component: EditAesanSponsorEvaluationComponent,
        resolve: {
          data: editAesanSponsorEvaluationResolver,
        },
      },
    ],
  },
] as Routes;
