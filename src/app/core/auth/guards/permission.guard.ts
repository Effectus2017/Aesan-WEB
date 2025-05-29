import { Injectable } from "@angular/core";
import { CanActivate, Router, ActivatedRouteSnapshot } from "@angular/router";
import { AuthService } from "../auth.service";

@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const permission = route.data['permission'];
    if (!this.auth.hasPermission(permission)) {
      this.router.navigate(['/not-authorized']);
      return false;
    }
    return true;
  }
}
