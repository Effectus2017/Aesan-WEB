import { NgFor, NgIf } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule } from '@ngneat/transloco';
import { AuthService } from 'app/core/auth/auth.service';
import { City } from 'app/shared/models/City';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { UserAgencyRequest } from 'app/shared/models/Request/UserAgencyRequest';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { GeoService } from 'app/shared/services/geo.service';
import { UserService } from 'app/shared/services/user.service';
import { Subject } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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
    NgFor,
    MatDividerModule,
    MatSnackBarModule,
  ],
})
export class AuthSignUpComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  @ViewChild('signUpNgForm') signUpNgForm: NgForm;

  alert: { type: FuseAlertType; message: string } = {
    type: 'success',
    message: '',
  };
  signUpForm: UntypedFormGroup;
  showAlert: boolean = false;

  private _authService = inject(AuthService);
  private _formBuilder = inject(UntypedFormBuilder);
  private _customRouterService = inject(CustomRouterService);
  private _geoService = inject(GeoService);
  private _userService = inject(UserService);
  private _fuseConfirmationService = inject(FuseConfirmationService);
  private _snackBar = inject(MatSnackBar);
  listPrograms = [];
  listCities = [];
  listRegions = [];

  // Añadir nueva propiedad para controlar el estado del botón
  isEligible: boolean = true;

  constructor() {}

  ngOnInit(): void {
    // Create the form
    this.signUpForm = this._formBuilder.group({
      name: [null, Validators.required],
      program: [null, Validators.required],

      // Datos de la Agencia
      sdrNumber: [null, [Validators.required]],
      uieNumber: [null, [Validators.required]],
      einNumber: [null, [Validators.required]],

      // Datos de la Agencia
      nonProfit: [null, Validators.required],
      federalFundsDenied: [null, Validators.required],
      stateFundsDenied: [null, Validators.required],

      // Datos de la Ciudad y Región
      city: [null, Validators.required],
      region: [null, Validators.required],
      latitude: [null, Validators.required],
      longitude: [null, Validators.required],

      // Dirección y Teléfono
      address: [null, Validators.required],
      phone: [null, [Validators.required]],
      zipCode: [null, [Validators.required]],
      postalAddress: [null, Validators.required],

      // Datos del Contacto
      firstName: [null, Validators.required],
      middleName: [null],
      fatherLastName: [null, Validators.required],
      motherLastName: [null],

      // Datos del Correo Electrónico y Cargo
      email: [null, [Validators.required, Validators.email]],
      administrationTitle: [null, Validators.required],
    });

    // Cargar ciudades
    this.loadCities();

    // Cargar programas
    this.loadPrograms();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
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
      },
    });
  }

  // Método para cargar ciudades
  loadCities(): void {
    const queryParams: QueryParameters = {
      take: 10,
      skip: 0,
      alls: true,
    };

    this._geoService.getCitiesFromDb(queryParams).subscribe({
      next: (response) => {
        this.listCities = response.body.data;
      },
      error: (error) => {
        console.error('Error al cargar las ciudades', error);
      },
      complete: () => {
        console.log('Ciudades cargadas con éxito');
      },
    });
  }

  // Método para obtener todas las regiones según el ID de la ciudad
  getRegionsByCityId(city: City): void {
    const queryParams: QueryParameters = {
      cityId: city.id,
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
      },
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  signUp(): void {
    // Return if the form is invalid
    if (this.signUpForm.invalid) {
      this._snackBar.open('El formulario es inválido. Por favor, complete todos los campos requeridos.', 'Cerrar', {
        duration: 5000,
      });

      this.signUpForm.markAllAsTouched();
      return;
    }

    // Disable the form
    this.signUpForm.disable();

    // Hide the alert
    this.showAlert = false;

    // Obtener los valores del formulario
    const formValues = this.signUpForm.value;

    const userAgencyRequest: UserAgencyRequest = {
      Agency: {
        Name: formValues.name ? formValues.name : '',
        ProgramId: formValues.program ? formValues.program.id : 0,
        // Datos de la Agencia
        SdrNumber: formValues.sdrNumber ? formValues.sdrNumber : 0,
        UieNumber: formValues.uieNumber ? formValues.uieNumber : 0,
        EinNumber: formValues.einNumber ? formValues.einNumber : 0,
        // Datos de la Ciudad y Región
        CityId: formValues.city ? formValues.city.id : 0,
        RegionId: formValues.region ? formValues.region.id : 0,
        Latitude: formValues.latitude ? formValues.latitude : 0,
        Longitude: formValues.longitude ? formValues.longitude : 0,
        // Dirección y Teléfono
        Address: formValues.address ? formValues.address : '',
        ZipCode: formValues.zipCode ? formValues.zipCode : 0,
        PostalAddress: formValues.postalAddress ? formValues.postalAddress : '',
        Phone: formValues.phone ? formValues.phone : '',
        NonProfit: formValues.nonProfit === 'Yes' ? true : false,
        FederalFundsDenied: formValues.federalFundsDenied === 'Yes' ? true : false,
        StateFundsDenied: formValues.stateFundsDenied === 'Yes' ? true : false,
      },
      User: {
        // Datos del Contacto
        FirstName: formValues.firstName,
        MiddleName: formValues.middleName,
        FatherLastName: formValues.fatherLastName,
        MotherLastName: formValues.motherLastName,
        // Datos del Correo Electrónico y Cargo
        AdministrationTitle: formValues.administrationTitle,
        Email: formValues.email,
      },
    };

    console.log(userAgencyRequest);
    const requestParameters: QueryParameters = {};
    //Registrar el usuario
    this._userService.registerUserAgency(userAgencyRequest, requestParameters).subscribe({
      next: (response) => {
        console.log('Usuario creado con éxito', response);
        // Navigate to the confirmation required page
        this._customRouterService.navigate(['/sign-in']);
      },
      error: (error) => {
        console.error('Error al crear el usuario', error);
      },
      complete: () => {
        console.log('Proceso de creación de usuario completado');
         // Re-enable the form
         this.signUpForm.enable();

         // Reset the form
         this.signUpNgForm.resetForm();

         // Set the alert
         this.alert = {
           type: 'error',
           message: 'Ocurrió un error al procesar su solicitud. Por favor, inténtelo de nuevo.',
         };

         // Show the alert
         this.showAlert = true;
      }
    });
  }

  nonProfitChange(event: any): void {
    const selectedProgram = this.signUpForm.value.program?.name;
    const isNotNonProfit = this.signUpForm.value.nonProfit === 'No';

    // Verificar elegibilidad para PDAM y PSAV
    if (isNotNonProfit && ['PDAM', 'PSAV'].includes(selectedProgram)) {
      this.isEligible = false;
      this._fuseConfirmationService.open({
        title: 'Notificación',
        message: 'Usted no es elegible para participar de los programas de AESAN',
        actions: {
          confirm: {
            label: 'Aceptar',
          },
          cancel: {
            show: false,
          },
        },
      });
    } else {
      this.isEligible = true;
    }
  }

  checkFundsEligibility(): void {
    const selectedProgram = this.signUpForm.value.program?.name;
    const stateFundsDenied = this.signUpForm.value.stateFundsDenied === 'Yes';
    const federalFundsDenied = this.signUpForm.value.federalFundsDenied === 'Yes';

    // Verificar elegibilidad para PACNA
    if ((stateFundsDenied || federalFundsDenied) && selectedProgram === 'PACNA') {
      this.isEligible = false;
      this._fuseConfirmationService.open({
        title: 'Notificación',
        message: 'You are not eligible to participate in PACNA program',
        actions: {
          confirm: {
            label: 'Aceptar',
          },
          cancel: {
            show: false,
          },
        },
      });
    } else {
      this.isEligible = true;
    }
  }
}
