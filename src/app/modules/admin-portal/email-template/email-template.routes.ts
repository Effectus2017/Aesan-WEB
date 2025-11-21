import { Routes } from '@angular/router';
import { EmailTemplateComponent } from './email-template.component';
import { initialDataEmailTemplateListResolver, initialDataEmailTemplateEditResolver } from './email-template.resolvers';

export default [
    {
        path     : '',
        component: EmailTemplateComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./list/list.component').then(c => c.EmailTemplateListComponent),
                resolve: {
                    data: initialDataEmailTemplateListResolver
                },
            },
            {
                path: 'edit/:id',
                loadComponent: () => import('./edit/edit.component').then(c => c.EditEmailTemplateComponent),
                resolve: {
                    data: initialDataEmailTemplateEditResolver
                }
            }
        ]
    },
] as Routes;

