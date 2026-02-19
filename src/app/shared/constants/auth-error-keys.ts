/**
 * Claves de error de autenticación.
 * Usar para query params (redirects), comparaciones y claves i18n, evitando strings mágicos.
 */

/** Valor del query param `error` cuando el usuario de agencia no tiene agencia asignada (p. ej. /sign-in?error=no-agency-assigned). */
export const AUTH_ERROR_QUERY_NO_AGENCY_ASSIGNED = 'no-agency-assigned';

/** Clave i18n para el mensaje en la pantalla de sign-in (usuario de agencia sin agencia asignada). */
export const AUTH_ERROR_I18N_SIGN_IN_NO_AGENCY_ASSIGNED = 'sign-in.error.no-agency-assigned';

/** Clave i18n para el mensaje en la pantalla de select-role (usuario de agencia sin agencia asignada). */
export const AUTH_ERROR_I18N_SELECT_ROLE_NO_AGENCY_ASSIGNED = 'select-role.error.no-agency-assigned';
