import { Routes } from '@angular/router';
import { AgencyProgramsComponent } from './programs.component';
import { AgencyProgramsListComponent } from './list/list.component';

export default [
    {
        path     : '',
        component: AgencyProgramsComponent,
        children: [
            { path: '', component: AgencyProgramsListComponent },
        ]
    }
] as Routes;
