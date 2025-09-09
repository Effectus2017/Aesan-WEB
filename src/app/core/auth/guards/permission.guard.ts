import { Injectable, inject } from "@angular/core";
import { CanActivate, Router, ActivatedRouteSnapshot } from "@angular/router";
import { AuthService } from "../auth.service";
import { NotificationService } from "app/shared/services/notification.service";

@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate {
  private _notificationService = inject(NotificationService);

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const permission = route.data['permission'];

    // Debug logging
    console.log('PermissionGuard - Checking permission:', permission);
    console.log('PermissionGuard - User permissions:', this.auth.permissions);
    console.log('PermissionGuard - Has permission:', this.auth.hasPermission(permission));

    // Si no se especifica permiso, permitir acceso
    if (!permission) {
      console.log('PermissionGuard - No permission required, allowing access');
      return true;
    }

    // Verificar si el usuario tiene el permiso requerido
    if (!this.auth.hasPermission(permission)) {
      console.log('PermissionGuard - Access denied, showing error dialog');
      // Mostrar diálogo de error de acceso denegado
      this._notificationService.showErrorDialog('No tiene permisos para acceder a esta sección');
      return false;
    }

    console.log('PermissionGuard - Access granted');
    return true;
  }
}
