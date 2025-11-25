import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./send-message-demo.component').then((c) => c.SendMessageDemoComponent),
  },
] as Routes;

