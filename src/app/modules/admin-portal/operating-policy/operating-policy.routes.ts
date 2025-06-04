import { Routes } from '@angular/router';
import { OperatingPolicyComponent } from './operating-policy.component';
import { initialDataOperatingPolicyListResolver, initialDataOperatingPolicyEditResolver } from './operating-policy.resolvers';

export default [
    {
        path     : '',
        component: OperatingPolicyComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./list/list.component').then(c => c.OperatingPolicyListComponent),
                resolve: {
                    data: initialDataOperatingPolicyListResolver
                },
            },
            {
                path: 'edit/:id',
                loadComponent: () => import('./edit/edit.component').then(c => c.EditOperatingPolicyComponent),
                resolve: {
                    data: initialDataOperatingPolicyEditResolver
                }
            },
            {
                path: 'add',
                loadComponent: () => import('./add/add.component').then(c => c.AddOperatingPolicyComponent)
            }
        ]
    },
] as Routes;
