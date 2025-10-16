import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./schools-tree-demo.component').then((c) => c.SchoolsTreeDemoComponent),
  },
] as Routes;
