import { NgFor, NgIf } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
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
import { compare, comparePostal, disableAllControlsExcept, enableAllControls, isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { NumericOnlyDirective } from 'app/shared/directives/numeric-only.directive';
import { ProgramService } from 'app/shared/services/program.service';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
import { OptionSelection } from 'app/shared/models/OptionSelection';
import { takeUntil } from 'rxjs';
import { isPSAVProgram, isPDAMOrPSAVProgram, isPACNAProgram, isPDAMProgram, isPFHFProgram, isPDFEProgram, isAESANProgram, isPAFProgram, PROGRAM_CODES } from 'app/shared/const';

@Component({
  selector: 'auth-sign-up',
  templateUrl: './sign-up.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  private _optionSelectionService = inject(OptionSelectionService);
  private _translocoService = inject(TranslocoService);
  private _changeDetectorRef = inject(ChangeDetectorRef);

  listPrograms: Program[] = [];
  listCities: City[] = [];
  listRegions: Region[] = [];
  listPostalRegions: Region[] = [];

  // Añadir nueva propiedad para controlar el estado del botón
  isEligible: boolean = true;

  // Yes No Options (1, 2)
  // Si (1) y No (2)
  yesNoOptions: OptionSelection[] = [];

  // ¿En qué estatus se encuentra su Exención Contributiva?
  // In what status is your Tax Exemption?
  // En Proceso (3), Otorgado (4), Denegado (5)
  exceptionStatus: OptionSelection[] = [];

  // ¿Qué tipo de Exención Contributiva tiene?
  // What type of Tax Exemption does it have?
  // Estatal (11), Federal (12)
  taxExemptionType: OptionSelection[] = [];

  // Basic Education Registry Options (4, 5, 6)
  //basicEducationRegistryOptions = optionSelectionData.filter(option => option.optionKey === 'taxExemptionStatus');

  // Tipo de Entidad
  // Type of Entity
  // Gobierno (13), Privado (14)
  typeOfEntity: OptionSelection[] = [];

  // Tipo de Solicitante
  // Type of Applicant
  // Laico (15), Base de fe (16)
  typeOfApplicant: OptionSelection[] = [];

  // ¿De poseer un contrato Público Alianza especifique su modalidad?
  // If you have a Public Alliance contract, please specify the type of contract
  // Socio-Económico (17), Híbrido (18)
  publicAllianceContract: OptionSelection[] = [];

  currentLang: string = 'es';

  // Agregar esta propiedad
  protected readonly window = window;

  // Compare methods
  compare = compare;
  comparePostal = comparePostal;

  // Program helper functions for template
  isPSAVProgram = isPSAVProgram;
  isPDAMProgram = isPDAMProgram;
  isPACNAProgram = isPACNAProgram;
  isPFHFProgram = isPFHFProgram;
  isPDFEProgram = isPDFEProgram;
  isAESANProgram = isAESANProgram;
  isPAFProgram = isPAFProgram;
  isPDAMOrPSAVProgram = isPDAMOrPSAVProgram;

  constructor() {
    // Inicializar el formulario en el constructor para evitar errores de undefined
    // Create the form
    this.signUpForm = this._formBuilder.group({
        name: [null, Validators.required],
        program: [null, Validators.required],

        // Datos de la Agencia
        sdrNumber: [null, [Validators.required]],
        uieNumber: [null, [Validators.required]],
        einNumber: [null, [Validators.required]],

        // Datos de la Agencia

        // ¿Es una organización sin fines de lucro?
        // Is it a non-profit organization?
        // Si (1) y No (2)
        nonProfit: [null, Validators.required],

        // ¿Posee Certificación de Registro de Educación Básica?
        // Do you have Basic Education Registry Certification?
        // En Proceso (3), Otorgado (4), Denegado (5)
        basicEducationRegistryId: [null, Validators.required],

        // ¿Ha sido denegado o descalificado de fondos estatales en los últimos siete años?
        // Have you been denied or disqualified from state funds in the last seven years?
        // Si (1) y No (2)
        stateFundsDenied: [null, Validators.required],

        // ¿Ha sido denegado o descalificado de fondos federales en los últimos siete años?
        // Have you been denied or disqualified from federal funds in the last seven years?
        // Si (1) y No (2)
        federalFundsDenied: [null, Validators.required],

        // ¿El Auspiciador ofrece programas atléticos organizados que participan en deportes competitivos interescolares o a nivel comunitario?
        // Does the Sponsor offer any organized athletic programs engaged in interscholastic or community level competitive sports?
        // Si (1) y No (2)
        organizedAthleticPrograms: [null, Validators.required],

        // ¿Está interesado en participar en el servicio de merienda y cena en riesgo?
        // Is the Sponsor interested in participating in the at-risk snack and dinner service?
        // Si (1) y No (2)
        atRiskService: [{ value: null, disabled: true }],

        // ¿En qué estatus se encuentra su Exención Contributiva?"
        // In what status is your Tax Exemption?
        // En Proceso (3), Otorgado (4), Denegado (5)
        taxExemptionStatusId: [null, Validators.required],

        // ¿Qué tipo de Exención Contributiva tiene?
        // What type of Tax Exemption does it have?
        // Estatal (11), Federal (12)
        taxExemptionTypeId: [null, Validators.required],

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
        fatherLastName: [null],
        motherLastName: [null],

        // Datos del Correo Electrónico y Cargo
        email: [null, [Validators.required, Validators.email]],
        phone: [null, [Validators.required]],
        administrationTitle: [null, Validators.required],

        // Tipo de Entidad
        // Type of Entity
        // Gobierno (13), Privado (14)
        typeOfEntityId: [null, Validators.required],

        // Tipo de Solicitante
        // Type of Applicant
        // Laico (15), Base de fe (16)
        typeOfApplicantId: [null, Validators.required],

        // ¿De poseer un contrato Público Alianza especifique su modalidad?
        // If you have a Public Alliance contract, please specify the type of contract
        // Socio-Económico (17), Híbrido (18)
        publicAllianceContractId: [null, Validators.required],

        // National Youth Program
        // ¿Su Institución es un Programa Nacional de Juventud?
        // Si (1) y No (2)
        nationalYouthProgram: [null],
      });
  }

  ngOnInit(): void {
    // Suscribirse a cambios de idioma
    this._translocoService.langChanges$.pipe(takeUntil(this._unsubscribeAll)).subscribe((lang: string) => {
      this.currentLang = lang;
      this._changeDetectorRef.detectChanges();
    });



    // Deshabilitar inicialmente todos los controles excepto program
    disableAllControlsExcept(this.signUpForm, 'program');

    // Suscribirse a cambios en el control program
    this.signUpForm.get('program').valueChanges.subscribe((value) => {
      // Deshabilitar todos los controles excepto program
      disableAllControlsExcept(this.signUpForm, 'program');

      if (value) {
        // Limpiar todos los valores excepto el programa
        const currentProgram = this.signUpForm.get('program').value;
        Object.keys(this.signUpForm.controls).forEach((key) => {
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

        // --- Lógica para nationalYouthProgram ---
        const nationalYouthProgramControl = this.signUpForm.get('nationalYouthProgram');
        if (isPSAVProgram(currentProgram)) {
          nationalYouthProgramControl.setValidators([Validators.required]);
        } else {
          nationalYouthProgramControl.clearValidators();
          nationalYouthProgramControl.setValue(null); // Limpiar si no es PSAV
        }
        nationalYouthProgramControl.updateValueAndValidity();
        // --- Fin lógica ---

        // Verificar el registro de educación básica si ya tiene un valor
        const basicEducationRegistry = this.signUpForm.get('basicEducationRegistryId').value;
        if (basicEducationRegistry) {
          this.checkBasicEducationRegistry();
        }
      }
    });

    // Suscribirse a cambios en el control basicEducationRegistry
    this.signUpForm.get('basicEducationRegistryId').valueChanges.subscribe(() => {
      this.checkBasicEducationRegistry();
    });

    // Suscribirse a cambios en el control typeOfEntity
    this.signUpForm.get('typeOfEntityId').valueChanges.subscribe(() => {
      this.checkTypeOfEntity();
    });

    // Cargar programas
    this._programService.programs$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.listPrograms = result.body.data;
        this._changeDetectorRef.detectChanges();
      }
    });

    // Cargar ciudades
    this._geoService.cities$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.listCities = result.body;
        this._changeDetectorRef.detectChanges();
      }
    });

    // Cargar opciones
    this._optionSelectionService.options$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        // Yes No Options (1, 2)
        this.yesNoOptions = result.body.data.filter((option: OptionSelection) => option.optionKey === 'yesNo');

        // ¿En qué estatus se encuentra su Exención Contributiva?
        // In what status is your Tax Exemption?
        // En Proceso (3), Otorgado (4), Denegado (5)
        this.exceptionStatus = result.body.data.filter((option: OptionSelection) => option.optionKey === 'exceptionStatus' && option.id !== 5);

        // ¿Qué tipo de Exención Contributiva tiene?
        // What type of Tax Exemption does it have?
        // Estatal (11), Federal (12)
        this.taxExemptionType = result.body.data.filter((option: OptionSelection) => option.optionKey === 'taxExemptionType');

        // Tipo de Entidad
        // Type of Entity
        // Gobierno (13), Privado (14)
        this.typeOfEntity = result.body.data.filter((option: OptionSelection) => option.optionKey === 'typeOfEntity');

        // Tipo de Solicitante
        // Type of Applicant
        // Laico (15), Base de fe (16)
        this.typeOfApplicant = result.body.data.filter((option: OptionSelection) => option.optionKey === 'typeOfApplicant');

        // ¿De poseer un contrato Público Alianza especifique su modalidad?
        // If you have a Public Alliance contract, please specify the type of contract
        // Socio-Económico (17), Híbrido (18)
        this.publicAllianceContract = result.body.data.filter((option: OptionSelection) => option.optionKey === 'publicAllianceContract');

        this._changeDetectorRef.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // Método para obtener todas las ciudades según el ID de la región
  getCitiesByRegionId(region: Region): void {
    const queryParams: QueryParameters = {
      regionId: region.id,
      alls: true,
    };

    this._geoService.getCitiesByRegionId(queryParams).subscribe({
      next: (response: HttpResponse<any>) => {
        this.listCities = response.body;
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
      this._snackBar.open(this._translocoService.translate('auth.sign-up.form-invalid.message'), this._translocoService.translate('auth.sign-up.form-invalid.close'), {
        duration: 5000,
      });

      this.signUpForm.markAllAsTouched();
      return;
    }

    const formValues = this.signUpForm.value;

    // Verificar que se haya seleccionado un programa
    if (!formValues.program) {
      this._snackBar.open(this._translocoService.translate('auth.sign-up.program.required'), this._translocoService.translate('auth.sign-up.program.required-close'), {
        duration: 5000,
      });
      return;
    }

    const cityId: number = formValues.city?.id;
    const regionId: number = formValues.region?.id;
    const postalCityId: number = formValues.postalCity?.id;
    const postalRegionId: number = formValues.postalRegion?.id;

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
        sdrNumber: formValues.sdrNumber ? parseInt(formValues.sdrNumber) : 0,
        uieNumber: formValues.uieNumber ? parseInt(formValues.uieNumber) : 0,
        einNumber: formValues.einNumber ? parseInt(formValues.einNumber) : 0,
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
        // Service Time
        serviceTime: formValues.serviceTime ? formValues.serviceTime : 0,
        // Programas
        programs: [programId],
        // Datos del Correo Electrónico
        email: formValues.email ? formValues.email : '',
        // Datos del usuario
        phone: formValues.phone ? formValues.phone : '',
        // ¿Es una organización sin fines de lucro?
        // Is it a non-profit organization?
        // Si (1) y No (2)
        nonProfit: formValues.nonProfit,
        // ¿Posee Certificación de Registro de Educación Básica?
        // Do you have Basic Education Registry Certification?
        // En Proceso (3), Otorgado (4), Denegado (5)
        basicEducationRegistryId: formValues.basicEducationRegistryId ? formValues.basicEducationRegistryId : 0,
        // ¿Ha sido denegado o descalificado de fondos federales en los últimos siete años?
        // Have you been denied or disqualified from federal funds in the last seven years?
        // Si (1) y No (2)
        federalFundsDenied: formValues.federalFundsDenied,
        // ¿Ha sido denegado o descalificado de fondos estatales en los últimos siete años?
        // Have you been denied or disqualified from state funds in the last seven years?
        // Si (1) y No (2)
        stateFundsDenied: formValues.stateFundsDenied,
        // ¿El Auspiciador ofrece programas atléticos organizados que participan en deportes competitivos interescolares o a nivel comunitario?
        // Does the Sponsor offer any organized athletic programs engaged in interscholastic or community level competitive sports?
        // Si (1) y No (2)
        organizedAthleticPrograms: formValues.organizedAthleticPrograms,
        // ¿Está interesado en participar en el servicio de merienda y cena en riesgo?
        // Is the Sponsor interested in participating in the at-risk snack and dinner service?
        // Si (1) y No (2)
        // At Risk Service
        atRiskService: formValues.atRiskService == null ? false : formValues.atRiskService,
        // ¿En qué estatus se encuentra su Exención Contributiva?
        // In what status is your Tax Exemption?
        // En Proceso (3), Otorgado (4), Denegado (5)
        taxExemptionStatusId: formValues.taxExemptionStatusId,
        // ¿Qué tipo de Exención Contributiva tiene?
        // What type of Tax Exemption does it have?
        // Estatal (11), Federal (12)
        taxExemptionTypeId: formValues.taxExemptionTypeId,
        // Tipo de Entidad
        // Type of Entity
        // Gobierno (13), Privado (14)
        typeOfEntityId: formValues.typeOfEntityId,
        // Tipo de Solicitante
        // Type of Applicant
        // Laico (15), Base de fe (16)
        typeOfApplicantId: formValues.typeOfApplicantId,
        // ¿De poseer un contrato Público Alianza especifique su modalidad?
        // If you have a Public Alliance contract, please specify the type of contract
        // Socio-Económico (17), Híbrido (18)
        publicAllianceContractId: formValues.publicAllianceContractId,
        // National Youth Program
        // ¿Su Institución es un Programa Nacional de Juventud?
        // Si (1) y No (2)
        nationalYouthProgram: formValues.nationalYouthProgram == null ? false : formValues.nationalYouthProgram,
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
        // Mostrar mensaje de éxito del backend
        const message = response?.value?.message || this._translocoService.translate('auth.sign-up.success.default');
        this._snackBar.open(message, this._translocoService.translate('common.close'), { duration: 5000 });
        // Navigate to the confirmation required page
        this._customRouterService.navigate(['/sign-in']);
      },
      error: (error) => {
        // Mostrar mensaje de error del backend si existe
        let errorMessage = this._translocoService.translate('auth.sign-up.error.creating-user');
        if (error?.error?.value?.message) {
          errorMessage = error.error.value.message;
        } else if (error?.error?.message) {
          errorMessage = error.error.message;
        }
        this._snackBar.open(errorMessage, this._translocoService.translate('common.close'), { duration: 5000 });
        // Re-enable the form
        this.signUpForm.enable();
      },
      complete: () => {
        // Re-enable the form
        this.signUpForm.enable();
        // Reset the form
        this.signUpNgForm.resetForm();
      },
    });
  }

  // Si la agencia no es una organización sin fines de lucro, deshabilitar el formulario
  // Si la agencia es una organización sin fines de lucro, habilitar el formulario
  nonProfitChange(event: any): void {
    const selectedProgram = this.signUpForm.value.program;
    const isNotNonProfit = this.signUpForm.value.nonProfit === false;

    // Verificar elegibilidad para PDAM y PSAV
    if (isNotNonProfit && isPDAMOrPSAVProgram(selectedProgram)) {
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

  // deprecated, deshabilitar este método
  // Si la agencia no acepta fondos estatales o federales, deshabilitar el formulario
  // Si la agencia acepta fondos estatales o federales, habilitar el formulario
  checkFundsEligibility(): void {
    // TODO: deshabilitar este método
    return;

    const selectedProgram = this.signUpForm.value.program?.name;
    const stateFundsDenied = this.signUpForm.value.stateFundsDenied === true;
    const federalFundsDenied = this.signUpForm.value.federalFundsDenied === true;

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

  // Si el programa es PACNA y el campo Organized Athletic Programs es true, deshabilitar el formulario
  // Si el programa no es PACNA o el campo Organized Athletic Programs es false, habilitar el formulario
  checkOrganizedAthleticPrograms(): void {
    const selectedProgram = this.signUpForm.value.program;
    const organizedAthleticPrograms = this.signUpForm.value.organizedAthleticPrograms === true;

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

    // Verificar elegibilidad para PACNA solo si también quiere participar en merienda y cena en riesgo
    const atRiskService = this.signUpForm.value.atRiskService === true;
    if (organizedAthleticPrograms && atRiskService && isPACNAProgram(selectedProgram)) {
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
    const selectedProgram = this.signUpForm.value.program;
    const atRiskService = this.signUpForm.value.atRiskService === true;
    const organizedAthleticPrograms = this.signUpForm.value.organizedAthleticPrograms === true;

    // Verificar elegibilidad para PACNA solo si también ofrece programas atléticos
    if (atRiskService && organizedAthleticPrograms && isPACNAProgram(selectedProgram)) {
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
      const diffInMonths = (today.getFullYear() - serviceDate.getFullYear()) * 12 + (today.getMonth() - serviceDate.getMonth());

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

  // Check Type of Entity
  // Si es Gobierno, asignar automáticamente Socio-Económico (id: 1)
  // Si no es Gobierno, limpiar el campo
  checkTypeOfEntity(): void {
    const typeOfEntity = this.signUpForm.value.typeOfEntityId;
    if (typeOfEntity === 1) {
      this.signUpForm.patchValue({ publicAllianceContract: 1 });
    } else {
      this.signUpForm.patchValue({ publicAllianceContract: null });
    }
  }

  // Copiar Dirección Física
  // Si el checkbox está marcado, copiar los valores de la dirección física a la postal
  // Si el checkbox no está marcado, limpiar los campos de la dirección postal
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

  // Check Basic Education Registry
  // Si el programa es PDAM o PSAV y el registro de educación básica es "No" (id: 3), deshabilitar el formulario
  // Si el programa no es PDAM o PSAV o el registro de educación básica no es "No", habilitar el formulario
  checkBasicEducationRegistry(): void {
    const selectedProgram = this.signUpForm.value.program;
    const basicEducationRegistry = this.signUpForm.get('basicEducationRegistryId').value;

    console.log('Programa seleccionado:', selectedProgram);
    console.log('Valor de basicEducationRegistry:', basicEducationRegistry);

    // Verificar elegibilidad para PDAM y PSAV cuando no tiene registro de educación básica (opción "No" = 3)
    if (basicEducationRegistry === 3 && isPDAMOrPSAVProgram(selectedProgram)) {
      this.isEligible = false;
      disableAllControlsExcept(this.signUpForm, 'program');
      this._fuseConfirmationService.open({
        title: this._translocoService.translate('auth.sign-up.notification.title'),
        message: this._translocoService.translate('auth.sign-up.basic-education-not-eligible.message'),
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
