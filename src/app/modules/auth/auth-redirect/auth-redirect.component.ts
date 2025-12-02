import { Component, inject, OnInit } from '@angular/core';
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

  ngOnInit(): void {
    const userRole = this._authService.getUserRole();

    switch (userRole) {
      case 'Administrator':
        this._customRouter.navigate(['sponsors']);
        break;
      case 'Agency-Administrator':
        this._customRouter.navigate(['program-requests']);
        break;
      case 'Agency-User':
        this._customRouter.navigate(['program-requests']);
        break;
      case 'Monitor':
        this._customRouter.navigate(['dashboard']);
        break;
      default:
        this._customRouter.navigate(['sponsor-evaluation']);
        break;
    }
  }
}
