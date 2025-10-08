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
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { UsersService } from 'app/shared/services/users.service';
import { LanguagesComponent } from 'app/layout/common/languages/languages.component';

@Component({
    selector: 'auth-update-password',
    templateUrl: './update-password.component.html',
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
        LanguagesComponent,
    ]
})
export class UpdatePasswordComponent implements OnInit {
  @ViewChild('updatePasswordNgForm') updatePasswordNgForm: NgForm;

  private _activatedRoute = inject(ActivatedRoute);
  private _usersService = inject(UsersService);
  private _formBuilder = inject(UntypedFormBuilder);
  private _router = inject(Router);
  private _translocoService = inject(TranslocoService);

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
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
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

    this._usersService.updateTemporalPassword(requestParameters).subscribe({
      next: (response: any) => {
        // Verificar si la respuesta indica éxito
        if (response && response.body.valid === false) {
          this.resetPasswordForm.enable();
          this.alert = {
            type: 'error',
            message: this._translocoService.translate('update-password.error.invalid-temp-password'),
          };
          this.showAlert = true;
          return;
        }

        // Si la respuesta es exitosa
        this.alert = {
          type: 'success',
          message: this._translocoService.translate('update-password.success.password-updated'),
        };
        this.showAlert = true;

        // Reset the form
        this.updatePasswordNgForm.resetForm();

        // Redirect to login after 3 seconds
        setTimeout(() => {
          this._router.navigate(['/sign-in'], {
            queryParams: { email: requestParameters.email },
          });
        }, 3000);
      },
      error: (error) => {
        this.resetPasswordForm.enable();

        // Determinar el tipo de error basado en la respuesta
        let errorMessage = 'update-password.error.server-error';

        if (error.error && error.error.message === 'Not updated') {
          errorMessage = 'update-password.error.not-updated';
        } else if (error.status === 400) {
          errorMessage = 'update-password.error.invalid-temp-password';
        }

        this.alert = {
          type: 'error',
          message: this._translocoService.translate(errorMessage),
        };
        this.showAlert = true;
      },
    });
  }
}
