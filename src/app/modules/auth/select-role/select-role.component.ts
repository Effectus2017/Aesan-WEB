import { NgForOf, NgIf } from '@angular/common';
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { AuthService } from 'app/core/auth/auth.service';
import { LanguagesComponent } from 'app/layout/common/languages/languages.component';
import { UsersService } from 'app/shared/services/users.service';

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
  private _usersService = inject(UsersService);
  private _transloco = inject(TranslocoService);

  roles: string[] = [];
  selectedRole: string | null = null;
  isLoading = true;
  alert: { type: FuseAlertType; message: string } = {
    type: 'error',
    message: '',
  };
  showAlert = false;

  ngOnInit(): void {
    const stored = sessionStorage.getItem(SELECT_ROLE_STORAGE_KEY);
    const storedRoles: string[] = stored ? (() => { try { return JSON.parse(stored) ?? []; } catch { return []; } })() : [];

    this._usersService.getAesanRolesFromDb().subscribe({
      next: (aesanRoles) => {
        this.roles = storedRoles.filter((r) => aesanRoles.includes(r));
        this.isLoading = false;
        if (this.roles.length < 2) {
          sessionStorage.removeItem(SELECT_ROLE_STORAGE_KEY);
          this._router.navigateByUrl('/signed-in-redirect');
        }
      },
      error: () => {
        this.roles = storedRoles;
        this.isLoading = false;
        if (this.roles.length < 2) {
          sessionStorage.removeItem(SELECT_ROLE_STORAGE_KEY);
          this._router.navigateByUrl('/signed-in-redirect');
        }
      },
    });
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

  /**
   * Obtiene la etiqueta traducida del rol. Usa select-role.roles.{roleKey} con fallback al nombre del rol.
   */
  getRoleLabel(role: string): string {
    const roleKey = role.replace(/-/g, '');
    const i18nKey = `select-role.roles.${roleKey}`;
    const translated = this._transloco.translate(i18nKey);
    return translated !== i18nKey ? translated : role;
  }
}
