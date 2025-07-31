import { Routes } from '@angular/router';
import { initialDataStaffAddResolver, initialDataStaffEditResolver, initialDataStaffEmployeesListResolver, initialDataStaffBoardMembersListResolver } from './staff.resolvers';

export default [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'employees',
        pathMatch: 'full'
      },
      {
        path: 'employees',
        loadComponent: () => import('./list-employees/employees-list.component').then(c => c.EmployeesListComponent),
        resolve: {
          data: initialDataStaffEmployeesListResolver
        }
      },
      {
        path: 'board-members',
        loadComponent: () => import('./list/list.component').then(c => c.ListComponent),
        resolve: {
          data: initialDataStaffBoardMembersListResolver
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
