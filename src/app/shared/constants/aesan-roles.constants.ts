/**
 * Roles AESAN para portales admin-portal y aesan-portal.
 * Usados para la selección de rol en usuarios multi-rol.
 */
export const AESAN_ROLES = ['Administrator', 'Monitor', 'SuperAdmin', 'Program-Coordinator'] as const;

export type AesanRole = (typeof AESAN_ROLES)[number];

export function isAesanRole(role: string): role is AesanRole {
  return AESAN_ROLES.includes(role as AesanRole);
}
