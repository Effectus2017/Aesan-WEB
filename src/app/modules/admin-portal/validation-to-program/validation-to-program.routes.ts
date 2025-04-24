import { Routes } from '@angular/router';
import { ValidationToProgramComponent } from './validation-to-program.component';
import { ValidationToProgramListComponent } from './list/list.component';
import { initialDataValidationToProgramEditResolver, initialDataValidationToProgramListResolver } from './validation-to-program.resolvers';
import { EditValidationToProgramComponent } from './edit/edit.component';

export default [
    {
        path     : '',
        component: ValidationToProgramComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./list/list.component').then(c => c.ValidationToProgramListComponent),
                resolve: {
                    data: initialDataValidationToProgramListResolver
                },
            },
            {
                path: 'edit/:id',
                loadComponent: () => import('./edit/edit.component').then(c => c.EditValidationToProgramComponent),
                resolve: {
                    data: initialDataValidationToProgramEditResolver
                }
            }
        ]
    },
] as Routes;
