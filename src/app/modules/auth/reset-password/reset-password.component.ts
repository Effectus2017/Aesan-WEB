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
    ]
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
  isLoading: boolean = true;
  token: string;
  email: string;

  ngOnInit(): void {
    // Crear el formulario
    this.resetPasswordForm = this._formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: this.passwordMatchValidator
    });

    // Obtener el token y email de los query params
    this._activatedRoute.queryParams.subscribe((params) => {
      this.token = params['token'];
      this.email = params['email'];

      if (!this.token || !this.email) {
        this._router.navigate(['/sign-in']);
        return;
      }

      // Validar el token
      this.validateToken();
    });
  }

  private async validateToken(): Promise<void> {
    try {
      const requestParameters: QueryParameters = {
        email: this.email,
        token: this.token
      };

      await this._usersService.validateResetToken(requestParameters).toPromise();
      this.isLoading = false;
    } catch (error) {
      this.alert = {
        type: 'error',
        message: 'El enlace de restablecimiento no es válido o ha expirado'
      };
      this.showAlert = true;
      setTimeout(() => {
        this._router.navigate(['/forgot-password']);
      }, 3000);
    }
  }

  passwordMatchValidator(g: UntypedFormGroup) {
    return g.get('password').value === g.get('confirmPassword').value ? null : { mismatch: true };
  }

  resetPassword(): void {
    if (this.resetPasswordForm.invalid) {
      return;
    }

    this.resetPasswordForm.disable();
    this.showAlert = false;

    const requestParameters: QueryParameters = {
      email: this.email,
      token: this.token,
      newPassword: this.resetPasswordForm.get('password').value
    };

    this._usersService.resetPasswordWithToken(requestParameters).subscribe({
      next: () => {
        this.alert = {
          type: 'success',
          message: 'Tu contraseña ha sido actualizada exitosamente'
        };
        this.showAlert = true;

        // Redireccionar al login después de 3 segundos
        setTimeout(() => {
          this._router.navigate(['/sign-in'], {
            queryParams: { email: this.email }
          });
        }, 3000);
      },
      error: (error) => {
        this.resetPasswordForm.enable();
        this.alert = {
          type: 'error',
          message: error.error?.message || 'Ha ocurrido un error al restablecer la contraseña'
        };
        this.showAlert = true;
      }
    });
  }
}
