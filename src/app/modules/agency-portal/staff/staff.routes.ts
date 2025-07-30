import { Routes } from '@angular/router';
import { initialDataStaffListResolver, initialDataStaffAddResolver, initialDataStaffEditResolver } from './staff.resolvers';

export default [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () => import('./list/list.component').then(c => c.ListComponent),
        resolve: {
          data: initialDataStaffListResolver
        }
      },
      {
        path: 'add',
        loadComponent: () => import('./add/add.component').then(c => c.AddStaffComponent),
        resolve: {
          data: initialDataStaffAddResolver
        }
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./edit/edit.component').then(c => c.EditStaffComponent),
        resolve: {
          data: initialDataStaffEditResolver
        }
      }
    ]
  }
] as Routes;
