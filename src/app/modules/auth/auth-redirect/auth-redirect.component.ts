import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { CustomRouterService } from 'app/shared/services/custom-router.service';

@Component({
  selector: 'auth-redirect',
  templateUrl: './auth-redirect.component.html',
  standalone: true,
})
export class AuthRedirectComponent implements OnInit {
  constructor(private _authService: AuthService, private _customRouter: CustomRouterService) {}

  ngOnInit(): void {
    const userRole = this._authService.getUserRole();

    if (userRole === 'Administrator') {
      this._customRouter.navigate(['example']);
    } else {
      this._customRouter.navigate(['example']);
    }
  }
}
