import { NgForOf, NgIf } from '@angular/common';
import { Component, inject, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { AuthService } from 'app/core/auth/auth.service';
import { AUTH_ERROR_I18N_SELECT_ROLE_NO_AGENCY_ASSIGNED } from 'app/shared/constants/auth-error-keys';
import { LanguagesComponent } from 'app/layout/common/languages/languages.component';
import { DTORole, UsersService } from 'app/shared/services/users.service';
import { Subject, takeUntil } from 'rxjs';

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
export class AuthSelectRoleComponent implements OnInit, OnDestroy {
  // -----
  // @ Inyecciones privadas
  // -----
  private _authService = inject(AuthService);
  private _router = inject(Router);
  private _usersService = inject(UsersService);
  private _translocoService = inject(TranslocoService);
  private _unsubscribeAll = new Subject<any>();

  // -----
  // @ Variables
  // -----
  /**
   * Roles AESAN del usuario obtenidos del backend con displayName completo.
   * Se muestra displayName (ES) o displayNameEN (EN) según idioma activo.
   * El value del select es role.name (clave técnica).
   */
  roles: DTORole[] = [];
  selectedRole: string | null = null;
  isLoading = true;
  currentLang: string = 'es';
  alert: { type: FuseAlertType; message: string } = {
    type: 'error',
    message: '',
  };
  showAlert = false;

  // -----
  // @ ngOnInit
  // -----
  /** Inicializa el componente y carga los roles del usuario desde el backend. */
  ngOnInit(): void {
    this._translocoService.langChanges$.pipe(takeUntil(this._unsubscribeAll)).subscribe((lang: string) => {
      this.currentLang = lang;
    });

    const stored = sessionStorage.getItem('pendingAesanRoles');
    const storedRoleNames: string[] = stored ? (() => { try { return JSON.parse(stored) ?? []; } catch { return []; } })() : [];

    if (storedRoleNames.length < 2) {
      sessionStorage.removeItem('pendingAesanRoles');
      this._router.navigateByUrl('/signed-in-redirect');
      return;
    }

    this._usersService.getAllRolesFromDb({ aesanOnly: true }).subscribe({
      next: (response) => {
        const allRoles = response?.body?.data ?? [];
        this.roles = allRoles.filter((r: any) =>
          storedRoleNames.includes(r?.name ?? r?.Name ?? '')
        );
        this.isLoading = false;
      },
      error: () => {
        this._showError('select-role.error.loadRolesFailed');
      },
    });
  }

  // -----
  // @ ngOnDestroy
  // -----
  /** Limpia las suscripciones al destruir el componente. */
  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // -----
  // @ Otras funciones públicas
  // -----
  /** Selecciona un rol y redirige al usuario al sistema. */
  selectRole(role: string | null): void {
    if (this.isLoading || !role) return;

    this.selectedRole = role;
    this.isLoading = true;
    this.showAlert = false;

    this._authService.selectRole(role).subscribe({
      next: () => {
        sessionStorage.removeItem('pendingAesanRoles');
        this._router.navigateByUrl('/auth-redirect');
      },
      error: (err) => {
        this.isLoading = false;
        this.selectedRole = null;
        const msg = err?.status === 403
          ? (err?.error?.message ?? AUTH_ERROR_I18N_SELECT_ROLE_NO_AGENCY_ASSIGNED)
          : (err?.error?.message ?? (err?.status === 401 ? 'select-role.error.unauthorized' : 'select-role.error.server'));
        this.alert = { type: 'error', message: msg };
        this.showAlert = true;
      },
    });
  }

  // -----
  // @ Funciones privadas
  // -----
  /** Muestra un mensaje de error y detiene la carga. */
  private _showError(messageKey: string): void {
    this.isLoading = false;
    this.alert = { type: 'error', message: messageKey };
    this.showAlert = true;
  }
}
