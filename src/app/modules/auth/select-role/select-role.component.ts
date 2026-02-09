import { NgForOf, NgIf } from '@angular/common';
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { TranslocoModule } from '@ngneat/transloco';
import { AuthService } from 'app/core/auth/auth.service';
import { LanguagesComponent } from 'app/layout/common/languages/languages.component';
import { AESAN_ROLES } from 'app/shared/constants/aesan-roles.constants';

const SELECT_ROLE_STORAGE_KEY = 'pendingAesanRoles';

@Component({
  selector: 'auth-select-role',
  templateUrl: './select-role.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
  imports: [
    NgForOf,
    NgIf,
    RouterLink,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    FuseAlertComponent,
    TranslocoModule,
    LanguagesComponent,
  ],
})
export class AuthSelectRoleComponent implements OnInit {
  private _authService = inject(AuthService);
  private _router = inject(Router);

  roles: string[] = [];
  selectedRole: string | null = null;
  isLoading = false;
  alert: { type: FuseAlertType; message: string } = {
    type: 'error',
    message: '',
  };
  showAlert = false;

  /** Etiquetas de rol para i18n */
  readonly roleLabels: Record<string, string> = {
    Administrator: 'select-role.roles.Administrator',
    Monitor: 'select-role.roles.Monitor',
    SuperAdmin: 'select-role.roles.SuperAdmin',
    'Program-Coordinator': 'select-role.roles.ProgramCoordinator',
  };

  ngOnInit(): void {
    const stored = sessionStorage.getItem(SELECT_ROLE_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as string[];
        this.roles = (parsed ?? []).filter((r) => AESAN_ROLES.includes(r as any));
      } catch {
        this.roles = [];
      }
    }

    if (this.roles.length < 2) {
      sessionStorage.removeItem(SELECT_ROLE_STORAGE_KEY);
      this._router.navigateByUrl('/signed-in-redirect');
    }
  }

  selectRole(role: string | null): void {
    if (this.isLoading || !role) return;

    this.selectedRole = role;
    this.isLoading = true;
    this.showAlert = false;

    this._authService.selectRole(role).subscribe({
      next: () => {
        sessionStorage.removeItem(SELECT_ROLE_STORAGE_KEY);
        this._router.navigateByUrl('/auth-redirect');
      },
      error: (err) => {
        this.isLoading = false;
        this.selectedRole = null;
        const msg = err?.error?.message ?? (err?.status === 401 ? 'select-role.error.unauthorized' : 'select-role.error.server');
        this.alert = { type: 'error', message: msg };
        this.showAlert = true;
      },
    });
  }

  getRoleLabel(role: string): string {
    return this.roleLabels[role] ?? role;
  }
}
