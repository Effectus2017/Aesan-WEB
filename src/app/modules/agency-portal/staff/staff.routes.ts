import { Routes } from '@angular/router';
import { PermissionGuard } from 'app/core/auth/guards/permission.guard';
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
        loadComponent: () => import('./list-employees/employees-list.component').then(c => c.ListEmployeesComponent),
        canActivate: [PermissionGuard],
        data: { permission: 'staff.view' },
        resolve: {
          data: initialDataStaffEmployeesListResolver
        }
      },
      {
        path: 'board-members',
        loadComponent: () => import('./list/list.component').then(c => c.ListBoardMembersComponent),
        canActivate: [PermissionGuard],
        data: { permission: 'staff.view' },
        resolve: {
          data: initialDataStaffBoardMembersListResolver
        }
      },
      {
        path: 'add',
        loadComponent: () => import('./add/add.component').then(c => c.AddStaffComponent),
        canActivate: [PermissionGuard],
        data: { permission: 'staff.create' },
        resolve: {
          data: initialDataStaffAddResolver
        }
      },
      {
        path: 'add-employee',
        loadComponent: () => import('./add-employee/add-employee.component').then(c => c.AddEmployeeComponent),
        canActivate: [PermissionGuard],
        data: { permission: 'staff.create' },
        resolve: {
          data: initialDataStaffAddResolver
        }
      },
      {
        path: 'add-board-member',
        loadComponent: () => import('./add-board-member/add-board-member.component').then(c => c.AddBoardMemberComponent),
        canActivate: [PermissionGuard],
        data: { permission: 'staff.create' },
        resolve: {
          data: initialDataStaffAddResolver
        }
      },
      {
        path: 'edit-employee/:id',
        loadComponent: () => import('./edit-employee/edit-employee.component').then(c => c.EditEmployeeComponent),
        canActivate: [PermissionGuard],
        data: { permission: 'staff.edit' },
        resolve: {
          data: initialDataStaffEditResolver
        }
      },
      {
        path: 'edit-board-member/:id',
        loadComponent: () => import('./edit-board-member/edit-board-member.component').then(c => c.EditBoardMemberComponent),
        canActivate: [PermissionGuard],
        data: { permission: 'staff.edit' },
        resolve: {
          data: initialDataStaffEditResolver
        }
      }
    ]
  }
] as Routes;
