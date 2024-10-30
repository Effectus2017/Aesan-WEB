import { NgFor, NgIf } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { TranslocoModule } from '@ngneat/transloco';
import { AuthService } from 'app/core/auth/auth.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { UserAgencyRequest } from 'app/shared/models/Request/UserAgencyRequest';
import { GeoService } from 'app/shared/services/geo.service';
import { UserService } from 'app/shared/services/user.service';

@Component({
  selector: 'auth-sign-up',
  templateUrl: './sign-up.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
  standalone: true,
  imports: [
    FuseAlertComponent,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatIconModule,
    TranslocoModule,
    NgFor
  ],
})
export class AuthSignUpComponent implements OnInit {
  @ViewChild('signUpNgForm') signUpNgForm: NgForm;

  alert: { type: FuseAlertType; message: string } = {
    type: 'success',
    message: '',
  };
  signUpForm: UntypedFormGroup;
  showAlert: boolean = false;

  private _authService = inject(AuthService);
  private _formBuilder = inject(UntypedFormBuilder);
  private _router = inject(Router);
  private _geoService = inject(GeoService);
  private _userService = inject(UserService);

  listPrograms = [];
  listCities = [];
  listRegions = [];

  constructor() {}

  ngOnInit(): void {
    // Create the form
    this.signUpForm = this._formBuilder.group({

      name: ['', Validators.required],
      city: ['', Validators.required],
      region: ['', Validators.required],
      program: ['', Validators.required],


      sdrNumber: ['', [Validators.required, Validators.pattern(/^\d{1,10}$/)]],
      uieNumber: ['', [Validators.required, Validators.pattern(/^\d{1,10}$/)]],
      einNumber: ['', [Validators.required, Validators.pattern(/^\d{1,10}$/)]],
      nonProfit: ['', Validators.required],
      //
      address: ['', Validators.required],

      postalCode: ['', [Validators.required, Validators.pattern(/^\d{1,10}$/)]],
      latitude: ['', Validators.required],
      longitude: ['', Validators.required],
      //
      firstName: ['', Validators.required],
      middleName: [''],
      fatherLastName: ['', Validators.required],
      motherLastName: [''],
      //
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^(1-)?(?!.*000)([0-9]{3}-[0-9]{4}|[0-9]{7})$/)]],
      //
      adminTitle: ['', Validators.required],
    });

    // Cargar ciudades
    this.loadCities();

    // Cargar programas
    this.loadPrograms();
  }

  // Método para cargar programas
  loadPrograms(): void {
    const queryParams: QueryParameters = {
      take: 10,
      skip: 0,
      alls: true,
    };

    this._userService.getAllProgramsFromDb(queryParams).subscribe({
      next: (response) => {
        this.listPrograms = response.body.data;
      },
      error: (error) => {
        console.error('Error al cargar los programas', error);
      },
      complete: () => {
        console.log('Programas cargados con éxito');
      }
    });
  }

  // Método para cargar ciudades
  loadCities(): void {

    const queryParams: QueryParameters = {
      take: 10,
      skip: 0,
      alls: true,
    };

    this._geoService.getCities(queryParams).subscribe({
      next: (response) => {
        this.listCities = response.body.data;
      },
      error: (error) => {
        console.error('Error al cargar las ciudades', error);
      },
      complete: () => {
        console.log('Ciudades cargadas con éxito');
      }
    });
  }

  // Método para obtener todas las regiones según el ID de la ciudad
  getRegionsByCityId(cityId: number): void {
    const queryParams: QueryParameters = {
      cityId: cityId,
      alls: true,
    };

    this._geoService.getRegionsByCityId(queryParams).subscribe({
      next: (response: HttpResponse<any>) => {
        this.listRegions = response.body.data;
      },
      error: (error) => {
        console.error('Error al cargar las regiones', error);
      },
      complete: () => {
        console.log('Regiones cargadas con éxito');
      }
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  signUp(): void {
    // Return if the form is invalid
    if (this.signUpForm.invalid) {
      return;
    }

    // Disable the form
    this.signUpForm.disable();

    // Hide the alert
    this.showAlert = false;

    const userAgencyRequest: UserAgencyRequest = {
      agency: {
        name: this.signUpForm.value.agencyName ? this.signUpForm.value.agencyName : '',
        cityId: this.signUpForm.value.city.id ? this.signUpForm.value.city.id : 0,
        regionId: this.signUpForm.value.region.id ? this.signUpForm.value.region.id : 0,
        programId: this.signUpForm.value.program ? this.signUpForm.value.program : 0,

        //
        sdrNumber: this.signUpForm.value.sdrNumber ? this.signUpForm.value.sdrNumber : 0,
        uieNumber: this.signUpForm.value.uieNumber ? this.signUpForm.value.uieNumber : 0,
        einNumber: this.signUpForm.value.einNumber ? this.signUpForm.value.einNumber : 0,

        //
        address: this.signUpForm.value.address ? this.signUpForm.value.address : '',
        postalCode: this.signUpForm.value.postalCode ? this.signUpForm.value.postalCode : '',
        latitude: this.signUpForm.value.latitude ? this.signUpForm.value.latitude : 0,
        longitude: this.signUpForm.value.longitude ? this.signUpForm.value.longitude : 0,
        phone: this.signUpForm.value.phone ? this.signUpForm.value.phone : ''
      },
      user: {
        firstName: this.signUpForm.value.firstName,
        middleName: this.signUpForm.value.middleName,
        fatherLastName: this.signUpForm.value.fatherLastName,
        motherLastName: this.signUpForm.value.motherLastName,
        administrationTitle: this.signUpForm.value.adminTitle,
      },
    };

    console.log(userAgencyRequest);

    // Registrar el usuario
    // this._userService.registerUserAgency(userAgencyRequest).subscribe({
    //   next: (response) => {
    //     console.log('Usuario creado con éxito', response);
    //     // Navigate to the confirmation required page
    //     this._router.navigateByUrl('/confirmation-required');
    //   },
    //   error: (error) => {
    //     console.error('Error al crear el usuario', error);
    //   },
    //   complete: () => {
    //     console.log('Proceso de creación de usuario completado');
    //      // Re-enable the form
    //      this.signUpForm.enable();

    //      // Reset the form
    //      this.signUpNgForm.resetForm();

    //      // Set the alert
    //      this.alert = {
    //        type: 'error',
    //        message: 'Ocurrió un error al procesar su solicitud. Por favor, inténtelo de nuevo.',
    //      };

    //      // Show the alert
    //      this.showAlert = true;
    //   }
    // });

  }
}
