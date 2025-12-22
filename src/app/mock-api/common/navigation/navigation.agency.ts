import { FuseNavigationItem } from '@fuse/components/navigation';
import { PROGRAM_IDS } from 'app/shared/const';

export const agencyNavigation: FuseNavigationItem[] = [
  {
    id: 'dashboard.agency',
    title: 'navigation.dashboard',
    type: 'basic',
    icon: 'heroicons_solid:home',
    link: '/dashboard',
    roles: ['Agency-Administrator', 'Agency-User'],
  },
  {
    id: 'legibility',
    title: 'navigation.legibility',
    type: 'basic',
    icon: 'heroicons_solid:document-text',
    link: '/legibility',
    permissions: ['LegibilityView'],
  },
  // Otros ítems específicos de Agency-Administrator
  {
    id: 'documents.agency',
    title: 'navigation.documents',
    type: 'basic',
    icon: 'heroicons_solid:document-duplicate',
    link: '/documents',
    roles: ['Agency-Administrator'],
    permissions: ['DocumentView'],
  },
//   {
//     id: 'sites',
//     title: 'navigation.sites.title',
//     type: 'basic',
//     icon: 'heroicons_outline:academic-cap',
//     link: '/sites',
//     roles: ['Agency-Administrator'],
//     permissions: ['site.view'],
//     hidden: (item) => {
//       const programsRaw = localStorage.getItem('agencyPrograms');
//       if (!programsRaw) return false;
//       try {
//         const programs = JSON.parse(programsRaw);
//         return programs.some((p: any) => p?.id === PROGRAM_IDS.PACNA);
//       } catch {
//         return false;
//       }
//     },
//   },
  {
    id: 'schools',
    title: 'navigation.schools',
    type: 'basic',
    icon: 'heroicons_solid:academic-cap',
    link: '/schools',
    roles: ['Agency-Administrator'],
    permissions: ['school.view'],
    hidden: (item) => {
      const programsRaw = localStorage.getItem('agencyPrograms');
      if (!programsRaw) return false;
      try {
        const programs = JSON.parse(programsRaw);
        return programs.some((p: any) => p?.id === PROGRAM_IDS.PACNA);
      } catch {
        return false;
      }
    },
  },
  {
    id: 'sites-pacna',
    title: 'navigation.sites.homes',
    type: 'basic',
    icon: 'heroicons_solid:academic-cap',
    link: '/sites-pacna',
    roles: ['Agency-Administrator'],
    permissions: ['site.view'],
    hidden: (item) => {
      // Solo mostrar si tiene PACNA Y isDayCareHome es TRUE
      const programsRaw = localStorage.getItem('agencyPrograms');
      if (!programsRaw) return true;

      try {
        const programs = JSON.parse(programsRaw);
        const hasPACNA = programs.some((p: any) => p?.id === PROGRAM_IDS.PACNA);

        if (!hasPACNA) return true;

        // Leer isDayCareHome booleanValue - puede estar guardado como string "true"/"false"/"null"
        const isDayCareHomeValue = localStorage.getItem('agencyIsDayCareHome');
        // Ocultar si es null (mostrar grupo en su lugar) o si no es true
        if (isDayCareHomeValue === 'null') return true;
        if (isDayCareHomeValue === 'true') {
          return false; // Mostrar el ítem
        }

        // Si no está guardado como string, intentar leerlo del objeto completo
        const agencyRaw = localStorage.getItem('agency');
        if (agencyRaw) {
          const agency = JSON.parse(agencyRaw);
          const isDayCareHomeOption = agency?.inscription?.isDayCareHome;
          if (isDayCareHomeOption?.booleanValue === null || isDayCareHomeOption?.booleanValue === undefined) {
            return true; // Ocultar si es null (mostrar grupo)
          }
          if (isDayCareHomeOption?.booleanValue === true) {
            return false; // Mostrar el ítem
          }
        }

        return true; // Ocultar si no es true
      } catch {
        return true;
      }
    },
  },
  {
    id: 'centers',
    title: 'navigation.centers',
    type: 'basic',
    icon: 'heroicons_solid:academic-cap',
    link: '/centers',
    roles: ['Agency-Administrator'],
    permissions: ['school.view'],
    hidden: (item) => {
      // Solo mostrar si tiene PACNA Y isDayCareHome es FALSE
      const programsRaw = localStorage.getItem('agencyPrograms');
      if (!programsRaw) return true;

      try {
        const programs = JSON.parse(programsRaw);
        const hasPACNA = programs.some((p: any) => p?.id === PROGRAM_IDS.PACNA);

        if (!hasPACNA) return true;

        // Leer isDayCareHome booleanValue - debe ser "false"
        const isDayCareHomeValue = localStorage.getItem('agencyIsDayCareHome');
        // Ocultar si es null (mostrar grupo en su lugar) o si no es false
        if (isDayCareHomeValue === 'null') return true;
        if (isDayCareHomeValue === 'false') {
          return false; // Mostrar el ítem
        }

        // Si no está guardado como string, intentar leerlo del objeto completo
        const agencyRaw = localStorage.getItem('agency');
        if (agencyRaw) {
          const agency = JSON.parse(agencyRaw);
          const isDayCareHomeOption = agency?.inscription?.isDayCareHome;
          if (isDayCareHomeOption?.booleanValue === null || isDayCareHomeOption?.booleanValue === undefined) {
            return true; // Ocultar si es null (mostrar grupo)
          }
          if (isDayCareHomeOption?.booleanValue === false) {
            return false; // Mostrar el ítem
          }
        }

        return true; // Ocultar si no es false
      } catch {
        return true;
      }
    },
  },
  {
    id: 'sites-pacna-group',
    title: 'navigation.sites.centersAndHomes',
    type: 'group',
    icon: 'mat_solid:home_work',
    roles: ['Agency-Administrator'],
    permissions: ['site.view'],
    hidden: (item) => {
      // Solo mostrar si tiene PACNA Y isDayCareHome es NULL (Ambos)
      const programsRaw = localStorage.getItem('agencyPrograms');
      if (!programsRaw) return true;

      try {
        const programs = JSON.parse(programsRaw);
        const hasPACNA = programs.some((p: any) => p?.id === PROGRAM_IDS.PACNA);

        if (!hasPACNA) return true;

        // Leer isDayCareHome booleanValue - debe ser "null"
        const isDayCareHomeValue = localStorage.getItem('agencyIsDayCareHome');
        if (isDayCareHomeValue === 'null') {
          return false; // Mostrar el grupo
        }

        // Si no está guardado como string, intentar leerlo del objeto completo
        const agencyRaw = localStorage.getItem('agency');
        if (agencyRaw) {
          const agency = JSON.parse(agencyRaw);
          const isDayCareHomeOption = agency?.inscription?.isDayCareHome;
          if (isDayCareHomeOption?.booleanValue === null || isDayCareHomeOption?.booleanValue === undefined) {
            return false; // Mostrar el grupo
          }
        }

        return true; // Ocultar si no es null
      } catch {
        return true;
      }
    },
    children: [
      {
        id: 'sites.centers',
        title: 'navigation.sites.centers',
        type: 'basic',
        icon: 'heroicons_solid:academic-cap',
        link: '/centers',
        roles: ['Agency-Administrator'],
        permissions: ['school.view'],
      },
      {
        id: 'sites.homes',
        title: 'navigation.sites.homes',
        type: 'basic',
        icon: 'mat_solid:house',
        link: '/sites-pacna',
        roles: ['Agency-Administrator'],
        permissions: ['site.view'],
      },
    ],
  },
  {
    id: 'forms.agency',
    title: 'navigation.forms.title',
    type: 'group',
    icon: 'heroicons_solid:clipboard-document-list',
    children: [
      {
        id: 'forms.agency.pdam-solicitud',
        title: 'navigation.forms.pdam-solicitud',
        type: 'basic',
        icon: 'heroicons_solid:document',
        link: '/forms/pdam-solicitud',
      },
      {
        id: 'forms.agency.psav-solicitud',
        title: 'navigation.forms.psav-solicitud',
        type: 'basic',
        icon: 'heroicons_solid:document',
        link: '/forms/psav-solicitud',
      },
    ],
    roles: ['Agency-Administrator'],
    permissions: ['FormView'],
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
    permissions: ['AccountingView'],
  },
  {
    id: 'staff',
    title: 'navigation.staff.title',
    type: 'group',
    icon: 'heroicons_solid:user-group',
    children: [
    //   {
    //     id: 'staff.add',
    //     title: 'navigation.staff.add',
    //     type: 'basic',
    //     icon: 'mat_solid:add',
    //     link: '/staff/add',
    //     roles: ['Agency-Administrator'],
    //     permissions: ['staff.create'],
    //   },
      {
        id: 'staff.employees',
        title: 'navigation.staff.employees',
        type: 'basic',
        icon: 'heroicons_solid:users',
        link: '/staff/employees',
        roles: ['Agency-Administrator'],
        permissions: ['staff.view'],
      },
      {
        id: 'staff.board-members',
        title: 'navigation.staff.board-members',
        type: 'basic',
        icon: 'heroicons_solid:user-group',
        link: '/staff/board-members',
        roles: ['Agency-Administrator'],
        permissions: ['staff.view'],
      },
    ],
    roles: ['Agency-Administrator'],
    permissions: ['staff.view'],
  },
  {
    id: 'reports.agency',
    title: 'navigation.reports',
    type: 'basic',
    icon: 'heroicons_solid:document-chart-bar',
    link: '/reports',
    roles: ['Agency-Administrator'],
    permissions: ['ReportView'],
  },
];
