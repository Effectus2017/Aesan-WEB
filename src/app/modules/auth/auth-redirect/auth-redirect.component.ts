import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { CustomRouterService } from 'app/shared/services/custom-router.service';

@Component({
  selector: 'auth-redirect',
  templateUrl: './auth-redirect.component.html',
  standalone: true,
})
export class AuthRedirectComponent implements OnInit {
  private _authService = inject(AuthService);
  private _customRouter = inject(CustomRouterService);
  private _router = inject(Router);

  ngOnInit(): void {
    // Usar setTimeout para asegurar que el componente esté completamente inicializado
    setTimeout(() => {
      this.handleRedirect();
    }, 0);
  }

  private handleRedirect(): void {
    try {
      // Verificar que el token existe y es válido
      const accessToken = this._authService.accessToken;
      if (!accessToken) {
        console.warn('AuthRedirectComponent: No access token found, redirecting to sign-in');
        this.redirectToSignIn();
        return;
      }

      // Obtener el rol del usuario con manejo de errores
      let userRole: string | null = null;
      try {
        userRole = this._authService.getUserRole();
      } catch (error) {
        console.error('AuthRedirectComponent: Error getting user role:', error);
        // Si hay error al obtener el rol, limpiar el token y redirigir a sign-in
        this._authService.signOut().subscribe(() => {
          this.redirectToSignIn();
        });
        return;
      }

      // Si no hay rol, redirigir a sign-in
      if (!userRole) {
        console.warn('AuthRedirectComponent: No user role found, redirecting to sign-in');
        this._authService.signOut().subscribe(() => {
          this.redirectToSignIn();
        });
        return;
      }

      // Determinar la ruta de destino según el rol
      const targetRoute = this.getTargetRoute(userRole);

      // Intentar navegar con timeout
      this.navigateWithTimeout(targetRoute);
    } catch (error) {
      console.error('AuthRedirectComponent: Unexpected error during redirect:', error);
      // En caso de error inesperado, redirigir a sign-in
      this._authService.signOut().subscribe(() => {
        this.redirectToSignIn();
      });
    }
  }

  private getTargetRoute(userRole: string): string[] {
    switch (userRole) {
      case 'Administrator':
      case 'SuperAdmin':
        return ['sponsors'];
      case 'Agency-Administrator':
      case 'Agency-User':
        return ['dashboard'];
      case 'Monitor':
      case 'Program-Coordinator':
        return ['dashboard'];
      default:
        return ['sponsors'];
    }
  }

  private navigateWithTimeout(targetRoute: string[]): void {
    // Intentar navegar con CustomRouterService
    this._customRouter
      .navigate(targetRoute)
      .then((success: boolean) => {
        if (!success) {
          console.warn('AuthRedirectComponent: Navigation failed, trying direct router navigation');
          // Si falla, intentar con Router directo
          this._router.navigate(targetRoute).catch((error) => {
            console.error('AuthRedirectComponent: Direct navigation also failed:', error);
            this.redirectToSignIn();
          });
        }
      })
      .catch((error) => {
        console.error('AuthRedirectComponent: Navigation error:', error);
        // Si hay error, intentar con Router directo
        this._router.navigate(targetRoute).catch((routerError) => {
          console.error('AuthRedirectComponent: Direct navigation also failed:', routerError);
          this.redirectToSignIn();
        });
      });

    // Timeout de seguridad: si después de 5 segundos no se ha navegado, redirigir a sign-in
    setTimeout(() => {
      const currentUrl = this._router.url;
      if (currentUrl === '/auth-redirect') {
        console.warn('AuthRedirectComponent: Navigation timeout, redirecting to sign-in');
        this._authService.signOut().subscribe(() => {
          this.redirectToSignIn();
        });
      }
    }, 5000);
  }

  private redirectToSignIn(): void {
    this._router.navigate(['/sign-in']).catch((error) => {
      console.error('AuthRedirectComponent: Failed to redirect to sign-in:', error);
      // Último recurso: recargar la página
      window.location.href = '/sign-in';
    });
  }
}
