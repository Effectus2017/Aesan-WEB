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
    children: [
      { path: 'home', loadChildren: () => import('app/modules/landing/home/home.routes') },
      // Demo del árbol de escuelas
      { path: 'demo/sites-tree', loadChildren: () => import('app/shared/components/sites-tree/sites-tree-demo.routes') },
    ],
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
      // Sponsors (Role: Admin)
      { path: 'sponsors', loadChildren: () => import('app/modules/admin-portal/validation-to-program/validation-to-program.routes') },
      // Users (Role: Admin)
      { path: 'users', loadChildren: () => import('app/modules/admin-portal/users/users.routes') },
      // Documents (Role: Admin)
      { path: 'documents', loadChildren: () => import('app/modules/admin-portal/documents-files/documents.routes') },
      // Agency status (Role: Admin)
      { path: 'agency-status', loadChildren: () => import('app/modules/admin-portal/agency-status/agency-status.routes') },
      // Kitchen types (Role: Admin)
      { path: 'kitchen-type', loadChildren: () => import('app/modules/admin-portal/kitchen-type/kitchen-type.routes') },
      // Group types (Role: Admin)
      { path: 'group-type', loadChildren: () => import('app/modules/admin-portal/group-type/group-type.routes') },
      // Sponsor types (Role: Admin)
      { path: 'sponsor-type', loadChildren: () => import('app/modules/admin-portal/sponsor-type/sponsor-type.routes') },
      // Staff types (Role: Admin)
      { path: 'staff-type', loadChildren: () => import('app/modules/admin-portal/staff-type/staff-type.routes') },
      // Operating policies (Role: Admin)
      { path: 'operating-policy', loadChildren: () => import('app/modules/admin-portal/operating-policy/operating-policy.routes') },
      // Permissions (Role: Admin)
      { path: 'permissions', loadChildren: () => import('app/modules/admin-portal/permissions/permissions.routes') },
      // Staff (Role: Admin)
      { path: 'staff', loadChildren: () => import('app/modules/admin-portal/staff/staff.routes') },
      // Option selection (Role: Admin)
      { path: 'option-selection', loadChildren: () => import('app/modules/admin-portal/option-selection/option-selection.routes') },
      // Email templates (Role: Admin)
      { path: 'email-template', loadChildren: () => import('app/modules/admin-portal/email-template/email-template.routes') },
      // Email logs (Role: Admin)
      { path: 'email-logs', loadChildren: () => import('app/modules/admin-portal/email-logs/email-logs.routes') },
      // Message templates (Role: Admin)
      { path: 'message-template', loadChildren: () => import('app/modules/admin-portal/message-template/message-template.routes') },
      // Organization types (Role: Admin)
      { path: 'organization-type', loadChildren: () => import('app/modules/admin-portal/organization-type/organization-type.routes') },
      // Reports (Role: Admin)
      { path: 'reports', loadChildren: () => import('app/modules/admin-portal/reports/reports.routes') },
    ],
  },

  // Monitor (Role: Monitor) routes
  {
    path: 'aesan-portal',
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
      { path: 'dashboard', loadChildren: () => import('app/modules/aesan-portal/dashboard/dashboard.routes') },
      { path: 'sponsor-evaluation', loadChildren: () => import('app/modules/aesan-portal/sponsor-evaluation/sponsor-evaluation.routes') },
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
      { path: 'schools', loadChildren: () => import('app/modules/agency-portal/schools/schools.routes') },
      // Centers, listado de centros para PACNA (Role: Agency)
      { path: 'centers', loadChildren: () => import('app/modules/agency-portal/centers/centers.routes') },
      // Sites PDAM, listado de sitios (Role: Agency)
      { path: 'sites-pdam', loadChildren: () => import('app/modules/agency-portal/sites-pdam/sites.routes') },
      // Sites PACNA, formularios separados para sitios de PACNA (Role: Agency)
      { path: 'sites-pacna', loadChildren: () => import('app/modules/agency-portal/sites-pacna/sites-pacna.routes') },
      // Sites PSAV, formularios separados para sitios de PSAV (Role: Agency)
      { path: 'sites-psav', loadChildren: () => import('app/modules/agency-portal/sites-psav/sites-psav.routes') },
      // Household, listado de hogares (Role: Agency)
      { path: 'household', loadChildren: () => import('app/modules/agency-portal/household/household.routes') },
      // Household member, listado de miembros del hogar (Role: Agency)
      { path: 'household-member', loadChildren: () => import('app/modules/agency-portal/household-member/household-member.routes') },
      // Employees, listado de empleados (Role: Agency)
      { path: 'employees', loadChildren: () => import('app/modules/agency-portal/employees/employees.routes') },
      // Staff, listado de staff (Role: Agency)
      { path: 'staff', loadChildren: () => import('app/modules/agency-portal/staff/staff.routes') },
      // Users, perfil de usuario (Role: Agency)
      { path: 'users', loadChildren: () => import('app/modules/agency-portal/users/users.routes') },
      // Legibility module, listado de módulos de elegibilidad (Role: Agency)
      { path: 'legibility', loadChildren: () => import('app/modules/agency-portal/legibility/legibility.routes') },
    ],
  },
];
