import { Component, inject, Inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslocoModule } from '@ngneat/transloco';
import { AuthService } from 'app/core/auth/auth.service';
import { UsersService } from 'app/shared/services/users.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoService } from '@ngneat/transloco';

export interface RequestRoleExtensionModalData {
  roleName: string;
  roleValidTo: string;
}

@Component({
  selector: 'app-request-role-extension-modal',
  templateUrl: './request-role-extension-modal.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslocoModule,
  ],
})
export class RequestRoleExtensionModalComponent {
  private _dialogRef = inject(MatDialogRef<RequestRoleExtensionModalComponent>);
  private _authService = inject(AuthService);
  private _usersService = inject(UsersService);
  private _fuseConfirmation = inject(FuseConfirmationService);
  private _transloco = inject(TranslocoService);

  form: FormGroup = new FormGroup({
    requestedValidTo: new FormControl<Date | null>(null, Validators.required),
    reason: new FormControl<string | null>(null),
  });

  isLoading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: RequestRoleExtensionModalData
  ) {}

  onSubmit(): void {
    if (this.form.invalid || this.isLoading) return;
    const requestedValidTo = this.form.get('requestedValidTo')?.value as Date | null;
    const reason = this.form.get('reason')?.value as string | null;
    if (!requestedValidTo) return;
    const currentUserId = this._authService.getUserId();
    if (!currentUserId) {
      this._fuseConfirmation.open({
        title: this._transloco.translate('roleExtension.modal.error'),
        message: this._transloco.translate('roleExtension.modal.userRequired'),
        icon: { show: true, name: 'heroicons_outline:exclamation-circle', color: 'error' },
        actions: { confirm: { show: true, label: this._transloco.translate('dialog.error.confirm'), color: 'primary' }, cancel: { show: false } },
      });
      return;
    }
    this.isLoading = true;
    const requestedValidToStr = typeof requestedValidTo === 'string' ? requestedValidTo : requestedValidTo.toISOString().slice(0, 10);
    this._usersService
      .requestRoleExtension(
        { roleName: this.data.roleName, requestedValidTo: requestedValidToStr, reason: reason ?? undefined },
        { currentUserId }
      )
      .subscribe({
        next: () => {
          this._fuseConfirmation.open({
            title: this._transloco.translate('roleExtension.modal.successTitle'),
            message: this._transloco.translate('roleExtension.modal.successMessage'),
            icon: { show: true, name: 'heroicons_outline:check-circle', color: 'success' },
            actions: { confirm: { show: true, label: this._transloco.translate('dialog.success.confirm'), color: 'primary' }, cancel: { show: false } },
          });
          this._dialogRef.close({ success: true });
        },
        error: (err) => {
          this.isLoading = false;
          const msg = err?.error?.message ?? err?.message ?? this._transloco.translate('roleExtension.modal.error');
          this._fuseConfirmation.open({
            title: this._transloco.translate('roleExtension.modal.error'),
            message: msg,
            icon: { show: true, name: 'heroicons_outline:exclamation-circle', color: 'error' },
            actions: { confirm: { show: true, label: this._transloco.translate('dialog.error.confirm'), color: 'primary' }, cancel: { show: false } },
          });
        },
      });
  }

  onCancel(): void {
    this._dialogRef.close();
  }
}
