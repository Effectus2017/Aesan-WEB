import { Routes } from '@angular/router';
import { SponsorTypeComponent } from './sponsor-type.component';
import { initialDataSponsorTypeListResolver, initialDataSponsorTypeEditResolver } from './sponsor-type.resolvers';

export default [
    {
        path     : '',
        component: SponsorTypeComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./list/list.component').then(c => c.SponsorTypeListComponent),
                resolve: {
                    data: initialDataSponsorTypeListResolver
                },
            },
            {
                path: 'edit/:id',
                loadComponent: () => import('./edit/edit.component').then(c => c.EditSponsorTypeComponent),
                resolve: {
                    data: initialDataSponsorTypeEditResolver
                }
            },
            {
                path: 'add',
                loadComponent: () => import('./add/add.component').then(c => c.AddSponsorTypeComponent)
            }
        ]
    },
] as Routes;
