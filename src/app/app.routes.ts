import { Route } from '@angular/router';
import { initialDataAgencyPortalResolver, initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';

export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'auth-redirect' },
  // Redirigir después del inicio de sesión
  { path: 'signed-in-redirect', pathMatch: 'full', redirectTo: 'auth-redirect' },

    // Ruta de redirección basada en el rol
  {
    path: 'auth-redirect',
    canActivate: [AuthGuard],
    loadChildren: () => import('app/modules/auth/auth-redirect/auth-redirect.routes'),
  },

  // Auth routes for guests
  {
    path: '',
    canActivate: [NoAuthGuard],
    canActivateChild: [NoAuthGuard],
    component: LayoutComponent,
    data: {
      layout: 'empty',
    },
    children: [
      { path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.routes') },
      { path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.routes') },
      { path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.routes') },
      { path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes') },
      { path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.routes') },
    ],
  },

  // Auth routes for authenticated users
  {
    path: '',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: LayoutComponent,
    data: {
      layout: 'empty',
    },
    children: [
      { path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.routes') },
      { path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.routes') },
    ],
  },

  // Landing routes
  {
    path: '',
    component: LayoutComponent,
    data: {
      layout: 'empty',
    },
    children: [{ path: 'home', loadChildren: () => import('app/modules/landing/home/home.routes') }],
  },

  // Admin routes
  {
    path: 'admin-portal',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: LayoutComponent,
    data: {
      layout: 'modern',
    },
    resolve: {
      initialData: initialDataResolver,
    },
    children: [
      { path: 'validation-to-program', loadChildren: () => import('app/modules/admin-portal/validation-to-program/validation-to-program.routes') },
      { path: 'users', loadChildren: () => import('app/modules/admin-portal/users/users.routes') },
    ],
  },

  // Monitor (Role: Monitor) routes
  {
    path: 'monitor-portal',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: LayoutComponent,
    data: {
      layout: 'modern',
    },
    resolve: {
      initialData: initialDataResolver,
    },
    children: [
      { path: 'pre-operational', loadChildren: () => import('app/modules/monitor-portal/preoperational-visit/preoperational-visit.routes') },
    ],
  },

  // Agency (sponsor) routes
  {
    path: 'agency-portal',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: LayoutComponent,
    data: {
        layout: 'modern',
      },
    resolve: {
      initialData: initialDataAgencyPortalResolver,
    },
    children: [
      { path: 'program-requests', loadChildren: () => import('app/modules/agency-portal/program-requests/program-requests.routes') },
      { path: 'programs', loadChildren: () => import('app/modules/agency-portal/programs/programs.routes') },
    ],
  },
];
