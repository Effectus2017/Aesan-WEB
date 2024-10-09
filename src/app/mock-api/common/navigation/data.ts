/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
  {
    id: 'home',
    title: 'Inicio',
    type: 'basic',
    icon: 'heroicons_outline:home',
    link: '/home',
  },
  {
    id: 'documents',
    title: 'Documentos',
    type: 'basic',
    icon: 'heroicons_outline:document',
    link: '/documents', // Nueva ruta para Documentos
  },
  {
    id: 'budget',
    title: 'Presupuesto',
    type: 'basic',
    icon: 'heroicons_outline:cash',
    link: '/budget', // Nueva ruta para Presupuesto
  },
  {
    id: 'reimbursements',
    title: 'Rembolsos',
    type: 'basic',
    icon: 'heroicons_outline:cash',
    link: '/reimbursements', // Nueva ruta para Rembolsos
  },
  {
    id: 'example',
    title: 'Example',
    type: 'basic',
    icon: 'heroicons_outline:chart-pie',
    link: '/example',
  },
];
export const compactNavigation: FuseNavigationItem[] = [
  {
    id: 'home',
    title: 'Inicio',
    type: 'basic',
    icon: 'heroicons_outline:home',
    link: '/home',
  },
  {
    id: 'documents',
    title: 'Documentos',
    type: 'basic',
    icon: 'heroicons_outline:document',
    link: '/documents', // Nueva ruta para Documentos
  },
  {
    id: 'budget',
    title: 'Presupuesto',
    type: 'basic',
    icon: 'heroicons_outline:banknotes',
    link: '/budget', // Nueva ruta para Presupuesto
  },
  {
    id: 'reimbursements',
    title: 'Rembolsos',
    type: 'basic',
    icon: 'heroicons_outline:banknotes',
    link: '/reimbursements', // Nueva ruta para Rembolsos
  }
];
