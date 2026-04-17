import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';

import { AuthService } from 'app/core/auth/auth.service';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { UsersService } from 'app/shared/services/users.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { RequestUser } from '../users.types';
import { DTORole } from 'app/modules/admin-portal/users/users.types';

export interface ChangeRoleModalData {
  user: any;
}

@Component({
  selector: 'app-change-role-modal',
  templateUrl: './change-role-modal.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    TranslocoModule,
  ],
})
export class ChangeRoleModalComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<void> = new Subject<void>();
  private _usersService = inject(UsersService);
  private _authService = inject(AuthService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _fuseConfirmationService = inject(FuseConfirmationService);
  private _translocoService = inject(TranslocoService);
  private _formBuilder = inject(FormBuilder);

  roles: DTORole[] = [];
  isLoading: boolean = false;
  roleForm: FormGroup = this._formBuilder.group({
    role: new FormControl<DTORole | null>(null, Validators.required),
  });

  constructor(
    public dialogRef: MatDialogRef<ChangeRoleModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChangeRoleModalData
  ) {}

  // -----
  // @ Getters
  // -----

  /** Idioma activo (es/en) para mostrar displayName o displayNameEN en el select, igual que en otros formularios de usuarios. */
  get currentLang(): string {
    return this._translocoService.getActiveLang() ?? 'es';
  }

  ngOnInit(): void {
    this._loadRoles();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.isLoading) {
      return;
    }

    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }

    const selectedRole = this.roleForm.get('role')?.value as DTORole | null;
    const roleName = selectedRole?.name;
    const currentUserId = this._authService.getUserId();

    if (!roleName || !currentUserId || !this.data?.user?.id) {
      this._showErrorMessage();
      return;
    }

    const requestParameters: QueryParameters = {
      currentUserId,
    };

    const model: RequestUser = {
      id: this.data.user.id,
      firstName: this.data.user.firstName,
      middleName: this.data.user.middleName,
      fatherLastName: this.data.user.fatherLastName,
      motherLastName: this.data.user.motherLastName,
      email: this.data.user.email,
      userName: this.data.user.userName,
      imageURL: this.data.user.imageURL ?? '',
      agencyId: this.data.user.agency?.id ?? this.data.user.agencyId ?? null,
      isActive: this.data.user.isActive,
      isTemporalPasswordActived: this.data.user.isTemporalPasswordActived,
      emailConfirmed: this.data.user.emailConfirmed,
      primaryRoleName: roleName,
      roles: [roleName],
    };

    this.isLoading = true;
    this._usersService.updateWithSP(model, requestParameters).pipe(takeUntil(this._unsubscribeAll)).subscribe({
      next: (result: any) => {
        this.isLoading = false;
        if (result?.status === 200) {
          this._fuseConfirmationService.open({
            title: this._translocoService.translate('users.edit.change-role-modal.success.title'),
            message: result.body?.message || this._translocoService.translate('users.edit.change-role-modal.success.message'),
            icon: {
              show: true,
              name: 'heroicons_outline:check-circle',
              color: 'success',
            },
            actions: {
              confirm: {
                show: true,
                label: this._translocoService.translate('dialog.success.confirm'),
                color: 'primary',
              },
              cancel: {
                show: false,
              },
            },
          });
          this.dialogRef.close({ success: true });
        }
      },
      error: () => {
        this.isLoading = false;
        this._showErrorMessage();
      },
    });
  }

  private _loadRoles(): void {
    this._usersService.getAllRolesFromDb({ take: 100, skip: 0, aesanOnly: false })
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
      next: (response: any) => {
        this.roles = (response?.body?.data ?? []) as DTORole[];
        this._setInitialRole();
        this._changeDetectorRef.markForCheck();
      },
      error: () => {
        this.roles = [];
        this._changeDetectorRef.markForCheck();
      },
    });
  }

  private _setInitialRole(): void {
    const currentRoleName = this.data?.user?.primaryRoleName ?? this.data?.user?.role?.name ?? this.data?.user?.roles?.[0];
    if (!currentRoleName) {
      return;
    }

    const normalizedCurrentRole = String(currentRoleName).trim().toLowerCase();
    const currentRole = this.roles.find(
      (role) => String(role.name).trim().toLowerCase() === normalizedCurrentRole
    );
    if (currentRole) {
      this.roleForm.patchValue({ role: currentRole });
    }
  }

  private _showErrorMessage(): void {
    this._fuseConfirmationService.open({
      title: this._translocoService.translate('users.edit.change-role-modal.error.title'),
      message: this._translocoService.translate('users.edit.change-role-modal.error.message'),
      icon: {
        show: true,
        name: 'heroicons_outline:exclamation-circle',
        color: 'error',
      },
      actions: {
        confirm: {
          show: true,
          label: this._translocoService.translate('dialog.error.confirm'),
          color: 'primary',
        },
        cancel: {
          show: false,
        },
      },
    });
  }
}
