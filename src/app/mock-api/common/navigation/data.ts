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
    title: 'Inicio',
    type: 'basic',
    icon: 'heroicons_solid:home',
    link: '/example',
  },
  {
    id: 'programs',
    title: 'Validación de Programas',
    type: 'basic',
    icon: 'heroicons_solid:home',
    link: '/validation-to-program',
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
    icon: 'heroicons_solid:banknotes',
    link: '/budget', // Nueva ruta para Presupuesto
  },
  {
    id: 'reimbursements',
    title: 'Rembolsos',
    type: 'basic',
    icon: 'heroicons_solid:banknotes',
    link: '/refunds', // Nueva ruta para Rembolsos
  }
];
