import { Routes } from '@angular/router';
import { PermissionsListComponent } from './list/list.component';
import { initialDataPermissionsListResolver, initialDataPermissionsEditResolver } from './permissions.resolvers';

export default [
    {
        path     : '',
        component: PermissionsListComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./list/list.component').then(c => c.PermissionsListComponent),
                resolve: {
                    data: initialDataPermissionsListResolver
                },
            },
            {
                path: 'edit/:id',
                loadComponent: () => import('./edit/edit.component').then(c => c.EditPermissionComponent),
                resolve: {
                    data: initialDataPermissionsEditResolver
                }
            },
            {
                path: 'add',
                loadComponent: () => import('./add/add.component').then(c => c.AddPermissionComponent)
            }
        ]
    },
] as Routes;
