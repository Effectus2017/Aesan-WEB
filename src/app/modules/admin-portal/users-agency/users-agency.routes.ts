import { Routes } from '@angular/router';
import { UsersAgencyComponent } from './users-agency.component';
import { UsersAgencyListComponent } from './list/list.component';
import { UsersAgencyAddComponent } from './add/add.component';
import { usersAgencyListResolver, usersAgencyAddResolver } from './users-agency.resolvers';
import { UsersAgencyEditComponent } from './edit/edit.component';
import { initialEditUsersResolver } from '../users/users.resolvers';

export default [
  {
    path: '',
    component: UsersAgencyComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: UsersAgencyListComponent,
        resolve: {
          data: usersAgencyListResolver,
        },
      },
      {
        path: 'add',
        component: UsersAgencyAddComponent,
        resolve: {
          data: usersAgencyAddResolver,
        },
      },
      {
        path: 'edit/:id',
        component: UsersAgencyEditComponent,
        resolve: {
          data: initialEditUsersResolver,
        },
        runGuardsAndResolvers: 'always',
      },
    ],
  },
] as Routes;
