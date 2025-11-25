import { Routes } from '@angular/router';
import { MessageTemplateComponent } from './message-template.component';
import { initialDataMessageTemplateListResolver, initialDataMessageTemplateAddResolver, initialDataMessageTemplateEditResolver } from './message-template.resolvers';

export default [
    {
        path     : '',
        component: MessageTemplateComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./list/list.component').then(c => c.MessageTemplateListComponent),
                resolve: {
                    data: initialDataMessageTemplateListResolver
                },
            },
            {
                path: 'add',
                loadComponent: () => import('./add/add.component').then(c => c.AddMessageTemplateComponent),
                resolve: {
                    data: initialDataMessageTemplateAddResolver
                }
            },
            {
                path: 'edit/:id',
                loadComponent: () => import('./edit/edit.component').then(c => c.EditMessageTemplateComponent),
                resolve: {
                    data: initialDataMessageTemplateEditResolver
                }
            }
        ]
    },
] as Routes;

