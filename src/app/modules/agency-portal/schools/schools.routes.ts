import { Routes } from '@angular/router';
import { SchoolsComponent } from './schools.component';
import { initialDataSchoolsListResolver } from './schools.resolvers';
import { initialDataSchoolsAddResolver } from './schools.resolvers';
export default [
  {
    path: '',
    component: SchoolsComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./list/list.component').then((c) => c.ListComponent),
        resolve: {
          data: initialDataSchoolsListResolver,
        },
      },
      {
        path: 'add',
        loadComponent: () => import('./add/add.component').then((c) => c.AddSchoolComponent),
        resolve: {
          data: initialDataSchoolsAddResolver,
        },
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./edit/edit.component').then((c) => c.EditSchoolComponent),
      },
    ],
  },
] as Routes;
