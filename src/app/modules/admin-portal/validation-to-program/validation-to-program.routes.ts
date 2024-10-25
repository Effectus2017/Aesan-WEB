import { Routes } from '@angular/router';
import { ValidationToProgramComponent } from './validation-to-program.component';
import { ValidationToProgramListComponent } from './list/list.component';

export default [
    {
        path     : '',
        component: ValidationToProgramComponent,
        children: [
            {
                path: '',
                component: ValidationToProgramListComponent
            }
        ]
    },
] as Routes;
