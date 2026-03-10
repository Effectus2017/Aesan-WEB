import { HttpContextToken } from '@angular/common/http';

/**
 * Token de contexto para omitir el manejo global de errores en una petición específica.
 * Uso:
 * this.http.get('/api/data', { context: new HttpContext().set(SKIP_GLOBAL_ERROR, true) })
 */
export const SKIP_GLOBAL_ERROR = new HttpContextToken<boolean>(() => false);
