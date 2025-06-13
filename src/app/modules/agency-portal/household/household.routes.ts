import { Routes } from '@angular/router';
import { HouseholdComponent } from './household.component';
import { initialDataHouseholdListResolver, initialDataHouseholdEditResolver } from './household.resolvers';

export default [
  {
    path: '',
    component: HouseholdComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./list/list.component').then((c) => c.HouseholdListComponent),
        resolve: {
          data: initialDataHouseholdListResolver,
        },
      },
      {
        path: 'add',
        loadComponent: () => import('./add/add.component').then((c) => c.HouseholdAddComponent),
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./edit/edit.component').then((c) => c.HouseholdEditComponent),
        resolve: {
          data: initialDataHouseholdEditResolver,
        },
      },
    ],
  },
] as Routes;
