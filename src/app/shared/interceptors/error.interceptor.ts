import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { SKIP_GLOBAL_ERROR } from './error.context';
import { BaseApiException } from '../models/errors/BaseApiException';

/**
 * Interceptor global para el manejo de errores de la API.
 * Captura las respuestas 4xx/5xx y muestra un diálogo de error estandarizado
 * a menos que se especifique lo contrario mediante HttpContext.
 * NotificationService se resuelve de forma diferida (Injector) para evitar dependencia circular
 * con HttpClient durante el bootstrap (p. ej. carga de traducciones o iconos).
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(Injector);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si la petición tiene el token SKIP_GLOBAL_ERROR activo, omitimos el manejo global
      if (req.context.get(SKIP_GLOBAL_ERROR)) {
        return throwError(() => error);
      }

      // Extraemos el mensaje del objeto estandarizado BaseApiException {code, message}
      let message = 'Ocurrió un error inesperado';

      if (error.error && typeof error.error === 'object') {
        const apiException = error.error as BaseApiException;
        if (apiException.message) {
          message = apiException.message;
        }
      } else if (typeof error.error === 'string' && error.error.length > 0) {
        message = error.error;
      }

      // Resolución diferida para romper el ciclo DI con NotificationService en el arranque
      injector.get(NotificationService).showErrorDialogWithRawMessage(message);

      // Propagamos el error para que el componente también pueda reaccionar si lo necesita
      return throwError(() => error);
    })
  );
};
