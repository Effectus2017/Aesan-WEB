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
    // If the access token didn't expire, add the Authorization header.
    // We won't add the Authorization header if the access token expired.
    // This will force the server to return a "401 Unauthorized" response
    // for the protected API routes which our response interceptor will
    // catch and delete the access token from the local storage while logging
    // the user out from the app.
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
                    // Sign out
                    authService.signOut();

                    // Redirect to sign-in page
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
