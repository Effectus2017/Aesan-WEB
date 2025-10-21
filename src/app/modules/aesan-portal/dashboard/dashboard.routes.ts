import { Routes } from '@angular/router';
import { AesanDashboardComponent } from './dashboard.component';
import { AesanDashboardListComponent } from './list/list.component';
import { aesanDashboardResolver } from './dashboard.resolvers';

export default [
    {
        path     : '',
        component: AesanDashboardComponent,
        children: [
            {
                path: '',
                component: AesanDashboardListComponent,
                resolve: { data: aesanDashboardResolver }
            },
        ]
    },
] as Routes;
