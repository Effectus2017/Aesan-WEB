import { Routes } from '@angular/router';
import { UsersComponent } from './users.component';
import { UsersListComponent } from './list/list.component';
import { UsersAddComponent } from './add/add.component';
import { AddUsersResolver, EditUsersResolver, RolesListsResolver, UsersListsResolver } from './users.resolvers';
import { UsersEditComponent } from './edit/edit.component';
import { RolesListComponent } from './list-roles/list.component';

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
          data: AddUsersResolver,
        },
      },
      {
        path: 'edit/:id',
        component: UsersEditComponent,
        resolve: {
          data: EditUsersResolver,
        },
      },
      {
        path: 'roles',
        component: RolesListComponent,
        resolve: {
          data: RolesListsResolver,
        },
      },
    ],
  },
] as Routes;
