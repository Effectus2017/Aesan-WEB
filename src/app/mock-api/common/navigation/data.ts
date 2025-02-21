/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

// Navegación para el portal de agencias
export const agencyNavigation: FuseNavigationItem[] = [
  {
    id: 'agency-home',
    title: 'navigation.agency.home',
    type: 'basic',
    icon: 'heroicons_outline:home',
    link: '/agency-portal/home',
  },
  {
    id: 'program-requests',
    title: 'navigation.agency.program-requests',
    type: 'basic',
    icon: 'heroicons_outline:document-text',
    link: '/agency-portal/program-requests',
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
    id: 'forms.agency',
    title: 'navigation.forms.title',
    type: 'group',
    icon: 'heroicons_solid:clipboard-document-list',
    children: [
      {
        id: 'forms.agency.program-application',
        title: 'navigation.forms.program-application',
        type: 'basic',
        icon: 'heroicons_solid:document',
        link: '/forms/agency/program-application',
      },
      {
        id: 'forms.agency.sponsor-organization',
        title: 'navigation.forms.sponsor-organization',
        type: 'basic',
        icon: 'heroicons_solid:document',
        link: '/forms/agency/sponsor-organization',
      },
      {
        id: 'forms.agency.administrative-organization-chart',
        title: 'navigation.forms.administrative-organization-chart',
        type: 'basic',
        icon: 'heroicons_solid:document',
        link: '/forms/agency/administrative-organization-chart',
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

export const compactNavigation: FuseNavigationItem[] = [
  {
    id: 'programs',
    title: 'navigation.programs.validation',
    type: 'basic',
    icon: 'heroicons_solid:home',
    link: '/validation-to-program',
    roles: ['Administrator'],
  },
  {
    id: 'pre-operational',
    title: 'navigation.pre-operational',
    type: 'basic',
    icon: 'heroicons_solid:check-badge',
    link: '/pre-operational',
    roles: ['Monitor'],
  },
  {
    id: 'users',
    title: 'navigation.users.title',
    tooltip: 'navigation.users.tooltip',
    type: 'aside',
    icon: 'mat_solid:person',
    children: [],
    link: '/users',
    roles: ['Administrator'],
  },
];

export const futuristicNavigation: FuseNavigationItem[] = [
  {
    id: 'home',
    title: 'navigation.home',
    type: 'basic',
    icon: 'heroicons_outline:home',
    link: '/example',
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
  {
    id: 'users',
    title: 'navigation.users.title',
    type: 'group',
    icon: 'mat_solid:person',
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
    id: 'forms.agency',
    title: 'navigation.forms.title',
    type: 'group',
    icon: 'heroicons_solid:clipboard-document-list',
    children: [],
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
    icon: 'heroicons_solid:home',
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
