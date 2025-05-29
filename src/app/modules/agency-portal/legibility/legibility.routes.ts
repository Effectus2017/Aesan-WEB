import { Routes } from '@angular/router';
import { ReadabilityModuleComponent } from './legibility.component';

export default [
  {
    path: '',
    component: ReadabilityModuleComponent,
    children: [
      {
        path: 'add',
        loadComponent: () => import('./add/add.component').then((c) => c.ReadabilityModuleComponent),
      },
    ],
  },
] as Routes;
