import { Routes } from '@angular/router';
import { UsersComponent } from './users.component';
import { initialProfileUsersResolver } from './users.resolvers';
import { UsersEditComponent } from './edit/edit.component';

export default [
  {
    path: '',
    component: UsersComponent,
    children: [
      {
        path: 'profile',
        component: UsersEditComponent,
        resolve: {
          data: initialProfileUsersResolver,
        },
        runGuardsAndResolvers: 'always',
      },
    ],
  },
] as Routes;

