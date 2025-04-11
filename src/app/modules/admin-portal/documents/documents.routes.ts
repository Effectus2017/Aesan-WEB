import { Routes } from '@angular/router';

export default [
    {
        path: '',
        children: [
            {
                path: '',
                loadComponent: () => import('./list/list.component').then(c => c.DocumentsListComponent),
                title: 'Documentos'
            }
        ]
    }
] as Routes;
