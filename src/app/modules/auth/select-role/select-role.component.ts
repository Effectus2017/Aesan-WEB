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
import { DTORole, UsersService } from 'app/shared/services/users.service';

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

  /** Roles AESAN del usuario (name = clave; displayName/displayNameEN para mostrar). El value del select es role.name. */
  roles: DTORole[] = [];
  selectedRole: string | null = null;
  isLoading = true;
  get currentLang(): string {
    return this._transloco.getActiveLang() ?? 'es';
  }
  alert: { type: FuseAlertType; message: string } = {
    type: 'error',
    message: '',
  };
  showAlert = false;

  ngOnInit(): void {
    const stored = sessionStorage.getItem(SELECT_ROLE_STORAGE_KEY);
    const storedRoleNames: string[] = stored ? (() => { try { return JSON.parse(stored) ?? []; } catch { return []; } })() : [];

    // Si el usuario no tiene 2+ roles en sesión, no debe estar aquí: ir a signed-in-redirect
    if (storedRoleNames.length < 2) {
      sessionStorage.removeItem(SELECT_ROLE_STORAGE_KEY);
      this._router.navigateByUrl('/signed-in-redirect');
      return;
    }

    this._usersService.getAllRolesFromDb({ aesanOnly: true }).subscribe({
      next: (aesanRoles) => {
        this.roles = (aesanRoles ?? []).filter((r) => storedRoleNames.includes((r as any).name ?? (r as any).Name ?? ''));
        this.isLoading = false;
      },
      error: () => {
        this.roles = storedRoleNames.map((name) => ({ name, displayName: name, displayNameEN: name }));
        this.isLoading = false;
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

}
