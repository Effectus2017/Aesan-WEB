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
    id: 'program-requests',
    title: 'navigation.agency.program-requests',
    type: 'basic',
    icon: 'heroicons_outline:document-text',
    link: '/agency-portal/program-requests',
    roles: ['Agency'],
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

// branch component
export const horizontalNavigation: FuseNavigationItem[] = [
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
];
