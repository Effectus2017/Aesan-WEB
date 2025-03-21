import { Routes } from '@angular/router';
import { UsersComponent } from './users.component';
import { UsersListComponent } from './list/list.component';
import { UsersAddComponent } from './add/add.component';
import { initialAddUsersResolver, initialAgenciesUsersListResolver, initialEditUsersResolver, initialRolesResolver, UsersListsResolver } from './users.resolvers';
import { UsersEditComponent } from './edit/edit.component';
import { RolesListComponent } from './list-roles/list.component';
import { AgenciesUsersListComponent } from './list-agencies/list.component';

export default [
  {
    path: '',
    component: UsersComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: UsersListComponent,
        resolve: {
          data: UsersListsResolver,
        },
      },
      {
        path: 'add',
        component: UsersAddComponent,
        resolve: {
          data: initialAddUsersResolver,
        },
      },
      {
        path: 'edit/:id',
        component: UsersEditComponent,
        resolve: {
          data: initialEditUsersResolver,
        },
      },
      {
        path: 'roles',
        component: RolesListComponent,
        resolve: {
          data: initialRolesResolver,
        },
      },
      {
        path: 'agencies',
        component: AgenciesUsersListComponent,
        resolve: {
          data: initialAgenciesUsersListResolver,
        },
      },
    ],
  },
] as Routes;
