import { Routes } from '@angular/router';
import { ReportsComponent } from './reports.component';
import { SchoolHierarchyTreeComponent } from './school-hierarchy-tree/school-hierarchy-tree.component';
import { SchoolHierarchyTreeResolver } from './reports.resolvers';

export default [
  {
    path: '',
    component: ReportsComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./list/list.component').then(c => c.ReportsListComponent),
      },
      {
        path: 'school-hierarchy-tree',
        component: SchoolHierarchyTreeComponent,
        resolve: {
          data: SchoolHierarchyTreeResolver
        }
      }
    ]
  }
] as Routes;

