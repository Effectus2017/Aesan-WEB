/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
  {
    id: 'home',
    title: 'Inicio',
    type: 'basic',
    icon: 'hero:home',
    link: '/example',
  },
  {
    id: 'documents',
    title: 'Documentos',
    type: 'basic',
    icon: 'heroicons_solid:document',
    link: '/documents', // Nueva ruta para Documentos
  },
  {
    id: 'budget',
    title: 'Presupuesto',
    type: 'basic',
    icon: 'heroicons_solid:cash',
    link: '/budget', // Nueva ruta para Presupuesto
  },
  {
    id: 'reimbursements',
    title: 'Rembolsos',
    type: 'basic',
    icon: 'heroicons_solid:cash',
    link: '/refunds', // Nueva ruta para Rembolsos
  },
  {
    id: 'example',
    title: 'Example',
    type: 'basic',
    icon: 'heroicons_solid:chart-pie',
    link: '/example',
  },
];
export const compactNavigation: FuseNavigationItem[] = [
  {
    id: 'home',
    title: 'Dashboard',
    type: 'basic',
    icon: 'heroicons_solid:chart-bar',
    link: '/example',
    roles: ['Administrator'],
  },
  {
    id: 'programs',
    title: 'Validación de Programas',
    type: 'basic',
    icon: 'heroicons_solid:home',
    link: '/validation-to-program',
    roles: ['Administrator'],
  },
  {
    id: 'pre-operational',
    title: 'Pre-Operacional',
    type: 'basic',
    icon: 'heroicons_solid:check-badge',
    link: '/pre-operational',
    roles: ['Monitor'],
  },
  {
    id: 'documents',
    title: 'Documentos',
    type: 'basic',
    icon: 'heroicons_solid:document',
    link: '/documents', // Nueva ruta para Documentos
    roles: ['Administrator'],
  },
  {
    id: 'budget',
    title: 'Presupuesto',
    type: 'basic',
    icon: 'heroicons_solid:banknotes',
    link: '/budget', // Nueva ruta para Presupuesto
    roles: ['Administrator'],
  },
  {
    id: 'reimbursements',
    title: 'Rembolsos',
    type: 'basic',
    icon: 'heroicons_solid:banknotes',
    link: '/refunds', // Nueva ruta para Rembolsos
    roles: ['Administrator'],
  }
];
