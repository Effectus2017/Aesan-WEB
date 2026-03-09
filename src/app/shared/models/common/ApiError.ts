import { HttpErrorResponse } from '@angular/common/http';

/** Cuerpo de error de la API cuando es objeto (code, message y opcionales como programId). */
export interface ApiErrorBody {
  code?: string;
  message?: string;
  /** Presente en algunos errores de validación (p. ej. MISSING_STRONG_SERVICE). */
  programId?: number;
}

/** Cuerpo de error de la API: objeto o string (p. ej. PDAM). */
export type ApiErrorBodyOrString = ApiErrorBody | string;

/**
 * Extrae el mensaje de error de un HttpErrorResponse (body objeto, body string o message).
 */
export function getApiErrorMessage(err: HttpErrorResponse): string {
  const body = err?.error;
  if (typeof body === 'object' && body !== null && 'message' in body) {
    return (body as ApiErrorBody).message ?? '';
  }
  if (typeof body === 'string') {
    return body;
  }
  return err?.message ?? '';
}
