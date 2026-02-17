import { FuseNavigationItem } from '@fuse/components/navigation';

export const aesanNavigation: FuseNavigationItem[] = [
  {
    id: 'home',
    title: 'navigation.home',
    type: 'basic',
    icon: 'heroicons_solid:home',
    link: '/dashboard',
    roles: ['Evaluator'],
  },
  {
    id: 'evaluation',
    title: 'navigation.sponsorEvaluation',
    type: 'basic',
    icon: 'heroicons_solid:clipboard-document-check',
    link: '/sponsor-evaluation',
    roles: ['Evaluator'],
  },
];
