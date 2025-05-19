import { Routes } from '@angular/router';
import { KitchenTypeComponent } from './kitchen-type.component';
import { initialDataKitchenTypeListResolver, initialDataKitchenTypeEditResolver } from './kitchen-type.resolvers';

export default [
    {
        path     : '',
        component: KitchenTypeComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./list/list.component').then(c => c.KitchenTypeListComponent),
                resolve: {
                    data: initialDataKitchenTypeListResolver
                },
            },
            {
                path: 'edit/:id',
                loadComponent: () => import('./edit/edit.component').then(c => c.EditKitchenTypeComponent),
                resolve: {
                    data: initialDataKitchenTypeEditResolver
                }
            },
            {
                path: 'add',
                loadComponent: () => import('./add/add.component').then(c => c.AddKitchenTypeComponent)
            }
        ]
    },
] as Routes;
