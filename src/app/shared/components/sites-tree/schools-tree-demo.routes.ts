import { Routes } from '@angular/router';

export const schoolsTreeDemoRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./schools-tree-demo.component').then(m => m.SchoolsTreeDemoComponent)
  }
];

export default schoolsTreeDemoRoutes;
