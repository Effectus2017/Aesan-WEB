/**
 * Constantes centralizadas para errores de validación de formularios.
 * Usar estas constantes en lugar de crear objetos literales inline.
 */

import {
  RequiredValidationError,
  PasswordNotMatchValidationError,
  InvalidEmailFormatValidationError,
  DateRangeValidationError,
} from 'app/modules/admin-portal/users/users.types';

export const VALIDATION_ERRORS = {
  /** Error de campo requerido */
  REQUIRED: { required: true } as RequiredValidationError,

  /** Error cuando las contraseñas no coinciden */
  PASSWORD_NOT_MATCH: { passwordNotMatch: true } as PasswordNotMatchValidationError,

  /** Error de formato de email inválido */
  INVALID_EMAIL_FORMAT: { invalidEmailFormat: true } as InvalidEmailFormatValidationError,

  /** Error cuando el rango de fechas es inválido (fecha fin anterior a fecha inicio) */
  DATE_RANGE: { dateRange: true } as DateRangeValidationError,
} as const;
