/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

// Navegación para el portal de agencias
export const agencyNavigation: FuseNavigationItem[] = [
  {
    id: 'agency-home',
    title: 'navigation.agency.home',
    type: 'basic',
    icon: 'heroicons_outline:home',
    link: '/home',
  },
  {
    id: 'program-requests',
    title: 'navigation.agency.program-requests',
    type: 'basic',
    icon: 'heroicons_outline:document-text',
    link: '/program-requests',
  },
  {
    id: 'users',
    title: 'navigation.users.title',
    subtitle: 'navigation.users.subtitle',
    type: 'group',
    icon: 'mat_solid:user',
    children: [
      {
        id: 'users.list',
        title: 'navigation.users.list',
        type: 'basic',
        icon: 'mat_solid:list',
        link: '/users',
      },
      {
        id: 'users.add',
        title: 'navigation.users.add',
        type: 'basic',
        icon: 'mat_solid:add',
        link: '/users/add',
      },
      {
        id: 'roles.list',
        title: 'navigation.users.roles',
        type: 'basic',
        icon: 'mat_solid:lock',
        link: '/users/roles',
      },
    ],
  },
];

// Mantener las navegaciones existentes...
export const defaultNavigation: FuseNavigationItem[] = [
  // Administrator
  {
    id: 'home',
    title: 'navigation.home',
    type: 'group',
    icon: 'heroicons_solid:home',
    children: [
      {
        id: 'programs',
        title: 'navigation.programs.validation',
        type: 'basic',
        icon: 'heroicons_solid:inbox-arrow-down',
        link: '/validation-to-program',
        roles: ['Administrator'],
      },
    ],
    roles: ['Administrator'],
  },
  {
    id: 'documents',
    title: 'navigation.documents',
    type: 'basic',
    icon: 'heroicons_solid:document-duplicate',
    link: '/documents',
    roles: ['Administrator'],
  },
  // Administrator
  {
    id: 'administration',
    title: 'navigation.administration.title',
    type: 'group',
    icon: 'heroicons_solid:building-office',
    children: [
      {
        id: 'administration.agency-status',
        title: 'navigation.administration.agency-status',
        type: 'basic',
        icon: 'heroicons_solid:building-office',
        link: '/agency-status',
      },
    ],
    roles: ['Administrator'],
  },
  {
    id: 'users',
    title: 'navigation.users.title',
    subtitle: 'navigation.users.subtitle',
    type: 'group',
    icon: 'mat_solid:user',
    children: [
      {
        id: 'users.list',
        title: 'navigation.users.list',
        type: 'basic',
        icon: 'mat_solid:list',
        link: '/users',
      },
      {
        id: 'users.add',
        title: 'navigation.users.add',
        type: 'basic',
        icon: 'mat_solid:add',
        link: '/users/add',
      },
      {
        id: 'roles.list',
        title: 'navigation.users.roles',
        type: 'basic',
        icon: 'mat_solid:lock',
        link: '/users/roles',
      },
    ],
  },
  // Administrator
  {
    id: 'documents',
    title: 'navigation.documents',
    type: 'basic',
    icon: 'heroicons_solid:document-duplicate',
    link: '/documents',
    roles: ['Administrator'],
  },
  // Agency-Administrator
  {
    id: 'documents.agency',
    title: 'navigation.documents',
    type: 'basic',
    icon: 'heroicons_solid:document-duplicate',
    link: '/documents',
    roles: ['Agency-Administrator'],
  },
  {
    id: 'documents.schools',
    title: 'navigation.documents',
    type: 'basic',
    icon: 'heroicons_outline:academic-cap',
    link: '/schools',
    roles: ['Agency-Administrator'],
  },
  {
    id: 'forms.agency',
    title: 'navigation.forms.title',
    type: 'group',
    icon: 'heroicons_solid:clipboard-document-list',
    children: [
      {
        id: 'forms.agency.pdam-solicitud',
        title: 'navigation.forms.pdam-solicitud',
        type: 'basic',
        icon: 'heroicons_solid:document',
        link: '/forms/pdam-solicitud',
      },
      {
        id: 'forms.agency.psav-solicitud',
        title: 'navigation.forms.psav-solicitud',
        type: 'basic',
        icon: 'heroicons_solid:document',
        link: '/forms/psav-solicitud',
      },
    ],
    roles: ['Agency-Administrator'],
  },
  {
    id: 'accounting.agency',
    title: 'navigation.accounting.title',
    type: 'group',
    icon: 'heroicons_solid:calculator',
    children: [
      {
        id: 'accounting.agency.budget',
        title: 'navigation.accounting.budget',
        type: 'basic',
        icon: 'heroicons_solid:document',
        link: '/accounting/agency/budget',
      },
      {
        id: 'accounting.agency.financial-management',
        title: 'navigation.accounting.financial-management',
        type: 'basic',
        icon: 'heroicons_solid:document',
      },
      {
        id: 'accounting.agency.employee-management',
        title: 'navigation.accounting.employee-management',
        type: 'basic',
        icon: 'heroicons_solid:document',
      },
      {
        id: 'accounting.agency.rations-form',
        title: 'navigation.accounting.rations-form',
        type: 'basic',
        icon: 'heroicons_solid:document',
      },
    ],
    roles: ['Agency-Administrator'],
  },
  {
    id: 'dashboard.agency',
    title: 'navigation.dashboard',
    type: 'basic',
    icon: 'heroicons_solid:chart-pie',
    link: '/dashboard',
    roles: ['Agency-Administrator'],
  },
  {
    id: 'reports.agency',
    title: 'navigation.reports',
    type: 'basic',
    icon: 'heroicons_solid:document-chart-bar',
    link: '/reports',
    roles: ['Agency-Administrator'],
  },
];

export const horizontalNavigation: FuseNavigationItem[] = [
  // Administrator
  {
    id: 'home',
    title: 'navigation.home',
    type: 'group',
    icon: 'heroicons_solid:home',
    children: [],
    roles: ['Administrator'],
  },
  // Administrator
  {
    id: 'documents',
    title: 'navigation.documents',
    type: 'basic',
    icon: 'heroicons_solid:document-duplicate',
    link: '/documents',
    roles: ['Administrator'],
  },
  {
    id: 'users',
    title: 'navigation.users.title',
    type: 'group',
    icon: 'mat_solid:person',
    children: [],
    roles: ['Administrator'],
  },
  {
    id: 'administration',
    title: 'navigation.administration.title',
    type: 'group',
    icon: 'heroicons_solid:building-office',
    children: [],
    roles: ['Administrator'],
  },
  // Agency-Administrator
  {
    id: 'home.agency',
    title: 'navigation.home',
    type: 'basic',
    icon: 'heroicons_solid:home',
    link: '/program-requests',
    roles: ['Agency-Administrator'],
  },
  {
    id: 'documents.agency',
    title: 'navigation.documents',
    type: 'basic',
    icon: 'heroicons_solid:document-duplicate',
    link: '/documents',
    roles: ['Agency-Administrator'],
  },
  {
    id: 'documents.schools',
    title: 'navigation.schools',
    type: 'basic',
    icon: 'heroicons_solid:document-duplicate',
    link: '/schools',
    roles: ['Agency-Administrator'],
  },
  {
    id: 'forms.agency',
    title: 'navigation.forms.title',
    type: 'group',
    icon: 'heroicons_solid:clipboard-document-list',
    link: '/forms',
    roles: ['Agency-Administrator'],
  },
  {
    id: 'accounting.agency',
    title: 'navigation.accounting.title',
    type: 'group',
    icon: 'heroicons_solid:calculator',
    children: [],
    roles: ['Agency-Administrator'],
  },
  {
    id: 'dashboard.agency',
    title: 'navigation.dashboard',
    type: 'basic',
    icon: 'heroicons_solid:chart-pie',
    link: '/dashboard',
    roles: ['Agency-Administrator'],
  },
  {
    id: 'reports.agency',
    title: 'navigation.reports',
    type: 'basic',
    icon: 'heroicons_solid:document-chart-bar',
    link: '/reports',
    roles: ['Agency-Administrator'],
  },
  {
    id: 'programs',
    title: 'navigation.programs.title',
    type: 'basic',
    icon: 'heroicons_solid:cursor-arrow-ripple',
    link: '/programs',
    roles: ['Agency-Administrator'],
  },
  // Monitor
  {
    id: 'home',
    title: 'navigation.home',
    type: 'basic',
    icon: 'heroicons_solid:home',
    link: '/pre-operational',
    roles: ['Monitor'],
  },
];
