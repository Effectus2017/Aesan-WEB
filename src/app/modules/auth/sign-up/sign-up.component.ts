import { NgFor, NgIf } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
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
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule } from '@ngneat/transloco';
import { AuthService } from 'app/core/auth/auth.service';
import { City } from 'app/shared/models/City';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { UserAgencyRequest } from 'app/shared/models/Request/UserAgencyRequest';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { GeoService } from 'app/shared/services/geo.service';
import { UserService } from 'app/shared/services/user.service';
import { Subject, takeUntil } from 'rxjs';

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

  listPrograms = [];
  listCities = [];
  listRegions = [];

  constructor() {}

  ngOnInit(): void {
    // Create the form
    this.signUpForm = this._formBuilder.group({
      name: [null, Validators.required],
      city: [null, Validators.required],
      region: [null, Validators.required],
      program: [null, Validators.required],

      sdrNumber: [null, [Validators.required, Validators.pattern(/^\d{1,10}$/)]],
      uieNumber: [null, [Validators.required, Validators.pattern(/^\d{1,10}$/)]],
      einNumber: [null, [Validators.required, Validators.pattern(/^\d{1,10}$/)]],
      nonProfit: [null, Validators.required],
      //
      address: [null, Validators.required],
      postalCode: [null, [Validators.required, Validators.pattern(/^\d{1,10}$/)]],
      latitude: [null, Validators.required],
      longitude: [null, Validators.required],
      //
      firstName: [null, Validators.required],
      middleName: [null],
      fatherLastName: [null, Validators.required],
      motherLastName: [null],
      //
      email: [null, [Validators.required, Validators.email]],
      phone: [null, [Validators.required]],
      //
      adminTitle: [null, Validators.required],
    });

    // this._geoService.cities$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
    //     this.listCities = result.body.data;
    //   });

    // this._userService.programs$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
    //   this.listPrograms = result.body.data;
    // });

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
      return;
    }

    // Disable the form
    this.signUpForm.disable();

    // Hide the alert
    this.showAlert = false;

    const userAgencyRequest: UserAgencyRequest = {
      Agency: {
        Name: this.signUpForm.value.name ? this.signUpForm.value.name : '',
        CityId: this.signUpForm.value.city ? this.signUpForm.value.city.id : 0,
        RegionId: this.signUpForm.value.region ? this.signUpForm.value.region.id : 0,
        ProgramId: this.signUpForm.value.program ? this.signUpForm.value.program.id : 0,
        //
        SdrNumber: this.signUpForm.value.sdrNumber ? this.signUpForm.value.sdrNumber : 0,
        UieNumber: this.signUpForm.value.uieNumber ? this.signUpForm.value.uieNumber : 0,
        EinNumber: this.signUpForm.value.einNumber ? this.signUpForm.value.einNumber : 0,
        //
        Address: this.signUpForm.value.address ? this.signUpForm.value.address : '',
        PostalCode: this.signUpForm.value.postalCode ? this.signUpForm.value.postalCode : 0,
        Latitude: this.signUpForm.value.latitude ? this.signUpForm.value.latitude : 0,
        Longitude: this.signUpForm.value.longitude ? this.signUpForm.value.longitude : 0,
        Phone: this.signUpForm.value.phone ? this.signUpForm.value.phone : '',
      },
      User: {
        FirstName: this.signUpForm.value.firstName,
        MiddleName: this.signUpForm.value.middleName,
        FatherLastName: this.signUpForm.value.fatherLastName,
        MotherLastName: this.signUpForm.value.motherLastName,
        AdministrationTitle: this.signUpForm.value.adminTitle,
        Email: this.signUpForm.value.email,
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
    if (this.signUpForm.value.nonProfit === 'No' && ['PDAM', 'PSAV'].includes(this.signUpForm.value.program.name)) {
      // Open the confirmation dialog
      const confirmation = this._fuseConfirmationService.open({
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

      confirmation.afterClosed().subscribe((result) => {
        // If the confirm button pressed...
        if (result === 'confirmed') {
        }
      });
    }
  }

  stateFundsDeniedChange(event: any): void {
    console.log(event);
  }

  federalFundsDeniedChange(event: any): void {
    console.log(event);
  }
}
