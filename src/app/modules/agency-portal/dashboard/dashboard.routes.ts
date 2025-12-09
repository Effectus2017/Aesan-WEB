import { Routes } from '@angular/router';
import { AgencyDashboardComponent } from './dashboard.component';
import { AgencyDashboardListComponent } from './list/list.component';
import { agencyDashboardResolver } from './dashboard.resolvers';

export default [
    {
        path     : '',
        component: AgencyDashboardComponent,
        children: [
            {
                path: '',
                component: AgencyDashboardListComponent,
                resolve: {
                    dashboard: agencyDashboardResolver
                }
            },
        ]
    },
] as Routes;
