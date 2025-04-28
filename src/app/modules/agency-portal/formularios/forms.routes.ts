import { Routes } from '@angular/router';
import { AgencyFormsComponent } from './forms.component';

export default [
    {
        path     : '',
        component: AgencyFormsComponent,
        children: [
            {
                path: 'pdam-solicitud',
                loadComponent: () => import('./pdam-solicitud/pdam-solicitud.component').then(c => c.AgencyPDAMSolicitudComponent),
                resolve: {
                    //data: initialAgencyFormsRequestsResolver
                }
            }
        ]
    }
] as Routes;
