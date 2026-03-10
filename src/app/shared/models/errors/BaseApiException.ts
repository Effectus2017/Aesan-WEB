import { ErrorCode } from './ErrorCode';

/**
 * Modelo de error unificado que coincide con BaseApiException del backend
 */
export interface BaseApiException {
    /** Código de error específico enum */
    code: ErrorCode;
    /** Mensaje de error principal */
    message: string;
}
