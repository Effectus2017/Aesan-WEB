import { Routes } from '@angular/router';
import { AgencyStatusComponent } from './agency-status.component';
import { initialDataAgencyStatusListResolver, initialDataAgencyStatusAddResolver, initialDataAgencyStatusEditResolver } from './agency-status.resolvers';
// (El componente de edición se agregará después)

export default [
    {
        path     : '',
        component: AgencyStatusComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./list/list.component').then(c => c.AgencyStatusListComponent),
                resolve: {
                    data: initialDataAgencyStatusListResolver
                },
            },
            {
                path: 'edit/:id',
                loadComponent: () => import('./edit/edit.component').then(c => c.EditAgencyStatusComponent),
                resolve: {
                    data: initialDataAgencyStatusEditResolver
                }
            },
            {
                path: 'add',
                loadComponent: () => import('./add/add.component').then(c => c.AddAgencyStatusComponent),
                resolve: {
                    data: initialDataAgencyStatusAddResolver
                }
            }
        ]
    },
] as Routes;
