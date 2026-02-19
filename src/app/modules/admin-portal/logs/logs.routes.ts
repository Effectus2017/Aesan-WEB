import { Routes } from '@angular/router';
import { LogsComponent } from './logs.component';
import { LogsListComponent } from './list/list.component';

export default [
  {
    path: '',
    component: LogsComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: LogsListComponent,
      },
    ],
  },
] as Routes;
