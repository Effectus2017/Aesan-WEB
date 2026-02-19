/**
 * Claves únicas de roles (Name en BD). Usar para comparaciones de lógica, guards y navegación.
 * Los nombres a mostrar están en DisplayName/DisplayNameEN desde la API.
 */
export const ROLE_KEY_ADMINISTRATOR = 'administrator';
export const ROLE_KEY_SUPER_ADMINISTRATOR = 'super_administrator';
export const ROLE_KEY_AGENCY_ADMINISTRATOR = 'agency_administrator';
export const ROLE_KEY_AGENCY_USER = 'agency_user';

export const ROLE_KEYS_ADMIN = [ROLE_KEY_ADMINISTRATOR, ROLE_KEY_SUPER_ADMINISTRATOR] as const;
export const ROLE_KEYS_AGENCY = [ROLE_KEY_AGENCY_ADMINISTRATOR, ROLE_KEY_AGENCY_USER] as const;

export function isAdminRole(role: string | null | undefined): boolean {
  return role === ROLE_KEY_ADMINISTRATOR || role === ROLE_KEY_SUPER_ADMINISTRATOR;
}

export function isAgencyRole(role: string | null | undefined): boolean {
  return role === ROLE_KEY_AGENCY_ADMINISTRATOR || role === ROLE_KEY_AGENCY_USER;
}
