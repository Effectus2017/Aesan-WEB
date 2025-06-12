import { Routes } from '@angular/router';
import { CenterTypeComponent } from './center-type.component';
import { initialDataCenterTypeListResolver, initialDataCenterTypeEditResolver } from './center-type.resolvers';

export default [
    {
        path     : '',
        component: CenterTypeComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./list/list.component').then(c => c.CenterTypeListComponent),
                resolve: {
                    data: initialDataCenterTypeListResolver
                },
            },
            {
                path: 'edit/:id',
                loadComponent: () => import('./edit/edit.component').then(c => c.EditCenterTypeComponent),
                resolve: {
                    data: initialDataCenterTypeEditResolver
                }
            },
            {
                path: 'add',
                loadComponent: () => import('./add/add.component').then(c => c.AddCenterTypeComponent)
            }
        ]
    },
] as Routes;
