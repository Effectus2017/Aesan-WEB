import { Routes } from '@angular/router';
import { HouseholdComponent } from './household.component';
import { initialDataHouseholdListResolver, initialDataHouseholdEditResolver } from './household.resolvers';

export default [
  {
    path: '',
    component: HouseholdComponent,
    children: [
      {
        path: 'list',
        loadComponent: () => import('./list/list.component').then((c) => c.ListComponent),
        resolve: {
          data: initialDataHouseholdListResolver,
        },
      },
      {
        path: 'add',
        loadComponent: () => import('./add/add.component').then((c) => c.AddComponent),
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./edit/edit.component').then((c) => c.EditComponent),
        resolve: {
          data: initialDataHouseholdEditResolver,
        },
      },
    ],
  },
] as Routes;
