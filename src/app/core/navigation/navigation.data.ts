import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id      : 'dashboard',
        title   : 'Dashboard',
        type    : 'basic',
        icon    : 'heroicons_outline:home',
        link    : '/dashboard'
    },
    {
        id      : 'documentos',
        title   : 'Documentos',
        type    : 'basic',
        icon    : 'heroicons_outline:document-text',
        link    : '/documentos'
    },
    {
        id      : 'presupuesto',
        title   : 'Presupuesto',
        type    : 'basic',
        icon    : 'heroicons_outline:currency-dollar',
        link    : '/presupuesto'
    },
    {
        id      : 'reembolsos',
        title   : 'Reembolsos',
        type    : 'basic',
        icon    : 'heroicons_outline:receipt-refund',
        link    : '/reembolsos'
    }
];
