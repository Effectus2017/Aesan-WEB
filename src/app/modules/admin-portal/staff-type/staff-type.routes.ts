import { Routes } from '@angular/router';
import { initialDataStaffTypeListResolver, initialDataStaffTypeAddResolver, initialDataStaffTypeEditResolver } from './staff-type.resolvers';

export default [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () => import('./list/list.component').then(c => c.StaffTypeListComponent),
        resolve: {
          data: initialDataStaffTypeListResolver
        }
      },
      {
        path: 'add',
        loadComponent: () => import('./add/add.component').then(c => c.AddStaffTypeComponent),
        resolve: {
          data: initialDataStaffTypeAddResolver
        }
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./edit/edit.component').then(c => c.EditStaffTypeComponent),
        resolve: {
          data: initialDataStaffTypeEditResolver
        }
      }
    ]
  }
] as Routes;
