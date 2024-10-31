import { Routes } from '@angular/router';
import { ValidationToProgramComponent } from './validation-to-program.component';
import { ValidationToProgramListComponent } from './list/list.component';
import { ValidationToProgramEditResolver, ValidationToProgramListResolver } from './validation-to-program.resolvers';
import { ValidationToProgramEditComponent } from './edit/edit.component';

export default [
    {
        path     : '',
        component: ValidationToProgramComponent,
        children: [
            {
                path: '',
                resolve: {
                    programs: ValidationToProgramListResolver
                },
                component: ValidationToProgramListComponent
            },
            {
                path: 'edit/:id',
                component: ValidationToProgramEditComponent,
                resolve: {
                    agency: ValidationToProgramEditResolver
                }
            }
        ]
    },
] as Routes;
