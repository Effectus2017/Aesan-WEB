import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { catchError, Observable, throwError } from 'rxjs';

/**
 * Intercept
 *
 * @param req
 * @param next
 */
export const authInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> =>
{
    const authService = inject(AuthService);
    const router = inject(Router);

    // Clone the request object
    let newReq = req.clone();

    // Request
    //
    // Si hay token y no está expirado, añadir el header Authorization.
    if ( authService.accessToken && !AuthUtils.isTokenExpired(authService.accessToken) )
    {
        newReq = req.clone({
            headers: req.headers.set('Authorization', 'Bearer ' + authService.accessToken),
        });
    }

    // Response
    return next(newReq).pipe(
        catchError((error) =>
        {
            // Catch "401 Unauthorized" responses
            if ( error instanceof HttpErrorResponse )
            {
                if (error.status === 401 || error.status === 403)
                {
                    authService.signOut();
                    router.navigate(['sign-in']);
                }
                // Catch connection errors (status 0)
                else if (error.status === 0)
                {
                    // Sign out
                    authService.signOut();

                    // Redirect to sign-in page with error parameter
                    router.navigate(['sign-in'], {
                        queryParams: {
                            error: 'connection'
                        }
                    });
                }
            }

            return throwError(() => error);
        }),
    );
};
