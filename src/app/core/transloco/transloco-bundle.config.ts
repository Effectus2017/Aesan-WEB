/**
 * Carpetas bajo `assets/i18n/<carpeta>/<lang>.json` agrupadas por área de la app.
 * El índice principal (`file-index.json`) solo incluye traducciones del shell (core);
 * el resto se fusiona vía {@link TranslocoBundleLoaderService} al entrar en cada portal / auth.
 */
export type TranslocoBundleId = 'auth' | 'admin-portal' | 'agency-portal' | 'aesan-portal';

export const TRANSLOCO_BUNDLES: Record<TranslocoBundleId, readonly string[]> = {
  auth: [
    'forgot-password',
    'reset-password',
    'update-password',
    'sign-up',
    'sign-in',
    'select-role',
    'sign-out',
    'cfr-info-dialog',
  ],
  'admin-portal': [
    'staff',
    'sites',
    'schools',
    'centers',
    'users',
    'validation-to-program',
    'staff-classification',
    'employees',
    'households',
    'staff-type',
    'organization-type',
    'center-types',
    'delivery-type',
    'sponsor-type',
    'kitchen-types',
    'group-types',
    'permissions',
    'operating-policy',
    'email-template',
    'email-logs',
    'logs',
    'message-template',
    'template-variables',
    'reports',
    'roles',
    'role-extension',
    'agency-status',
    'agency-status-history',
  ],
  'agency-portal': [
    'staff',
    'sites',
    'schools',
    'centers',
    'users',
    'program-requests',
    'employees',
    'households',
    'staff-classification',
    'legibility',
  ],
  'aesan-portal': ['aesan-dashboard', 'sponsor-evaluation', 'users'],
};
