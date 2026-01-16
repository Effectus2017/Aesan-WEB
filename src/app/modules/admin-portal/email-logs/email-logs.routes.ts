import { Routes } from '@angular/router';
import { EmailLogsComponent } from './email-logs.component';
import { EmailLogsListComponent } from './list/list.component';
import { initialDataEmailLogsListResolver } from './email-logs.resolvers';

export default [
  {
    path: '',
    component: EmailLogsComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: EmailLogsListComponent,
        resolve: {
          data: initialDataEmailLogsListResolver,
        },
      },
    ],
  },
] as Routes;
