import { Routes } from '@angular/router';
import { GroupTypeComponent } from './group-type.component';
import { initialDataGroupTypeListResolver, initialDataGroupTypeEditResolver } from './group-type.resolvers';

export default [
    {
        path     : '',
        component: GroupTypeComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./list/list.component').then(c => c.GroupTypeListComponent),
                resolve: {
                    data: initialDataGroupTypeListResolver
                },
            },
            {
                path: 'edit/:id',
                loadComponent: () => import('./edit/edit.component').then(c => c.EditGroupTypeComponent),
                resolve: {
                    data: initialDataGroupTypeEditResolver
                }
            },
            {
                path: 'add',
                loadComponent: () => import('./add/add.component').then(c => c.AddGroupTypeComponent)
            }
        ]
    },
] as Routes;
