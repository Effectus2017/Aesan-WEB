import { NgIf } from '@angular/common';
import { Component, inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { TranslocoModule } from '@ngneat/transloco';
import { AuthService } from 'app/core/auth/auth.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { UsersService } from 'app/shared/services/users.service';

@Component({
  selector: 'auth-reset-password',
  templateUrl: './reset-password.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FuseAlertComponent,
    TranslocoModule,
  ],
})
export class ResetPasswordComponent implements OnInit {
  @ViewChild('resetPasswordNgForm') resetPasswordNgForm: NgForm;

  private _activatedRoute = inject(ActivatedRoute);
  private _usersService = inject(UsersService);
  private _formBuilder = inject(UntypedFormBuilder);
  private _router = inject(Router);

  alert: { type: FuseAlertType; message: string } = {
    type: 'success',
    message: '',
  };
  resetPasswordForm: UntypedFormGroup;
  showAlert: boolean = false;

  ngOnInit(): void {
    // Crear el formulario
    this.resetPasswordForm = this._formBuilder.group(
      {
        tempPassword: ['', Validators.required],
        newPassword: ['', Validators.required],
        confirmPassword: ['', Validators.required],
      },
      {
        validator: this.passwordMatchValidator,
      }
    );

    // Obtener el email de los query params
    this._activatedRoute.queryParams.subscribe((params) => {
      if (!params['email']) {
        this._router.navigate(['/sign-in']);
      }
    });
  }

  passwordMatchValidator(g: UntypedFormGroup) {
    return g.get('newPassword').value === g.get('confirmPassword').value ? null : { mismatch: true };
  }

  resetPassword(): void {
    if (this.resetPasswordForm.invalid) {
      return;
    }

    this.resetPasswordForm.disable();
    this.showAlert = false;

    const requestParameters: QueryParameters = {
      email: this._activatedRoute.snapshot.queryParams['email'],
      temporaryPassword: this.resetPasswordForm.get('tempPassword').value,
      newPassword: this.resetPasswordForm.get('newPassword').value,
    };

    this._usersService.resetPassword(requestParameters).subscribe({
      next: (response) => {
        this.alert = {
          type: 'success',
          message: 'Tu contraseña ha sido actualizada exitosamente',
        };
        this.showAlert = true;

        // Redireccionar al login después de 2 segundos
        setTimeout(() => {
          // Redirigir al componente de reset password con el email como parámetro
          this._router.navigate(['/sign-in'], {
            queryParams: { email: requestParameters.email },
          });
        }, 3000);
      },
      error: (response) => {
        this.resetPasswordForm.enable();
        this.alert = {
          type: 'error',
          message: response.error.message,
        };
        this.showAlert = true;
      },
    });
  }
}
