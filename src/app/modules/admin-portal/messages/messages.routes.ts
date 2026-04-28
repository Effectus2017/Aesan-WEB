import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('app/shared/components/user-messages-center/user-messages-center.component').then(c => c.UserMessagesCenterComponent)
  }
] as Routes;
