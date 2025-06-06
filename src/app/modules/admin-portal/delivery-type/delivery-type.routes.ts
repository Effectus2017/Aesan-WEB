import { Routes } from '@angular/router';
import { DeliveryTypeComponent } from './delivery-type.component';

export default [
    {
        path     : '',
        component: DeliveryTypeComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./list/list.component').then(c => c.DeliveryTypeListComponent),
            },
            {
                path: 'edit/:id',
                loadComponent: () => import('./edit/edit.component').then(c => c.DeliveryTypeEditComponent),
            },
            {
                path: 'add',
                loadComponent: () => import('./add/add.component').then(c => c.DeliveryTypeAddComponent),
            }
        ]
    },
] as Routes;
