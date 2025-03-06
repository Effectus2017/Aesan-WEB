import { Routes } from '@angular/router';
import { AgencyDashboardComponent } from './dashboard.component';
import { AgencyDashboardListComponent } from './list/list.component';
export default [
    {
        path     : '',
        component: AgencyDashboardComponent,
        children: [
            { path: '', component: AgencyDashboardListComponent },
        ]
    },
] as Routes;
