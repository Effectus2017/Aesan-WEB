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
        loadComponent: () => import('./list-employees/employees-list.component').then(c => c.AdminListEmployeesComponent),
        resolve: {
          data: initialDataStaffEmployeesListResolver
        }
      },
      {
        path: 'board-members',
        loadComponent: () => import('./list/list.component').then(c => c.AdminListBoardMembersComponent),
        resolve: {
          data: initialDataStaffBoardMembersListResolver
        }
      },
      {
        path: 'add',
        loadComponent: () => import('./add/add.component').then(c => c.AdminAddStaffComponent),
        resolve: {
          data: initialDataStaffAddResolver
        }
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./edit/edit.component').then(c => c.AdminEditStaffComponent),
        resolve: {
          data: initialDataStaffEditResolver
        }
      }
    ]
  }
] as Routes;
