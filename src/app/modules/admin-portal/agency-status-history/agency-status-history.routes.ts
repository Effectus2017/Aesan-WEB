import { Routes } from '@angular/router';
import { AgencyStatusHistoryComponent } from './agency-status-history.component';
import { initialDataAgencyStatusHistoryListResolver } from './agency-status-history.resolvers';

export default [
  {
    path: '',
    component: AgencyStatusHistoryComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./list/list.component').then((c) => c.AgencyStatusHistoryListComponent),
        resolve: {
          data: initialDataAgencyStatusHistoryListResolver,
        },
      },
    ],
  },
] as Routes;
