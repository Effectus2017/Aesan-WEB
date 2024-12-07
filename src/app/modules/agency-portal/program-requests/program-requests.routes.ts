import { Routes } from '@angular/router';
import { AgencyProgramRequestsComponent } from './program-requests.component';
import { AgencyProgramRequestsListComponent } from './list/list.component';
import { AddProgramRequestComponent } from './add/add.component';
import { initialAgencyProgramRequestsResolver } from './program-requests.resolvers';

export default [
    {
        path     : '',
        component: AgencyProgramRequestsComponent,
        children: [
            {
                path: '',
                component: AgencyProgramRequestsListComponent,
                resolve: {
                    data: initialAgencyProgramRequestsResolver
                }
            },
            {
                path: 'add',
                component: AddProgramRequestComponent,
                resolve: {
                    //data: AgencyProgramRequestsEditResolver
                }
            }
        ]
    }
] as Routes;
