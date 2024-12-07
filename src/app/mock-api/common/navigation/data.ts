/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

// Navegación para el portal de agencias
export const agencyNavigation: FuseNavigationItem[] = [
    {
        id: 'agency-home',
        title: 'Inicio',
        type: 'basic',
        icon: 'heroicons_outline:home',
        link: '/agency-portal/home'
    },
    {
        id: 'program-requests',
        title: 'Solicitudes al Programa',
        type: 'basic',
        icon: 'heroicons_outline:document-text',
        link: '/agency-portal/program-requests'
    },
    {
        id: 'documents',
        title: 'Documentos',
        type: 'basic',
        icon: 'heroicons_outline:document',
        link: '/agency-portal/documents'
    },
    {
        id: 'budget',
        title: 'Presupuesto',
        type: 'basic',
        icon: 'heroicons_outline:currency-dollar',
        link: '/agency-portal/budget'
    },
    {
        id: 'reimbursements',
        title: 'Reembolsos',
        type: 'basic',
        icon: 'heroicons_outline:receipt-refund',
        link: '/agency-portal/reimbursements'
    }
];

// Mantener las navegaciones existentes...
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
  {
    id: 'program-requests',
    title: 'Solicitudes al Programa',
    type: 'basic',
    icon: 'heroicons_outline:document-text',
    link: '/agency-portal/program-requests',
    roles: ['Agency']
  }
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
