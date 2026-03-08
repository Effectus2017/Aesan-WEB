import { Component, Inject, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoModule } from '@ngneat/transloco';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { isAdminRole } from 'app/shared/constants/role-keys';
import { UsersService } from 'app/shared/services/users.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoService } from '@ngneat/transloco';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';

export interface UpdatePasswordModalData {
  userId: string;
  userName: string;
  userRole: string;
}

@Component({
  selector: 'app-update-password-modal',
  templateUrl: './update-password-modal.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    TranslocoModule,
  ],
})
export class UpdatePasswordModalComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _fuseConfirmationService = inject(FuseConfirmationService);
  private _translocoService = inject(TranslocoService);
  private _usersService = inject(UsersService);
  private _formBuilder = inject(FormBuilder);

  updatePasswordForm: FormGroup;
  isLoading: boolean = false;
  isAdmin: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<UpdatePasswordModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UpdatePasswordModalData
  ) {
    this.isAdmin = isAdminRole(data.userRole);
  }

  ngOnInit(): void {
    // Crear el formulario según el rol
    if (this.isAdmin) {
      // Para administradores: solo nueva contraseña y confirmar
      this.updatePasswordForm = this._formBuilder.group(
        {
          newPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
          confirmPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
        },
        {
          validators: this.passwordMatchValidator,
        }
      );
    } else {
      // Para usuarios normales: contraseña actual, nueva contraseña y confirmar
      this.updatePasswordForm = this._formBuilder.group(
        {
          currentPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
          newPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
          confirmPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
        },
        {
          validators: this.passwordMatchValidator,
        }
      );
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (!newPassword || !confirmPassword) {
      return null;
    }

    return newPassword.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.isLoading) return;
    if (this.updatePasswordForm.invalid) {
      this.updatePasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValue = this.updatePasswordForm.value;

    if (this.isAdmin) {
      // Para administradores: usar resetPassword
      const requestParameters: QueryParameters = {
        userId: this.data.userId,
        password: formValue.newPassword,
        newPassword: formValue.newPassword,
      };

      this._usersService.resetPassword(requestParameters).subscribe({
        next: (result: any) => {
          this.isLoading = false;
          if (result.status === 200) {
            this._fuseConfirmationService.open({
              title: this._translocoService.translate('users.password.reset.success.title'),
              message: result.body?.message || this._translocoService.translate('users.password.reset.success.message'),
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
        error: (error) => {
          this.isLoading = false;
          this._fuseConfirmationService.open({
            title: this._translocoService.translate('users.password.reset.error.title'),
            message: this._translocoService.translate('users.password.reset.error.message'),
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
        },
      });
    } else {
      // Para usuarios normales: usar changePassword
      const requestParameters: QueryParameters = {
        userId: this.data.userId,
        password: formValue.currentPassword,
        newPassword: formValue.newPassword,
      };

      this._usersService.changePassword(requestParameters).subscribe({
        next: (result: any) => {
          this.isLoading = false;
          if (result.status === 200) {
            this._fuseConfirmationService.open({
              title: this._translocoService.translate('users.password.success.title'),
              message: result.body?.message || this._translocoService.translate('users.password.success.message'),
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
        error: (error) => {
          this.isLoading = false;
          this._fuseConfirmationService.open({
            title: this._translocoService.translate('users.password.error.title'),
            message: this._translocoService.translate('users.password.error.message'),
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
        },
      });
    }
  }
}

