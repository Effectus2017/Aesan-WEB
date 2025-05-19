import { Routes } from '@angular/router';
import { initialDataDocumentsListResolver } from './documents.resolvers';

export default [
    {
        path: '',
        children: [
            {
                path: '',
                loadComponent: () => import('./list/list.component').then(c => c.DocumentsListComponent),
                resolve: {
                    data: initialDataDocumentsListResolver
                }
            }
        ]
    }
] as Routes;
