import { Routes } from '@angular/router';
import { initialDataEmployeesListResolver, initialDataEmployeesAddResolver, initialDataEmployeesEditResolver } from './employees.resolvers';

export default [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () => import('./list/list.component').then(c => c.ListComponent),
        resolve: {
          data: initialDataEmployeesListResolver
        }
      },
      {
        path: 'add',
        loadComponent: () => import('./add/add.component').then(c => c.AddEmployeeComponent),
        resolve: {
          data: initialDataEmployeesAddResolver
        }
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./edit/edit.component').then(c => c.EditEmployeeComponent),
        resolve: {
          data: initialDataEmployeesEditResolver
        }
      }
    ]
  }
] as Routes;
