import { Routes } from '@angular/router';
import { ValidationToProgramComponent } from './validation-to-program.component';
import { ValidationToProgramListComponent } from './list/list.component';
import { ValidationToProgramEditResolver, ValidationToProgramListResolver } from './validation-to-program.resolvers';
import { EditValidationToProgramComponent } from './edit/edit.component';

export default [
    {
        path     : '',
        component: ValidationToProgramComponent,
        children: [
            {
                path: '',
                resolve: {
                    data: ValidationToProgramListResolver
                },
                component: ValidationToProgramListComponent
            },
            {
                path: 'edit/:id',
                component: EditValidationToProgramComponent,
                resolve: {
                    data: ValidationToProgramEditResolver
                }
            }
        ]
    },
] as Routes;
