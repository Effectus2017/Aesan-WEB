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

@Component({
  selector: 'auth-sign-in',
  templateUrl: './sign-in.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
  standalone: true,
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
  ],
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
      email: ['admin@admin.com', [Validators.required, Validators.email]],
      password: ['@dmin5812931!', Validators.required],
      rememberMe: [''],
    });

    // Register the navigation component
    this._fuseNavigationService.registerComponent('authSignIn', this);
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
      password: this.signInForm.value.password
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

        // Reset the form
        this.signInNgForm.resetForm();

        // Set the alert
        this.alert = {
          type: 'error',
          message: 'Wrong email or password',
        };

        // Show the alert
        this.showAlert = true;
      }
    });


  }
}
