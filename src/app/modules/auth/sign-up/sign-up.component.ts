import { NgFor, NgIf } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Region } from 'app/shared/models/Region';
import { Program } from 'app/shared/models/Program';
import { LanguagesComponent } from 'app/layout/common/languages/languages.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { compare, comparePostal, disableAllControlsExcept, enableAllControls, isNullOrUndefinedEmptyStringNullArray, compareItems, maxDigitsValidator, alphanumericValidator } from 'app/shared/utils';
import { NumericOnlyDirective } from 'app/shared/directives/numeric-only.directive';
import { CfrInfoDialogComponent } from 'app/shared/components/cfr-info-dialog/cfr-info-dialog.component';
import { ProgramService } from 'app/shared/services/program.service';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
import { OptionSelection } from 'app/shared/models/OptionSelection';
import { catchError, debounceTime, first, map, Observable, of, switchMap, takeUntil, tap } from 'rxjs';
import { emailExistsValidator } from 'app/shared/validators/email-exists.validator';
import { isPSAVProgram, isPDAMOrPSAVProgram, isPACNAProgram, isPDAMProgram, isPFHFProgram, isPDFEProgram, isAESANProgram, isPAFProgram, PROGRAM_CODES } from 'app/shared/const';
import { environment } from 'environments/environment';
import { DynamicGridDirective } from 'app/shared/directives/dynamic-grid.directive';

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
    MatDialogModule,
    LanguagesComponent,
    MatTooltipModule,
    NumericOnlyDirective,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatTooltipModule,
    DynamicGridDirective,
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
  private _dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  private _optionSelectionService = inject(OptionSelectionService);
  private _translocoService = inject(TranslocoService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _route = inject(ActivatedRoute);

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

  // De poseer un contrato Público Alianza, especifique su modalidad
  // If you have a Public Alliance contract, please specify the type of contract
  // Socio-Económico (17), Híbrido (18)
  publicAllianceContract: OptionSelection[] = [];

  // ¿Es usted una Entidad Auspiciadora de Hogares? (Solo para programa PACNA)
  // Are you a Day Care Homes? (Only for PACNA program)
  // No, Sí, Ambos - Ahora usa OptionSelection
  isDayCareHomeOptions: OptionSelection[] = [];

  // ¿Su Entidad participa actualmente en alguno de los siguientes programas? (Solo para PSAV)
  // Does your Entity currently participate in any of the following programs? (Only for PSAV)
  // Early Head Start, Head Start, N/A
  participatesInHeadStartProgramOptions: OptionSelection[] = [];

  // Posición del Staff
  // Staff Position
  // Administrativo (19), Operativo (20), Miembro del Consejo (21)
  listAdministrativePositions: OptionSelection[] = [];

  // Current Language
  currentLang: string = 'es';

  // Agregar esta propiedad
  protected readonly window = window;

  // Compare methods
  compare = compare;
  comparePostal = comparePostal;
  compareItems = compareItems;

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
      uieNumber: [null, [Validators.required, Validators.maxLength(12), alphanumericValidator()]],
      einNumber: [null, [Validators.required, maxDigitsValidator(9)]],

      // Datos de la Agencia

      // ¿Es una organización sin fines de lucro?
      // Is it a non-profit organization?
      // Si (1) y No (2)
      nonProfit: [null, Validators.required],

      // ¿Posee Certificación de Registro de Educación Básica?
      // Do you have Basic Education Registry Certification?
      // Si (1) y No (2)
      basicEducationRegistry: [null, Validators.required],

      // ¿Está interesado en participar de horario extendido? (Solo para PACNA)
      // Are you interested in participating in extended hours? (Only for PACNA)
      // Si (1) y No (2)
      extendedHours: [null],

      // ¿Desde cuándo su Entidad ofrece servicios? (Solo para PACNA)
      servicesOfferedSince: [null],

      // ¿Ha sido denegado o descalificado de fondos estatales en los últimos siete años?
      // Have you been denied or disqualified from state funds in the last seven years?
      // Si (1) y No (2)
      stateFundsDenied: [null, Validators.required],

      // ¿Razón por la cual fue descalificado o denegado de fondos estatales?
      // Reason why the sponsor was disqualified or denied state funds?
      // Se activa cuando stateFundsDenied = true
      stateFundsDeniedReason: [null],

      // ¿Ha sido denegado o descalificado de fondos federales en los últimos siete años?
      // Have you been denied or disqualified from federal funds in the last seven years?
      // Si (1) y No (2)
      federalFundsDenied: [null, Validators.required],
    // ¿Razón por la cual fue descalificado o denegado de fondos federales?
    // Reason why the sponsor was disqualified or denied federal funds?
    // Se activa cuando federalFundsDenied = true
    federalFundsDeniedReason: [null],

      // ¿En qué estatus se encuentra su Exención Contributiva?"
      // In what status is your Tax Exemption?
      // En Proceso (3), Otorgado (4), Denegado (5)
      taxExemptionStatusId: [null, Validators.required],

      // ¿Qué tipo de Exención Contributiva tiene?
      // What type of Tax Exemption does it have?
      // Estatal (11), Federal (12)
      taxExemptionTypeId: [null, Validators.required],

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
      email: [null, [Validators.required, Validators.email], [emailExistsValidator(this._userService)]],
      phone: [null, [Validators.required]],

      // Posición del Staff
      // Staff Position
      // Administrativo (19), Operativo (20), Miembro del Consejo (21)
      positionId: [null, Validators.required],

      // Tipo de Entidad
      // Type of Entity
      // Gobierno (13), Privado (14)
      typeOfEntityId: [null, Validators.required],

      // Tipo de Solicitante
      // Type of Applicant
      // Laico (15), Base de fe (16)
      typeOfApplicantId: [null, Validators.required],

      // De poseer un contrato Público Alianza, especifique su modalidad
      // If you have a Public Alliance contract, please specify the type of contract
      // Socio-Económico (17), Híbrido (18)
      publicAllianceContractId: [null, Validators.required],

      // National Youth Program
      // ¿Su Institución es un Programa Nacional de Juventud?
      // Si (1) y No (2)
      // COMENTADO: Este campo ya NO se debe mostrar para NINGÚN programa
      // nationalYouthProgram: [null],

      // ¿Es usted una Entidad Auspiciadora de Hogares? (Solo para programa PACNA)
      // Are you a Day Care Homes? (Only for PACNA program)
      // No, Sí, Ambos - Ahora usa OptionSelection
      isDayCareHomeId: [null],

      // ¿Su Entidad participa actualmente en alguno de los siguientes programas? (Solo para PSAV)
      // Does your Entity currently participate in any of the following programs? (Only for PSAV)
      // Early Head Start, Head Start, N/A
      participatesInHeadStartProgramId: [null],
    });
  }

  ngOnInit(): void {
    // Obtener datos del resolver en lugar de suscribirse
    const resolvedData = this._route.snapshot.data['data'];

    if (resolvedData) {
      // Asignar ciudades
      this.listCities = resolvedData.cities.data || resolvedData.cities;

      // Asignar programas
      this.listPrograms = resolvedData.programs.data || resolvedData.programs;

      // Asignar opciones
      const allOptions = [...resolvedData.options1.data, ...resolvedData.options2.data];

      // Yes No Options (1, 2)
      this.yesNoOptions = allOptions.filter((option: OptionSelection) => option.optionKey === 'yesNo');

      // ¿En qué estatus se encuentra su Exención Contributiva?
      // In what status is your Tax Exemption?
      // En Proceso (3), Otorgado (4), Denegado (5)
      this.exceptionStatus = allOptions.filter((option: OptionSelection) => option.optionKey === 'exceptionStatus' && option.id !== 5);

      // ¿Qué tipo de Exención Contributiva tiene?
      // What type of Tax Exemption does it have?
      // Estatal (11), Federal (12)
      this.taxExemptionType = allOptions.filter((option: OptionSelection) => option.optionKey === 'taxExemptionType');

      // Tipo de Entidad
      // Type of Entity
      // Gobierno (13), Privado (14)
      this.typeOfEntity = allOptions.filter((option: OptionSelection) => option.optionKey === 'typeOfEntity');

      // Tipo de Solicitante
      // Type of Applicant
      // Laico (15), Base de fe (16)
      this.typeOfApplicant = allOptions.filter((option: OptionSelection) => option.optionKey === 'typeOfApplicant');

      // De poseer un contrato Público Alianza, especifique su modalidad
      // If you have a Public Alliance contract, please specify the type of contract
      // Socio-Económico (17), Híbrido (18)
      this.publicAllianceContract = allOptions.filter((option: OptionSelection) => option.optionKey === 'publicAllianceContract');

      // ¿Es usted una Entidad Auspiciadora de Hogares? (Solo para programa PACNA)
      // Are you a Day Care Homes? (Only for PACNA program)
      // No, Sí, Ambos
      this.isDayCareHomeOptions = allOptions.filter((option: OptionSelection) => option.optionKey === 'isDayCareHome');

      // ¿Su Entidad participa actualmente en alguno de los siguientes programas? (Solo para PSAV)
      // Does your Entity currently participate in any of the following programs? (Only for PSAV)
      // Early Head Start, Head Start, N/A
      this.participatesInHeadStartProgramOptions = allOptions.filter((option: OptionSelection) => option.optionKey === 'headStartProgram');

      // Posición del Staff
      // Staff Position
      // Administrativo (19), Operativo (20), Miembro del Consejo (21)
      this.listAdministrativePositions = allOptions.filter((option: OptionSelection) => option.optionKey === 'administrativePosition');

      this._changeDetectorRef.markForCheck();
    }

    // Suscribirse a cambios de idioma
    this._translocoService.langChanges$.pipe(takeUntil(this._unsubscribeAll)).subscribe((lang: string) => {
      this.currentLang = lang;
      this._changeDetectorRef.detectChanges();
    });

    // Suscribirse a cambios en el campo email para validación asíncrona adicional
    const emailControl = this.signUpForm.get('email');
    if (emailControl) {
      emailControl.statusChanges.pipe(
        takeUntil(this._unsubscribeAll),
        debounceTime(100)
      ).subscribe(() => {
        // Forzar detección de cambios cuando el estado del control cambia
        this._changeDetectorRef.markForCheck();
      });
    }

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

        // --- Lógica para nationalYouthProgram ---
        // Este campo ya NO se muestra para NINGÚN programa (incluyendo PSAV)
        // COMENTADO: El campo ya está oculto en el HTML, no se necesita lógica de validación
        /*
        const nationalYouthProgramControl = this.signUpForm.get('nationalYouthProgram');
        nationalYouthProgramControl.clearValidators();
        nationalYouthProgramControl.setValue(null);
        nationalYouthProgramControl.updateValueAndValidity();
        */
        // --- Fin lógica ---

        // --- Lógica para publicAllianceContract ---
        const publicAllianceContractControl = this.signUpForm.get('publicAllianceContractId');

        if (isPSAVProgram(currentProgram)) {
          // Para PSAV, quitar la validación requerida y limpiar el valor
          publicAllianceContractControl.clearValidators();
          publicAllianceContractControl.setValue(null);
        } else {
          // Para PDAM y PACNA, mantener la validación requerida
          publicAllianceContractControl.setValidators([Validators.required]);
        }

        publicAllianceContractControl.updateValueAndValidity();
        // --- Fin lógica ---

        // --- Lógica para isDayCareHomeId ---
        const isDayCareHomeControl = this.signUpForm.get('isDayCareHomeId');

        if (isPACNAProgram(currentProgram)) {
          isDayCareHomeControl.setValidators([Validators.required]);
        } else {
          isDayCareHomeControl.clearValidators();
          isDayCareHomeControl.setValue(null); // Limpiar si no es PACNA
        }

        isDayCareHomeControl.updateValueAndValidity();
        // --- Fin lógica ---

        // --- Lógica para participatesInHeadStartProgramId ---
        const participatesInHeadStartProgramControl = this.signUpForm.get('participatesInHeadStartProgramId');

        if (isPSAVProgram(currentProgram)) {
          participatesInHeadStartProgramControl.setValidators([Validators.required]);
        } else {
          participatesInHeadStartProgramControl.clearValidators();
          participatesInHeadStartProgramControl.setValue(null);
        }

        participatesInHeadStartProgramControl.updateValueAndValidity();
        // --- Fin lógica ---

        // --- Lógica para basicEducationRegistry ---
        const basicEducationRegistryControl = this.signUpForm.get('basicEducationRegistry');

        if (isPSAVProgram(currentProgram)) {

            // Para PSAV, quitar la validación requerida y limpiar el valor
          basicEducationRegistryControl.clearValidators();
          basicEducationRegistryControl.setValue(null);

        } else {
          // Para otros programas, mantener la validación requerida
          basicEducationRegistryControl.setValidators([Validators.required]);
        }

        basicEducationRegistryControl.updateValueAndValidity();
        // --- Fin lógica ---

        // Limpiar el campo extendedHours si no es PACNA
        if (!isPACNAProgram(currentProgram)) {
          this.signUpForm.get('extendedHours').setValue(null);
        }

        // Verificar el registro de educación básica si ya tiene un valor
        const basicEducationRegistry = this.signUpForm.get('basicEducationRegistry').value;

        if (basicEducationRegistry !== null && basicEducationRegistry !== undefined) {
          this.checkBasicEducationRegistry();
        }

        // Actualizar validaciones de exención contributiva para PACNA tras cambio de programa
        this.updateTaxExemptionValidatorsForPacna();
      }
    });

    // Suscribirse a cambios en el control basicEducationRegistry
    this.signUpForm.get('basicEducationRegistry').valueChanges.subscribe(() => {
      this.checkBasicEducationRegistry();
    });

    // Suscribirse a cambios en el control extendedHours
    this.signUpForm.get('extendedHours').valueChanges.subscribe(() => {
      this.checkBasicEducationRegistry();
    });

    // Validación dinámica para servicesOfferedSince (PACNA + No futura)
    this.signUpForm.get('program').valueChanges.subscribe((program) => {
      const ctrl = this.signUpForm.get('servicesOfferedSince');
      if (!ctrl) return;
      if (isPACNAProgram(program)) {
        ctrl.setValidators([Validators.required]);
      } else {
        ctrl.clearValidators();
        ctrl.setValue(null);
      }
      ctrl.updateValueAndValidity();
    });

    this.signUpForm.get('servicesOfferedSince').valueChanges.subscribe((value) => {
      const ctrl = this.signUpForm.get('servicesOfferedSince');
      if (!ctrl) return;
      if (!value) {
        ctrl.setErrors(null);
        return;
      }
      const selectedDate = new Date(value);
      const today = new Date();
      selectedDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      if (selectedDate > today) {
        ctrl.setErrors({ futureDate: true });
      } else {
        // preservar otros errores como required
        const hasRequired = ctrl.hasError('required');
        ctrl.setErrors(hasRequired ? { required: true } : null);
      }
    });

    // Suscribirse a cambios en el control typeOfEntity
    this.signUpForm.get('typeOfEntityId').valueChanges.subscribe(() => {
      this.checkTypeOfEntity();
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

      },
      complete: () => {

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
            const currentPostalRegion = this.signUpForm.get('postalRegion')?.value;
            const physicalRegion = this.signUpForm.get('region')?.value;

            if (regionControl) {
              if (this.listPostalRegions.length === 1) {
                // Asignar automáticamente la única región encontrada para Dirección Postal
                this.signUpForm.patchValue({ postalRegion: this.listPostalRegions[0] });
              } else {
                // Si hay una región física seleccionada y está en la lista de regiones de la ciudad postal, mantenerla
                if (physicalRegion && this.listPostalRegions.some(r => r.id === physicalRegion.id)) {
                  this.signUpForm.patchValue({ postalRegion: physicalRegion });
                }
                // Si hay una región postal ya seleccionada y está en la lista, mantenerla
                else if (currentPostalRegion && this.listPostalRegions.some(r => r.id === currentPostalRegion.id)) {
                  // Ya está seleccionada, no hacer nada
                }
                // Si no hay región válida, establecer a null
                else {
                  regionControl.setValue(null);
                }
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
      this._snackBar.open(this._translocoService.translate('sign-up.form-invalid.message'), this._translocoService.translate('sign-up.form-invalid.close'), {
        duration: 5000,
      });

      this.signUpForm.markAllAsTouched();
      return;
    }

    const formValues = this.signUpForm.value;

    // Verificar que se haya seleccionado un programa
    if (!formValues.program) {
      this._snackBar.open(this._translocoService.translate('sign-up.program.required'), this._translocoService.translate('sign-up.program.required-close'), {
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
        message: this._translocoService.translate('sign-up.program.required'),
      };
      this.showAlert = true;
      this.signUpForm.enable();
      return;
    }

    // Validar que el correo no exista antes de continuar
    const email = formValues.email?.trim();
    if (email) {
      this._userService.checkEmailExists(email).subscribe({
        next: (response: any) => {
          const exists = response?.body?.exists || response?.exists || false;
          if (exists) {
            // El correo existe, mostrar error y no continuar
            const emailControl = this.signUpForm.get('email');
            if (emailControl) {
              emailControl.setErrors({ emailExists: true });
              emailControl.markAsTouched();
            }
            // Mostrar dialog en lugar de snackbar
            this._dialog.open(CfrInfoDialogComponent, {
              data: {
                title: this._translocoService.translate('sign-up.email.exists-title'),
                message: this._translocoService.translate('sign-up.email.exists'),
                cfrLink: null // No hay link CFR para este mensaje
              },
              disableClose: false,
              panelClass: ['mat-dialog-container', 'dialog-responsive']
            });
            this.signUpForm.enable();
            return;
          }
          // El correo no existe, continuar con el registro
          this.proceedWithRegistration(formValues, cityId, regionId, postalCityId, postalRegionId, programId);
        },
        error: (error) => {
          // En caso de error de red, permitir continuar (no bloquear)
          console.error('Error al verificar correo:', error);
          this.proceedWithRegistration(formValues, cityId, regionId, postalCityId, postalRegionId, programId);
        }
      });
    } else {
      // Si no hay email, continuar normalmente (la validación del formulario ya lo maneja)
      this.proceedWithRegistration(formValues, cityId, regionId, postalCityId, postalRegionId, programId);
    }
  }

  /**
   * Continúa con el proceso de registro después de validar el correo
   */
  private proceedWithRegistration(
    formValues: any,
    cityId: number,
    regionId: number,
    postalCityId: number,
    postalRegionId: number,
    programId: number
  ): void {
    // Disable the form
    this.signUpForm.disable();

    // Hide the alert
    this.showAlert = false;

    const name = formValues.name;
    const sdrNumber: number = formValues.sdrNumber ? parseInt(formValues.sdrNumber) : 0;
    const uieNumber: string = formValues.uieNumber ? formValues.uieNumber.toString() : '';
    const einNumber: number = formValues.einNumber ? parseInt(formValues.einNumber) : 0;
    const address: string = formValues.address;
    const zipCode: string = formValues.zipCode;
    const latitude: number = formValues.latitude;
    const longitude: number = formValues.longitude;
    const postalAddress: string = formValues.postalAddress;
    const postalZipCode: string = formValues.postalZipCode;

    const email = formValues.email;
    const phone = formValues.phone;

    const nonProfit = formValues.nonProfit;
    const basicEducationRegistry = formValues.basicEducationRegistry == null ? false : formValues.basicEducationRegistry;
    const federalFundsDenied = formValues.federalFundsDenied == null ? false : formValues.federalFundsDenied;
    const federalFundsDeniedReason = formValues.federalFundsDeniedReason; // Nuevo
    const stateFundsDenied = formValues.stateFundsDenied == null ? false : formValues.stateFundsDenied;
    const stateFundsDeniedReason = formValues.stateFundsDeniedReason;
    const taxExemptionStatusId = formValues.taxExemptionStatusId;
    const taxExemptionTypeId = formValues.taxExemptionTypeId == null ? 0 : formValues.taxExemptionTypeId;
    const typeOfEntityId = formValues.typeOfEntityId;
    const typeOfApplicantId = formValues.typeOfApplicantId == null ? 0 : formValues.typeOfApplicantId;
    const publicAllianceContractId = formValues.publicAllianceContractId == null ? null : formValues.publicAllianceContractId;
    // const nationalYouthProgram = formValues.nationalYouthProgram == null ? false : formValues.nationalYouthProgram;
    const nationalYouthProgram = false; // Siempre false ya que el campo está oculto
    const isDayCareHomeId = formValues.isDayCareHomeId == null ? 0 : formValues.isDayCareHomeId?.id || formValues.isDayCareHomeId;
    const participatesInHeadStartProgramId = formValues.participatesInHeadStartProgramId == null ? null : formValues.participatesInHeadStartProgramId?.id || formValues.participatesInHeadStartProgramId;
    const servicesOfferedSince: string | null = formValues.servicesOfferedSince
      ? new Date(formValues.servicesOfferedSince).toISOString()
      : null;

    const firstName = formValues.firstName;
    const middleName = formValues.middleName;
    const fatherLastName = formValues.fatherLastName;
    const motherLastName = formValues.motherLastName;
    const positionId = formValues.positionId;

    // Obtener los valores del formulario
    const userAgencyRequest: UserAgencyRequest = {
      agency: {
        name: name,
        // Datos de la Agencia
        sdrNumber: sdrNumber,
        uieNumber: uieNumber,
        einNumber: einNumber,
        // Dirección Física
        address: address,
        zipCode: zipCode,
        cityId: cityId,
        regionId: regionId,
        latitude: latitude,
        longitude: longitude,
        // Dirección Postal
        postalAddress: postalAddress,
        postalZipCode: postalZipCode,
        postalCityId: postalCityId,
        postalRegionId: postalRegionId,
        // Programas
        programs: [programId],
        // Datos del Correo Electrónico
        email: email,
        // Datos del usuario
        phone: phone,
        // ¿Es una organización sin fines de lucro?
        // Is it a non-profit organization?
        // Si (1) y No (2)
        nonProfit: nonProfit,
        // ¿Posee Certificación de Registro de Educación Básica?
        // Do you have Basic Education Registry Certification?
        // Si (1) y No (2)
        basicEducationRegistry: basicEducationRegistry,
        // ¿Ha sido denegado o descalificado de fondos federales en los últimos siete años?
        // Have you been denied or disqualified from federal funds in the last seven years?
        // Si (1) y No (2)
        federalFundsDenied: federalFundsDenied,
        federalFundsDeniedReason: federalFundsDeniedReason, // Nuevo
        // ¿Ha sido denegado o descalificado de fondos estatales en los últimos siete años?
        // Have you been denied or disqualified from state funds in the last seven years?
        // Si (1) y No (2)
        stateFundsDenied: stateFundsDenied,
        // ¿Razón por la cual fue descalificado o denegado de fondos estatales?
        // Reason why the sponsor was disqualified or denied state funds?
        // Se activa cuando stateFundsDenied = true
        stateFundsDeniedReason: stateFundsDeniedReason,
        // ¿En qué estatus se encuentra su Exención Contributiva?
        // In what status is your Tax Exemption?
        // En Proceso (3), Otorgado (4), Denegado (5)
        taxExemptionStatusId: taxExemptionStatusId,
        // ¿Qué tipo de Exención Contributiva tiene?
        // What type of Tax Exemption does it have?
        // Estatal (11), Federal (12)
        taxExemptionTypeId: taxExemptionTypeId,
        // Tipo de Entidad
        // Type of Entity
        // Gobierno (13), Privado (14)
        typeOfEntityId: typeOfEntityId,
        // Tipo de Solicitante
        // Type of Applicant
        // Laico (15), Base de fe (16)
        typeOfApplicantId: typeOfApplicantId,
        // De poseer un contrato Público Alianza, especifique su modalidad
        // If you have a Public Alliance contract, please specify the type of contract
        // Socio-Económico (17), Híbrido (18)
        publicAllianceContractId: publicAllianceContractId,
        // National Youth Program
        // ¿Su Institución es un Programa Nacional de Juventud?
        // Si (1) y No (2)
        // COMENTADO: Este campo ya NO se debe enviar, siempre se envía como false
        nationalYouthProgram: false,
        // ¿Es usted una Entidad Auspiciadora de Hogares? (Solo para programa PACNA)
        // Are you a Day Care Homes? (Only for PACNA program)
        // No, Sí, Ambos - Ahora usa OptionSelection
        isDayCareHomeId: isDayCareHomeId,
        // ¿Su Entidad participa actualmente en alguno de los siguientes programas? (Solo para PSAV)
        // Does your Entity currently participate in any of the following programs? (Only for PSAV)
        // Early Head Start, Head Start, N/A
        participatesInHeadStartProgramId: participatesInHeadStartProgramId,
        servicesOfferedSince: servicesOfferedSince ?? undefined,
      },
      staff: {
        // Datos del Contacto
        firstName: firstName,
        middleName: middleName,
        fatherLastName: fatherLastName,
        motherLastName: motherLastName,
        // Datos del Correo Electrónico y Cargo
        positionId: positionId,
        email: email,
        // Datos adicionales del Staff
        phoneNumber: phone,
        imageURL: '', // Por defecto vacío, se puede actualizar después
        // Campos requeridos con valores por defecto
        statusId: 21, // Activo por defecto
        staffTypeId: 1, // Empleado por defecto
        staffClassificationId: 1, // Empleado Administrativo por defecto
        birthDate: null, // Fecha por defecto, se puede actualizar después
        postalAddress: postalAddress,
        cityId: cityId,
        regionId: regionId,
        areaCode: '787', // Código de área por defecto para PR
        isActive: true,
      },
    };

    // Registrar el usuario
    this._userService.registerUserAgency(userAgencyRequest, {}).subscribe({
      next: (response) => {
        // Mostrar mensaje de éxito del backend
        const message = response?.value?.message || this._translocoService.translate('sign-up.success.default');
        this._snackBar.open(message, this._translocoService.translate('sign-up.close'), { duration: 5000 });
        // Navigate to the confirmation required page
        this._customRouterService.navigate(['/sign-in']);
      },
      error: (error) => {
        // Mostrar mensaje de error del backend si existe
        let errorMessage = this._translocoService.translate('sign-up.error.creating-user');
        if (error?.error?.value?.message) {
          errorMessage = error.error.value.message;
        } else if (error?.error?.message) {
          errorMessage = error.error.message;
        }
        this._snackBar.open(errorMessage, this._translocoService.translate('sign-up.close'), { duration: 5000 });
        // Re-enable the form
        this.signUpForm.enable();
      },
      complete: () => {
        // Re-enable the form
        this.signUpForm.enable();
        // Reset the form
        if (!environment.production) {
          this.signUpNgForm.resetForm();
        }
      },
    });
  }

  // Si la agencia no es una organización sin fines de lucro, deshabilitar el formulario
  // Si la agencia es una organización sin fines de lucro, habilitar el formulario
  nonProfitChange(event: any): void {
    const selectedProgram = this.signUpForm.value.program;
    // Obtener el valor directamente del evento si está disponible
    // El evento contiene el booleanValue (true para "Sí", false para "No")
    const nonProfitValue = event?.value !== undefined ? event.value : this.signUpForm.value.nonProfit;
    const isNotNonProfit = nonProfitValue === false;

    // Verificar elegibilidad para PSAV
    if (isNotNonProfit && isPSAVProgram(selectedProgram)) {
      this.nonProfitChangePSAV();
      return;
    }

    // Verificar elegibilidad para PDAM
    if (isNotNonProfit && isPDAMProgram(selectedProgram)) {
      this.nonProfitChangePDAM();
      return;
    }

    // Si no hay problemas de elegibilidad, habilitar el formulario
    this.isEligible = true;
    enableAllControls(this.signUpForm);

    // Actualizar validaciones de exención contributiva para PACNA
    this.updateTaxExemptionValidatorsForPacna();
  }

  // Actualiza validaciones y visibilidad (lógica) de exención contributiva para PACNA
  private updateTaxExemptionValidatorsForPacna(): void {
    const selectedProgram = this.signUpForm.get('program')?.value;
    const isPacna = isPACNAProgram(selectedProgram);
    const isNonProfit = this.signUpForm.get('nonProfit')?.value === true;

    const taxExemptionStatusControl = this.signUpForm.get('taxExemptionStatusId');
    const taxExemptionTypeControl = this.signUpForm.get('taxExemptionTypeId');

    if (isPacna && !isNonProfit) {
      // En PACNA y NO sin fines de lucro: ocultar y NO requerir
      taxExemptionStatusControl?.clearValidators();
      taxExemptionTypeControl?.clearValidators();
      taxExemptionStatusControl?.setValue(null);
      taxExemptionTypeControl?.setValue(null);
    } else {
      // En otros casos mantener requerido
      taxExemptionStatusControl?.setValidators([Validators.required]);
      taxExemptionTypeControl?.setValidators([Validators.required]);
    }

    taxExemptionStatusControl?.updateValueAndValidity({ emitEvent: false });
    taxExemptionTypeControl?.updateValueAndValidity({ emitEvent: false });
    this._changeDetectorRef.markForCheck();
  }

  // Indica si se deben mostrar los campos de exención contributiva en el template
  shouldShowTaxExemption(): boolean {
    const selectedProgram = this.signUpForm.get('program')?.value;
    const isPacna = isPACNAProgram(selectedProgram);
    const isNonProfit = this.signUpForm.get('nonProfit')?.value === true;

    if (isPacna) {
      return isNonProfit === true;
    }

    return true;
  }

  // Manejar cambio de non-profit para programa PSAV
  nonProfitChangePSAV(): void {
    this.isEligible = false;
    disableAllControlsExcept(this.signUpForm, 'program');
    this._dialog.open(CfrInfoDialogComponent, {
      data: {
        title: this._translocoService.translate('sign-up.pdam-psav-not-eligible.title'),
        message: this._translocoService.translate('sign-up.pdam-psav-not-eligible.message'),
        cfrLink: {
          url: 'https://www.ecfr.gov/current/title-7/subtitle-B/chapter-II/subchapter-A/part-225/subpart-A/section-225.14',
          text: this._translocoService.translate('sign-up.pdam-psav-not-eligible.cfr-link-text')
        }
      },
      disableClose: false,
      panelClass: ['mat-dialog-container', 'dialog-responsive']
    });
  }

  // Manejar cambio de non-profit para programa PDAM
  nonProfitChangePDAM(): void {
    this.isEligible = false;
    disableAllControlsExcept(this.signUpForm, 'program');
    this._dialog.open(CfrInfoDialogComponent, {
      data: {
        title: this._translocoService.translate('sign-up.pdam-not-eligible.title'),
        message: this._translocoService.translate('sign-up.pdam-not-eligible.message'),
        cfrLink: {
          url: 'https://www.ecfr.gov/current/title-7/subtitle-B/chapter-II/subchapter-A/part-210#p-210.9(b)(1)',
          text: this._translocoService.translate('sign-up.pdam-not-eligible.cfr-link-text')
        }
      },
      disableClose: false,
      panelClass: ['mat-dialog-container', 'dialog-responsive']
    });
  }

  // Manejar el cambio en el campo stateFundsDenied
  checkStateFundsDenied(): void {
    const stateFundsDenied = this.signUpForm.value.stateFundsDenied === true;
    const stateFundsDeniedReasonControl = this.signUpForm.get('stateFundsDeniedReason');

    if (stateFundsDenied) {
      // Si se selecciona "Sí", hacer el campo requerido
      stateFundsDeniedReasonControl?.setValidators([Validators.required]);
    } else {
      // Si se selecciona "No", limpiar validaciones y valor
      stateFundsDeniedReasonControl?.clearValidators();
      stateFundsDeniedReasonControl?.setValue(null);
    }

    // Actualizar el estado de validación
    stateFundsDeniedReasonControl?.updateValueAndValidity();
  }

  // Manejar el cambio en el campo federalFundsDenied
  checkFederalFundsDenied(): void {
    const federalFundsDenied = this.signUpForm.value.federalFundsDenied === true;
    const federalFundsDeniedReasonControl = this.signUpForm.get('federalFundsDeniedReason');

    if (federalFundsDenied) {
      // Si se selecciona "Sí", hacer el campo requerido
      federalFundsDeniedReasonControl?.setValidators([Validators.required]);
    } else {
      // Si se selecciona "No", limpiar validaciones y valor
      federalFundsDeniedReasonControl?.clearValidators();
      federalFundsDeniedReasonControl?.setValue(null);
    }

    // Actualizar el estado de validación
    federalFundsDeniedReasonControl?.updateValueAndValidity();
  }

  // Manejar el cambio en el campo participatesInHeadStartProgramId
  // Bloquea el formulario si se selecciona una opción con booleanValue === true
  checkParticipatesInHeadStartProgram(): void {
    const selectedOption = this.signUpForm.value.participatesInHeadStartProgramId;

    // Si no hay opción seleccionada, habilitar el formulario
    if (!selectedOption) {
      this.isEligible = true;
      enableAllControls(this.signUpForm);
      return;
    }

    // Obtener la opción completa del array para verificar su booleanValue
    // El valor puede ser un objeto OptionSelection o solo el ID
    let selectedOptionObj: OptionSelection | null = null;

    if (selectedOption && typeof selectedOption === 'object' && 'id' in selectedOption) {
      // Si es un objeto OptionSelection completo
      selectedOptionObj = selectedOption;
    } else if (selectedOption && typeof selectedOption === 'number') {
      // Si es solo el ID, buscar la opción en el array
      selectedOptionObj = this.participatesInHeadStartProgramOptions.find(
        opt => opt.id === selectedOption
      ) || null;
    }

    // Verificar si la opción seleccionada tiene booleanValue === true
    if (selectedOptionObj && selectedOptionObj.booleanValue === true) {
      // Bloquear el formulario
      this.isEligible = false;
      disableAllControlsExcept(this.signUpForm, ['program', 'participatesInHeadStartProgramId']);

      // Mostrar diálogo con mensaje de no elegibilidad (similar a nonProfitChangePSAV)
      this._dialog.open(CfrInfoDialogComponent, {
        data: {
          title: this._translocoService.translate('sign-up.participates-in-head-start-program.not-eligible.title'),
          message: this._translocoService.translate('sign-up.participates-in-head-start-program.not-eligible.message'),
          cfrLink: {
            url: '', // Pendiente validar URL exacta
            text: this._translocoService.translate('sign-up.participates-in-head-start-program.not-eligible.cfr-link-text')
          }
        },
        disableClose: false,
        panelClass: ['mat-dialog-container', 'dialog-responsive']
      });
    } else {
      // Si se selecciona una opción con booleanValue === false o null, habilitar el formulario
      this.isEligible = true;
      enableAllControls(this.signUpForm);
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
  // Si el programa es PDAM y el registro de educación básica es "No" (false), deshabilitar el formulario
  // Si el programa no es PDAM o el registro de educación básica no es "No", habilitar el formulario
  checkBasicEducationRegistry(): void {
    const selectedProgram = this.signUpForm.value.program;
    const basicEducationRegistry = this.signUpForm.get('basicEducationRegistry').value;

    // No validar si no hay programa seleccionado o si basicEducationRegistry es null/undefined
    if (!selectedProgram || basicEducationRegistry === null || basicEducationRegistry === undefined) {
      this.isEligible = true;
      enableAllControls(this.signUpForm);
      return;
    }

    // Verificar elegibilidad para PDAM cuando no tiene registro de educación básica (false = No)
    if (!basicEducationRegistry && isPDAMProgram(selectedProgram)) {
      this.isEligible = false;
      disableAllControlsExcept(this.signUpForm, 'program');
      this._fuseConfirmationService.open({
        title: this._translocoService.translate('sign-up.notification.title'),
        message: this._translocoService.translate('sign-up.basic-education-not-eligible.message'),
        actions: {
          confirm: {
            label: this._translocoService.translate('sign-up.notification.confirm'),
          },
          cancel: {
            show: false,
          },
        },
      });
      return;
    }

    // Verificar elegibilidad para PACNA cuando no está interesado en horario extendido (false = No)
    const extendedHours = this.signUpForm.get('extendedHours')?.value;
    if (basicEducationRegistry && isPACNAProgram(selectedProgram) && extendedHours !== null && extendedHours !== undefined && extendedHours === false) {
      this.isEligible = false;
      disableAllControlsExcept(this.signUpForm, 'program');
      this._dialog.open(CfrInfoDialogComponent, {
        data: {
          title: this._translocoService.translate('sign-up.notification.title'),
          message: this._translocoService.translate('sign-up.extended-hours-not-eligible.message'),
          cfrLink: {
            url: 'https://www.ecfr.gov/current/title-7/subtitle-B/chapter-II/subchapter-A/part-226/subpart-E/section-226.19',
            text: '7 CFR 226.19 -- Outside-school-hours care center provisions'
          }
        },
        disableClose: false,
        panelClass: ['mat-dialog-container', 'dialog-responsive']
      });
      return;
    }

    // Si no hay problemas de elegibilidad, habilitar el formulario
    this.isEligible = true;
    enableAllControls(this.signUpForm);
  }

  // Abrir dialog de información sobre fondos estatales
  openStateFundsDeniedDialog(): void {
    const program = this.signUpForm?.value?.program;
    const isPacna = isPACNAProgram(program);
    const baseKey = isPacna ? 'cfr-info-dialog.cfr-226-6' : 'cfr-info-dialog.cfr-225-6-b-9';
    this.openCfrInfoByKey(baseKey);
  }

  // Clave base para fondos estatales según programa (para usar directo desde el HTML)
  getStateFundsDeniedKey(): string {
    const program = this.signUpForm?.value?.program;
    return isPACNAProgram(program)
      ? 'cfr-info-dialog.cfr-226-6'
      : 'cfr-info-dialog.cfr-225-6-b-9';
  }

  // Función ÚNICA para abrir el diálogo CFR dado un key base (title/message/cfr-link-text/cfr-link-url)
  openCfrInfoByKey(baseKey: string): void {
    const data = {
      title: this._translocoService.translate(`${baseKey}.title`),
      message: this._translocoService.translate(`${baseKey}.message`),
      cfrLink: {
        url: this._translocoService.translate(`${baseKey}.cfr-link-url`),
        text: this._translocoService.translate(`${baseKey}.cfr-link-text`),
      },
    };
    this._dialog.open(CfrInfoDialogComponent, {
      data,
      disableClose: false,
      panelClass: ['mat-dialog-container', 'dialog-responsive']
    });
  }

  // Manejar cambio en Estatus de Exención Contributiva
  checkTaxExemptionStatus(): void {
    const selectedProgram = this.signUpForm?.value?.program;
    const statusId = this.signUpForm?.value?.taxExemptionStatusId;

    // En PACNA, si está "En Proceso" (id 3), bloquear y mostrar CFR info
    if (isPACNAProgram(selectedProgram) && statusId === 3) {
      this.isEligible = false;
      disableAllControlsExcept(this.signUpForm, 'program');
      this.openCfrInfoByKey('cfr-info-dialog.cfr-226-15-a');
      return;
    }

    // Caso contrario, re-habilitar el formulario
    this.isEligible = true;
    enableAllControls(this.signUpForm);
  }
}
