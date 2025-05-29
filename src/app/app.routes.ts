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
      { path: 'update-password', loadChildren: () => import('app/modules/auth/update-password/update-password.routes') },
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
      // Validation to program (Role: Admin)
      { path: 'validation-to-program', loadChildren: () => import('app/modules/admin-portal/validation-to-program/validation-to-program.routes') },
      // Users (Role: Admin)
      { path: 'users', loadChildren: () => import('app/modules/admin-portal/users/users.routes') },
      // Documents (Role: Admin)
      { path: 'documents', loadChildren: () => import('app/modules/admin-portal/documents-files/documents.routes') },
      // Agency status (Role: Admin)
      { path: 'agency-status', loadChildren: () => import('app/modules/admin-portal/agency-status/agency-status.routes') },
      // Kitchen types (Role: Admin)
      { path: 'kitchen-type', loadChildren: () => import('app/modules/admin-portal/kitchen-type/kitchen-type.routes') },
      // Permissions (Role: Admin)
      { path: 'permissions', loadChildren: () => import('app/modules/admin-portal/permissions/permissions.routes').then(m => m.default) },
      // Option selection (Role: Admin)
      { path: 'option-selection', loadChildren: () => import('app/modules/admin-portal/option-selection/option-selection.routes') },
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
      { path: 'users', loadChildren: () => import('app/modules/admin-portal/users/users.routes') },
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
      // Program requests, listado de solicitudes de programas (Role: Agency)
      { path: 'program-requests', loadChildren: () => import('app/modules/agency-portal/program-requests/program-requests.routes') },
      // Programs, listado de programas (Role: Agency)
      { path: 'programs', loadChildren: () => import('app/modules/agency-portal/programs/programs.routes') },
      // Dashboard, dashboard de la agencia (Role: Agency)
      { path: 'dashboard', loadChildren: () => import('app/modules/agency-portal/dashboard/dashboard.routes') },
      // Documents, listado de documentos (Role: Agency)
      { path: 'documents', loadChildren: () => import('app/modules/agency-portal/documents-files/documents.routes') },
      // Forms, listado de formularios para solicitar programas (Role: Agency)
      { path: 'forms', loadChildren: () => import('app/modules/agency-portal/formularios/forms.routes') },
      // Schools, listado de escuelas (Role: Agency)
      { path: 'schools', loadChildren: () => import('app/modules/agency-portal/schools/schools.routes').then(m => m.default) },
      // Household, listado de hogares (Role: Agency)
      { path: 'household', loadChildren: () => import('app/modules/agency-portal/household/household.routes') },
      // Household member, listado de miembros del hogar (Role: Agency)
      { path: 'household-member', loadChildren: () => import('app/modules/agency-portal/household-member/household-member.routes') },
      // Legibility module, listado de módulos de elegibilidad (Role: Agency)
      { path: 'legibility', loadChildren: () => import('app/modules/agency-portal/legibility/legibility.routes') },
    ],
  },
];
