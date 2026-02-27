import { Routes } from '@angular/router';
import { AgencyDashboardComponent } from './dashboard.component';
import { AgencyDashboardListComponent } from './list/list.component';
import { initialDataDashboardResolver } from './dashboard.resolvers';

export default [
    {
        path     : '',
        component: AgencyDashboardComponent,
        children: [
            {
                path: '',
                component: AgencyDashboardListComponent,
                resolve: {
                    dashboard: initialDataDashboardResolver
                }
            },
        ]
    },
] as Routes;
