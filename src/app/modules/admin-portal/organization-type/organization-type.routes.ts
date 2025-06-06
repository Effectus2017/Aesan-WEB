import { Routes } from '@angular/router';
import { OrganizationTypeComponent } from './organization-type.component';

export default [
    {
        path     : '',
        component: OrganizationTypeComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./list/list.component').then(c => c.OrganizationTypeListComponent),
            },
            {
                path: 'edit/:id',
                loadComponent: () => import('./edit/edit.component').then(c => c.OrganizationTypeEditComponent),
            },
            {
                path: 'add',
                loadComponent: () => import('./add/add.component').then(c => c.OrganizationTypeAddComponent),
            }
        ]
    },
] as Routes;
