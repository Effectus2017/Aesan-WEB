import { NgIf } from '@angular/common';
import { Component, inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { FuseNavigationService } from '@fuse/components/navigation';
import { TranslocoModule } from '@ngneat/transloco';
import { AuthService } from 'app/core/auth/auth.service';
import { LanguagesComponent } from 'app/layout/common/languages/languages.component';
import { LazyImgDirective } from 'app/shared/directives/lazy-img.directive';
import { OptimizeImagePipe } from 'app/shared/pipes/optimize-image.pipe';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    imports: [
        RouterLink,
        FuseAlertComponent,
        NgIf,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        TranslocoModule,
        LanguagesComponent
    ]
})
export class AuthSignInComponent implements OnInit {
  private _activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private _authService: AuthService = inject(AuthService);
  private _formBuilder: UntypedFormBuilder = inject(UntypedFormBuilder);
  private _fuseNavigationService: FuseNavigationService = inject(FuseNavigationService);
  private _router: Router = inject(Router);

  @ViewChild('signInNgForm') signInNgForm: NgForm;

  alert: { type: FuseAlertType; message: string } = {
    type: 'success',
    message: '',
  };
  signInForm: UntypedFormGroup;
  showAlert: boolean = false;

  constructor() {}

  ngOnInit(): void {
    // Create the form
    this.signInForm = this._formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, Validators.required],
      rememberMe: [''],
    });

    // Register the navigation component
    this._fuseNavigationService.registerComponent('authSignIn', this);

    // Obtener el email y error de los query params
    this._activatedRoute.queryParams.subscribe(params => {
      if (params['error'] === 'connection') {
        this.alert = {
          type: 'error',
          message: 'sign-in.error.connection'
        };
        this.showAlert = true;
      }

      if (!params['email']) {
        return;
      }

      this.signInForm.get('email').setValue(params['email']);
    });
  }

  signIn(): void {
    // Return if the form is invalid
    if (this.signInForm.invalid) {
      return;
    }

    // Disable the form
    this.signInForm.disable();

    // Hide the alert
    this.showAlert = false;

    // Crear el modelo según el formulario
    const signInModel = {
      userName: this.signInForm.value.email,
      password: this.signInForm.value.password,
    };

    // Sign in
    this._authService.signIn(signInModel).subscribe({
      next: () => {
        const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';
        // Navigate to the redirect url
        this._router.navigateByUrl(redirectURL);
      },
      error: (response) => {
        // Re-enable the form
        this.signInForm.enable();

        if (!response.status) {
          // Error de conexión
          this.alert = {
            type: 'error',
            message: 'sign-in.error.connection',
          };
          this.showAlert = true;
          return;
        }

        if (response.status === 409) {
          // Redirigir al componente de reset password con el email como parámetro
          this._router.navigate(['/update-password'], {
            queryParams: { email: this.signInForm.get('email').value },
          });
          return;
        }

        if (response.status === 401) {
          // Reset the form
          this.signInNgForm.resetForm();

          // Set the alert
          this.alert = {
            type: 'error',
            message: response.error.message || 'sign-in.error.credentials',
          };

          // Show the alert
          this.showAlert = true;
        } else {
          // Set the alert for other errors
          this.alert = {
            type: 'error',
            message: 'sign-in.error.server',
          };
          this.showAlert = true;
        }
      },
    });
  }
}
