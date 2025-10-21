import { FuseNavigationItem } from '@fuse/components/navigation';

export interface Navigation {
    admin?: FuseNavigationItem[];
    agency?: FuseNavigationItem[];
    aesan?: FuseNavigationItem[];
    shared?: FuseNavigationItem[];
    // Compatibilidad con layouts antiguos
    compact?: FuseNavigationItem[];
    default?: FuseNavigationItem[];
    futuristic?: FuseNavigationItem[];
    horizontal?: FuseNavigationItem[];
}
