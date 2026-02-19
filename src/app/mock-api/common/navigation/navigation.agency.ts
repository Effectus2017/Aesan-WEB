import { FuseNavigationItem } from '@fuse/components/navigation';
import { PROGRAM_IDS } from 'app/shared/const';
import { ROLE_KEY_AGENCY_ADMINISTRATOR, ROLE_KEY_AGENCY_USER } from 'app/shared/constants/role-keys';

/**
 * Función helper para obtener el valor de isDayCareHome de manera robusta
 * Retorna: true | false | null
 */
const getIsDayCareHomeBoolean = (): boolean | null => {
  // Primero intentar leer desde localStorage como string
  const isDayCareHomeValue = localStorage.getItem('agencyIsDayCareHome');
  if (isDayCareHomeValue === 'true') return true;
  if (isDayCareHomeValue === 'false') return false;
  if (isDayCareHomeValue === 'null') return null;

  // Si no está en localStorage, intentar leerlo del objeto completo
  const agencyRaw = localStorage.getItem('agency');
  if (agencyRaw) {
    try {
      const agency = JSON.parse(agencyRaw);
      const isDayCareHomeOption = agency?.inscription?.isDayCareHome;
      return isDayCareHomeOption?.booleanValue ?? null;
    } catch {
      return null;
    }
  }

  return null;
};

export const agencyNavigation: FuseNavigationItem[] = [
  {
    id: 'dashboard.agency',
    title: 'navigation.dashboard',
    type: 'basic',
    icon: 'heroicons_solid:home',
    link: '/dashboard',
    roles: [ROLE_KEY_AGENCY_ADMINISTRATOR, ROLE_KEY_AGENCY_USER],
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
    roles: [ROLE_KEY_AGENCY_ADMINISTRATOR],
    permissions: ['DocumentView'],
  },
//   {
//     id: 'sites',
//     title: 'navigation.sites.title',
//     type: 'basic',
//     icon: 'heroicons_outline:academic-cap',
//     link: '/sites',
//     roles: [ROLE_KEY_AGENCY_ADMINISTRATOR],
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
    roles: [ROLE_KEY_AGENCY_ADMINISTRATOR],
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
    roles: [ROLE_KEY_AGENCY_ADMINISTRATOR],
    permissions: ['site.view'],
    hidden: (item) => {
      // Solo mostrar si tiene PACNA Y isDayCareHome es TRUE
      const programsRaw = localStorage.getItem('agencyPrograms');
      if (!programsRaw) return true;

      try {
        const programs = JSON.parse(programsRaw);
        const hasPACNA = programs.some((p: any) => p?.id === PROGRAM_IDS.PACNA);

        if (!hasPACNA) return true;

        const isDayCareHome = getIsDayCareHomeBoolean();
        // Solo mostrar si es explícitamente true
        return isDayCareHome !== true;
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
    roles: [ROLE_KEY_AGENCY_ADMINISTRATOR],
    permissions: ['school.view'],
    hidden: (item) => {
      // Solo mostrar si tiene PACNA Y isDayCareHome es FALSE
      const programsRaw = localStorage.getItem('agencyPrograms');
      if (!programsRaw) return true;

      try {
        const programs = JSON.parse(programsRaw);
        const hasPACNA = programs.some((p: any) => p?.id === PROGRAM_IDS.PACNA);

        if (!hasPACNA) return true;

        const isDayCareHome = getIsDayCareHomeBoolean();
        // Solo mostrar si es explícitamente false
        return isDayCareHome !== false;
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
    roles: [ROLE_KEY_AGENCY_ADMINISTRATOR],
    permissions: ['site.view'],
    hidden: (item) => {
      // Solo mostrar si tiene PACNA Y isDayCareHome es NULL (Ambos)
      const programsRaw = localStorage.getItem('agencyPrograms');
      if (!programsRaw) return true;

      try {
        const programs = JSON.parse(programsRaw);
        const hasPACNA = programs.some((p: any) => p?.id === PROGRAM_IDS.PACNA);

        if (!hasPACNA) return true;

        const isDayCareHome = getIsDayCareHomeBoolean();
        // Solo mostrar si es explícitamente null
        return isDayCareHome !== null;
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
        roles: [ROLE_KEY_AGENCY_ADMINISTRATOR],
        permissions: ['school.view'],
      },
      {
        id: 'sites.homes',
        title: 'navigation.sites.homes',
        type: 'basic',
        icon: 'mat_solid:house',
        link: '/sites-pacna',
        roles: [ROLE_KEY_AGENCY_ADMINISTRATOR],
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
    roles: [ROLE_KEY_AGENCY_ADMINISTRATOR],
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
    roles: [ROLE_KEY_AGENCY_ADMINISTRATOR],
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
    //     roles: [ROLE_KEY_AGENCY_ADMINISTRATOR],
    //     permissions: ['staff.create'],
    //   },
      {
        id: 'staff.employees',
        title: 'navigation.staff.employees',
        type: 'basic',
        icon: 'heroicons_solid:users',
        link: '/staff/employees',
        roles: [ROLE_KEY_AGENCY_ADMINISTRATOR],
        permissions: ['staff.view'],
      },
      {
        id: 'staff.board-members',
        title: 'navigation.staff.board-members',
        type: 'basic',
        icon: 'heroicons_solid:user-group',
        link: '/staff/board-members',
        roles: [ROLE_KEY_AGENCY_ADMINISTRATOR],
        permissions: ['staff.view'],
      },
    ],
    roles: [ROLE_KEY_AGENCY_ADMINISTRATOR],
    permissions: ['staff.view'],
  },
  {
    id: 'reports.agency',
    title: 'navigation.reports',
    type: 'basic',
    icon: 'heroicons_solid:document-chart-bar',
    link: '/reports',
    roles: [ROLE_KEY_AGENCY_ADMINISTRATOR],
    permissions: ['ReportView'],
  },
];
