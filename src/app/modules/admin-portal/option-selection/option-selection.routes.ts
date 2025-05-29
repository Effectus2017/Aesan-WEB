import { Routes } from '@angular/router';
import { OptionSelectionComponent } from './option-selection.component';
import { initialDataOptionSelectionListResolver, initialDataOptionSelectionEditResolver } from './option-selection.resolvers';

export default [
    {
        path     : '',
        component: OptionSelectionComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./list/list.component').then(c => c.OptionSelectionListComponent),
                resolve: {
                    data: initialDataOptionSelectionListResolver
                },
            },
            {
                path: 'edit/:id',
                loadComponent: () => import('./edit/edit.component').then(c => c.EditOptionSelectionComponent),
                resolve: {
                    data: initialDataOptionSelectionEditResolver
                }
            },
            {
                path: 'add',
                loadComponent: () => import('./add/add.component').then(c => c.AddOptionSelectionComponent)
            }
        ]
    },
] as Routes;
