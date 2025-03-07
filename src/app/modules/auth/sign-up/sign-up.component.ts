import { NgFor, NgIf } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { AuthService } from 'app/core/auth/auth.service';
import { City } from 'app/shared/models/City';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { UserAgencyRequest } from 'app/shared/models/Request/UserAgencyRequest';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { GeoService } from 'app/shared/services/geo.service';
import { UserService } from 'app/shared/services/user.service';
import { Subject } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Region } from 'app/shared/models/Region';
import { Program } from 'app/shared/models/Program';
import { LanguagesComponent } from 'app/layout/common/languages/languages.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { disableAllControlsExcept, enableAllControls, isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { NumericOnlyDirective } from 'app/shared/directives/numeric-only.directive';
import { ProgramService } from 'app/shared/services/program.service';

@Component({
  selector: 'auth-sign-up',
  templateUrl: './sign-up.component.html',
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
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatIconModule,
    TranslocoModule,
    NgFor,
    MatDividerModule,
    MatSnackBarModule,
    LanguagesComponent,
    MatTooltipModule,
    NumericOnlyDirective,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatTooltipModule,
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
  private _programService = inject(ProgramService);
  private _fuseConfirmationService = inject(FuseConfirmationService);
  private _snackBar = inject(MatSnackBar);

  private _translocoService = inject(TranslocoService);

  listPrograms: Program[] = [];
  listCities: City[] = [];
  listRegions: Region[] = [];
  listPostalRegions: Region[] = [];

  // Añadir nueva propiedad para controlar el estado del botón
  isEligible: boolean = true;

  // Tax Exemption Status Options
  taxExemptionStatusOptions: any[] = [{ id: 1, name: 'En Progreso' }, { id: 2, name: 'Otorgado' }];

  // Tax Exemption Type Options
  taxExemptionTypeOptions: any[] = [{ id: 1, name: 'Estatal' }, { id: 2, name: 'Federal' }];

  // Agregar esta propiedad
  protected readonly window = window;

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
      organizedAthleticPrograms: [null, Validators.required],

      // At Risk Service
      atRiskService: [{ value: null, disabled: true }],

      // Tax Exemption
      taxExemptionStatus: [null, Validators.required],
      taxExemptionType: [null, Validators.required],

      // Service Time
      serviceTime: [null, Validators.required],

      // Dirección
      address: [null, Validators.required],
      zipCode: [null, [Validators.required]],
      city: [null, Validators.required],
      region: [null, Validators.required],
      latitude: [null, Validators.required],
      longitude: [null, Validators.required],

      // Copiar Dirección Física
      sameAsPhysicalAddress: [false],

      // Dirección Postal
      postalAddress: [null, Validators.required],
      postalZipCode: [null, Validators.required],
      postalCity: [null, Validators.required],
      postalRegion: [null, Validators.required],

      // Datos del Contacto
      firstName: [null, Validators.required],
      middleName: [null],
      fatherLastName: [null, Validators.required],
      motherLastName: [null],

      // Datos del Correo Electrónico y Cargo
      email: [null, [Validators.required, Validators.email]],
      phone: [null, [Validators.required]],
      administrationTitle: [null, Validators.required],
    });

    // Deshabilitar inicialmente todos los controles excepto program
    disableAllControlsExcept(this.signUpForm, 'program');

    // Suscribirse a cambios en el control program
    this.signUpForm.get('program').valueChanges
      .subscribe(value => {
        // Deshabilitar todos los controles excepto program
        disableAllControlsExcept(this.signUpForm, 'program');

        if (value) {
          // Limpiar todos los valores excepto el programa
          const currentProgram = this.signUpForm.get('program').value;
          Object.keys(this.signUpForm.controls).forEach(key => {
            if (key !== 'program') {
              this.signUpForm.get(key).reset();
            }
          });

          // Habilitar todos los controles
          enableAllControls(this.signUpForm);

          // Restablecer el estado de elegibilidad
          this.isEligible = true;

          // Restablecer el control de atRiskService
          const atRiskControl = this.signUpForm.get('atRiskService');
          if (atRiskControl) {
            atRiskControl.disable();
            atRiskControl.setValue(null);
          }
        }
      });

    // Cargar ciudades y programas
    this.loadCities();
    this.loadPrograms();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // Método para cargar programas
  loadPrograms(): void {
    const queryParams: QueryParameters = {
      take: 25,
      skip: 0,
      alls: false,
      names: 'PDAM,PSAV,PACNA',
    };

    this._programService.getAllProgramsFromDb(queryParams).subscribe({
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
    const queryParameters: QueryParameters = {
      take: 1000,
      skip: 0,
      alls: true,
    };

    this._geoService.getCitiesFromDb(queryParameters).subscribe({
      next: (response) => {
        if (response?.body?.data) {
          this.listCities = response.body.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar las ciudades:', error);
      },
    });
  }

  // Método para obtener todas las ciudades según el ID de la región
  getCitiesByRegionId(region: Region): void {
    const queryParams: QueryParameters = {
      regionId: region.id,
      alls: true,
    };

    this._geoService.getCitiesByRegionId(queryParams).subscribe({
      next: (response: HttpResponse<any>) => {
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
  getRegionsByCityId(city: City, target: string): void {
    if (!city) return;

    const queryParameters: QueryParameters = {
      cityId: city.id,
    };

    this._geoService.getRegionsByCityId(queryParameters).subscribe({
      next: (response) => {
        if (response?.body?.data) {
          if (target === 'region') {
            this.listRegions = response.body.data;
            const regionControl = this.signUpForm.get('region');
            if (regionControl) {
              if (this.listRegions.length === 1) {
                // Asignar automáticamente la única región encontrada para Dirección Física
                this.signUpForm.patchValue({ region: this.listRegions[0] });
              } else {
                regionControl.setValue(null);
              }
            }
          } else if (target === 'postalRegion') {
            this.listPostalRegions = response.body.data;
            const regionControl = this.signUpForm.get('postalRegion');
            if (regionControl) {
              if (this.listPostalRegions.length === 1) {
                // Asignar automáticamente la única región encontrada para Dirección Postal
                this.signUpForm.patchValue({ postalRegion: this.listPostalRegions[0] });
              } else {
                regionControl.setValue(null);
              }
            }
          }
        }
      },
      error: (error) => {
        console.error('Error al cargar las regiones:', error);
      },
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  signUp(): void {
    if (this.signUpForm.invalid) {
      this._snackBar.open(
        this._translocoService.translate('auth.sign-up.form-invalid.message'),
        this._translocoService.translate('auth.sign-up.form-invalid.close'),
        { duration: 5000 }
      );

      this.signUpForm.markAllAsTouched();
      return;
    }

    const formValues = this.signUpForm.value;
    const cityId: number = formValues.city?.id;
    const regionId: number = formValues.region?.id;
    const postalCityId: number = formValues.postalCity?.id;
    const postalRegionId: number = formValues.postalRegion?.id;

    // Verificar que se haya seleccionado un programa
    if (!formValues.program) {
      this._snackBar.open(
        this._translocoService.translate('auth.sign-up.program.required'),
        this._translocoService.translate('auth.sign-up.program.required-close'),
        { duration: 5000 }
      );
      return;
    }

    // Obtener el ID del programa seleccionado
    const programId = formValues.program?.id;

    // Validar que el programa sea válido
    if (!programId || typeof programId !== 'number') {
      this.alert = {
        type: 'error',
        message: this._translocoService.translate('auth.sign-up.program.required'),
      };
      this.showAlert = true;
      this.signUpForm.enable();
      return;
    }

    // Disable the form
    this.signUpForm.disable();

    // Hide the alert
    this.showAlert = false;

    // Obtener los valores del formulario
    const userAgencyRequest: UserAgencyRequest = {
      agency: {
        name: formValues.name ? formValues.name : '',
        // Datos de la Agencia
        sdrNumber: formValues.sdrNumber ? formValues.sdrNumber : 0,
        uieNumber: formValues.uieNumber ? formValues.uieNumber : 0,
        einNumber: formValues.einNumber ? formValues.einNumber : 0,
        // Dirección Física
        address: formValues.address ? formValues.address : '',
        zipCode: formValues.zipCode ? formValues.zipCode : 0,
        cityId: cityId,
        regionId: regionId,
        latitude: formValues.latitude ? formValues.latitude : 0,
        longitude: formValues.longitude ? formValues.longitude : 0,
        // Dirección Postal
        postalAddress: formValues.postalAddress ? formValues.postalAddress : '',
        postalZipCode: formValues.postalZipCode ? formValues.postalZipCode : 0,
        postalCityId: postalCityId,
        postalRegionId: postalRegionId,
        // Datos del usuario
        phone: formValues.phone ? formValues.phone : '',
        nonProfit: formValues.nonProfit === 'Yes' ? true : false,
        federalFundsDenied: formValues.federalFundsDenied === 'Yes' ? true : false,
        stateFundsDenied: formValues.stateFundsDenied === 'Yes' ? true : false,
        organizedAthleticPrograms: formValues.organizedAthleticPrograms === 'Yes' ? true : false,

        // At Risk Service
        atRiskService: formValues.atRiskService === 'Yes' ? true : false,

        // Tax Exemption
        taxExemptionStatus: formValues.taxExemptionStatus,
        taxExemptionType: formValues.taxExemptionType,

        // Service Time
        serviceTime: formValues.serviceTime ? formValues.serviceTime : 0,

        //
        programs: [programId],
        //
        email: formValues.email ? formValues.email : '',
      },
      user: {
        // Datos del Contacto
        firstName: formValues.firstName,
        middleName: formValues.middleName,
        fatherLastName: formValues.fatherLastName,
        motherLastName: formValues.motherLastName,
        // Datos del Correo Electrónico y Cargo
        administrationTitle: formValues.administrationTitle,
        email: formValues.email,
      },
    };

    // Registrar el usuario
    this._userService.registerUserAgency(userAgencyRequest, {}).subscribe({
      next: (response) => {
        console.log('Usuario creado con éxito', response);
        // Navigate to the confirmation required page
        this._customRouterService.navigate(['/sign-in']);
      },
      error: (error) => {
        console.error('Error al crear el usuario', error);
        // Re-enable the form
        this.signUpForm.enable();
        // Show error message
        this._snackBar.open(
          this._translocoService.translate('auth.sign-up.error.creating-user'),
          this._translocoService.translate('common.close'),
          { duration: 5000 }
        );
      },
      complete: () => {
        console.log('Proceso de creación de usuario completado');
        // Re-enable the form
        this.signUpForm.enable();
        // Reset the form
        this.signUpNgForm.resetForm();
      },
    });
  }

  nonProfitChange(event: any): void {
    const selectedProgram = this.signUpForm.value.program?.name;
    const isNotNonProfit = this.signUpForm.value.nonProfit === 'No';

    // Verificar elegibilidad para PDAM y PSAV
    if (isNotNonProfit && ['PDAM', 'PSAV'].includes(selectedProgram)) {
        this.isEligible = false;
        disableAllControlsExcept(this.signUpForm, 'program'); // Deshabilitar controles
        this._fuseConfirmationService.open({
            title: this._translocoService.translate('auth.sign-up.notification.title'),
            message: this._translocoService.translate('auth.sign-up.pdam-psav-not-eligible.message'),
            actions: {
                confirm: {
                    label: this._translocoService.translate('auth.sign-up.notification.confirm'),
                },
                cancel: {
                    show: false,
                },
            },
        });
    } else {
        this.isEligible = true;
        enableAllControls(this.signUpForm); // Habilitar controles
    }
  }

  checkFundsEligibility(): void {
    const selectedProgram = this.signUpForm.value.program?.name;
    const stateFundsDenied = this.signUpForm.value.stateFundsDenied === 'Yes';
    const federalFundsDenied = this.signUpForm.value.federalFundsDenied === 'Yes';

    // Verificar elegibilidad para PACNA
    if ((stateFundsDenied || federalFundsDenied) && selectedProgram === 'PACNA') {
        this.isEligible = false;
        disableAllControlsExcept(this.signUpForm, 'program'); // Deshabilitar controles
        this._fuseConfirmationService.open({
            title: this._translocoService.translate('auth.sign-up.notification.title'),
            message: this._translocoService.translate('auth.sign-up.pacna-not-eligible.message'),
            actions: {
                confirm: {
                    label: this._translocoService.translate('auth.sign-up.notification.confirm'),
                },
                cancel: {
                    show: false,
                },
            },
        });
    } else {
        this.isEligible = true;
        enableAllControls(this.signUpForm); // Habilitar controles
    }
  }

  checkOrganizedAthleticPrograms(): void {
    const selectedProgram = this.signUpForm.value.program?.name;
    const organizedAthleticPrograms = this.signUpForm.value.organizedAthleticPrograms === 'Yes';

    // Habilitar/deshabilitar atRiskService basado en la selección
    const atRiskServiceControl = this.signUpForm.get('atRiskService');
    if (organizedAthleticPrograms) {
        atRiskServiceControl.enable();
        atRiskServiceControl.setValidators([Validators.required]);
    } else {
        atRiskServiceControl.disable();
        atRiskServiceControl.clearValidators();
        atRiskServiceControl.setValue(null);
    }
    atRiskServiceControl.updateValueAndValidity();

    // Verificar elegibilidad para PACNA
    if (organizedAthleticPrograms && selectedProgram === 'PACNA') {
        this.isEligible = false;
        disableAllControlsExcept(this.signUpForm, 'program');
        this._fuseConfirmationService.open({
            title: this._translocoService.translate('auth.sign-up.notification.title'),
            message: this._translocoService.translate('auth.sign-up.pacna-not-eligible.message'),
            actions: {
                confirm: {
                    label: this._translocoService.translate('auth.sign-up.notification.confirm'),
                },
                cancel: {
                    show: false,
                },
            },
        });
    } else {
        this.isEligible = true;
        enableAllControls(this.signUpForm);
    }
  }

  checkAtRiskService(): void {
    const selectedProgram = this.signUpForm.value.program?.name;
    const atRiskService = this.signUpForm.value.atRiskService === 'Yes';

    // Verificar elegibilidad para PACNA
    if (atRiskService && selectedProgram === 'PACNA') {
        this.isEligible = false;
        disableAllControlsExcept(this.signUpForm, 'program'); // Deshabilitar controles
        this._fuseConfirmationService.open({
            title: this._translocoService.translate('auth.sign-up.notification.title'),
            message: this._translocoService.translate('auth.sign-up.pacna-not-eligible.message'),
            actions: {
                confirm: {
                    label: this._translocoService.translate('auth.sign-up.notification.confirm'),
                },
                cancel: {
                    show: false,
                },
            },
        });
    } else {
        this.isEligible = true;
        enableAllControls(this.signUpForm); // Habilitar controles
    }
  }

  checkServiceTime(): void {
    const serviceTime = this.signUpForm.value.serviceTime;
    if (serviceTime) {
        const today = new Date();
        const serviceDate = new Date(serviceTime);
        const diffInMonths = (today.getFullYear() - serviceDate.getFullYear()) * 12 +
                            (today.getMonth() - serviceDate.getMonth());

        if (diffInMonths < 12) {
            this.isEligible = false;
            disableAllControlsExcept(this.signUpForm, 'program');
            this._fuseConfirmationService.open({
                title: this._translocoService.translate('auth.sign-up.notification.title'),
                message: this._translocoService.translate('auth.sign-up.service-time-not-eligible.message'),
                actions: {
                    confirm: {
                        label: this._translocoService.translate('auth.sign-up.notification.confirm'),
                    },
                    cancel: {
                        show: false,
                    },
                },
            });
        } else {
            this.isEligible = true;
            enableAllControls(this.signUpForm);
        }
    }
  }

  // Copiar Dirección Física
  onCheckboxChange(event: any): void {
    if (event.checked) {
      // Primero asignamos los valores básicos
      this.signUpForm.patchValue({
        postalAddress: this.signUpForm.value.address,
        postalCity: this.signUpForm.value.city,
        postalZipCode: this.signUpForm.value.zipCode,
      });

      // Si hay una ciudad seleccionada, obtenemos sus regiones
      if (this.signUpForm.value.city) {
        this.getRegionsByCityId(this.signUpForm.value.city, 'postalRegion');
      }

      this.signUpForm.updateValueAndValidity();
    } else {
      this.signUpForm.patchValue({
        postalAddress: '',
        postalCity: '',
        postalRegion: '',
        postalZipCode: '',
      });
    }
  }

  compare(o1: any, o2: any): boolean {
    if (!isNullOrUndefinedEmptyStringNullArray(o2)) {
      return o1.Id === o2.Id;
    }
    return false;
  }

  comparePostal(o1: any, o2: any): boolean {
    if (!isNullOrUndefinedEmptyStringNullArray(o2)) {
      return o1.Id === o2.Id;
    }
    return false;
  }
}
