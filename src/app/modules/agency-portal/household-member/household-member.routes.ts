import { Routes } from '@angular/router';
import { initialDataHouseholdMemberListResolver, initialDataHouseholdMemberEditResolver } from './household-member.resolvers';

export default [
    {
        path     : '',
        children: [
            {
                path: '',
                loadComponent: () => import('./list/list.component').then(c => c.HouseholdMemberListComponent),
                resolve: {
                    data: initialDataHouseholdMemberListResolver
                },
            },
            {
                path: 'edit/:id',
                loadComponent: () => import('./edit/edit.component').then(c => c.EditHouseholdMemberComponent),
                resolve: {
                    data: initialDataHouseholdMemberEditResolver
                }
            },
            {
                path: 'add',
                loadComponent: () => import('./add/add.component').then(c => c.AddHouseholdMemberComponent)
            }
        ]
    },
] as Routes;
