import { FuseNavigationItem } from '@fuse/components/navigation';

export const adminNavigation: FuseNavigationItem[] = [
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
      {
        id: 'administration.kitchen-types',
        title: 'navigation.administration.kitchen-types',
        type: 'basic',
        icon: 'heroicons_solid:building-office',
        link: '/kitchen-type',
      },
      {
        id: 'administration.group-types',
        title: 'navigation.administration.group-types',
        type: 'basic',
        icon: 'heroicons_solid:building-office',
        link: '/group-type',
      },
      {
        id: 'administration.sponsor-types',
        title: 'navigation.administration.sponsor-types',
        type: 'basic',
        icon: 'heroicons_solid:building-office',
        link: '/sponsor-type',
      },
      {
        id: 'administration.operating-policies',
        title: 'navigation.administration.operating-policies',
        type: 'basic',
        icon: 'heroicons_solid:building-office',
        link: '/operating-policy',
      },
    ],
    roles: ['Administrator'],
  },
  {
    id: 'users',
    title: 'navigation.users.title',
    type: 'group',
    icon: 'heroicons_solid:user',
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
      {
        id: 'permissions.list',
        title: 'navigation.users.permissions',
        type: 'basic',
        icon: 'mat_solid:lock',
        link: '/permissions',
      }
    ],
  },
];
