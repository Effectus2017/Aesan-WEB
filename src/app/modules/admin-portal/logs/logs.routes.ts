import { Routes } from '@angular/router';
import { LogsComponent } from './logs.component';
import { initialDataLogsListResolver } from './logs.resolvers';

export default [
  {
    path: '',
    component: LogsComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./list/list.component').then((c) => c.LogsListComponent),
        resolve: {
          data: initialDataLogsListResolver,
        },
      },
    ],
  },
] as Routes;
