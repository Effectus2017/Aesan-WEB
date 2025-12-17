import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, FormControl, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { ViewEncapsulation } from '@angular/core';
import { StaffService } from 'app/shared/services/staff.service';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { StaffRequest } from 'app/shared/models/Request/StaffRequest';
import { NgForOf, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { provideNativeDateAdapter } from '@angular/material/core';
import { OptionSelection } from 'app/shared/models/OptionSelection';
import { AuthService } from 'app/core/auth/auth.service';
import { compare, compareById, comparePostal, isNullOrUndefinedEmptyStringNullArray, minimumAgeValidator } from 'app/shared/utils';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
import { GeoService } from 'app/shared/services/geo.service';
import { City } from 'app/shared/models/City';
import { Region } from 'app/shared/models/Region';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { StaffTypeService } from 'app/shared/services/staff-type.service';
import { StaffType } from 'app/shared/models/StaffType';
import { StaffClassificationService } from 'app/shared/services/staff-classification.service';
import { StaffClassification } from 'app/shared/models/StaffClassification';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'app/shared/services/user.service';
import { emailExistsValidator } from 'app/shared/validators/email-exists.validator';
import { puertoRicoZipCodeValidator } from 'app/shared/validators/puerto-rico-zip-code.validator';
import { PuertoRicoZipCodeDirective } from 'app/shared/directives/puerto-rico-zip-code.directive';
import { NumericOnlyDirective } from 'app/shared/directives/numeric-only.directive';



@Component({
  selector: 'app-admin-add-staff',
  templateUrl: './add.component.html',
  providers: [provideNativeDateAdapter()],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    GenericHeaderComponent,
    NgIf,
    NgForOf,
    TranslocoModule,
    MatDatepickerModule,
    MatTooltipModule,
    MatIconModule,
    MatTimepickerModule,
    MatIconModule,
    PuertoRicoZipCodeDirective,
    NumericOnlyDirective,
  ],
})
export class AdminAddStaffComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _staffService = inject(StaffService);
  private _customRouterService = inject(CustomRouterService);
  private _notificationService = inject(NotificationService);
  private _translocoService = inject(TranslocoService);
  private _authService = inject(AuthService);
  private _optionSelectionService = inject(OptionSelectionService);
  private _geoService = inject(GeoService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _staffTypeService = inject(StaffTypeService);
  private _staffClassificationService = inject(StaffClassificationService);
  private _activatedRoute = inject(ActivatedRoute);
  private _userService = inject(UserService);

  // Lista de Status
  listStatus: OptionSelection[] = [];
  // Lista de Posiciones
  listPositions: OptionSelection[] = [];
  // Lista de Tipos de Staff
  listStaffTypes: StaffType[] = [];
  // Lista de Clasificaciones de Staff
  listStaffClassifications: StaffClassification[] = [];
  // Lista de Ciudades
  listCities: City[] = [];
  // Lista de Regiones
  listRegions: Region[] = [];

  // Listas separadas para cada tipo de posición
  listAdministrativePositions: OptionSelection[] = [];
  listOperationalPositions: OptionSelection[] = [];
  listBoardMemberTitles: OptionSelection[] = [];
  // Listas para campos de Miembros de la Junta
  listTenureDurationUnits: OptionSelection[] = [];
  listReceivesProgramSalary: OptionSelection[] = [];

  // Propiedades para controlar la visibilidad de campos
  isEmployee: boolean = false;
  isBoardMember: boolean = false;
  selectedClassification: StaffClassification | null = null;

  // Lista completa de opciones de selección
  allOptionSelections: OptionSelection[] = [];

  headerConfig: GenericHeaderConfig = {
    title: 'staff.add.title',
    formGroup: this._formBuilder.group({
      // Nombre
      firstName: new FormControl('', [Validators.required]),
      // Middle name
      middleName: new FormControl(''),
      // Apellido Paterno
      fatherLastName: new FormControl('', [Validators.required]),
      // Apellido Materno
      motherLastName: new FormControl(''),
      // Status
      status: new FormControl(''),
      // Cargo
      position: new FormControl('', [Validators.required]),
      // Tipo de Staff
      staffType: new FormControl('', [Validators.required]),
      // Clasificación de Staff (solo para empleados)
      staffClassification: new FormControl(''),
      // Fecha de inicio de contrato
      contractStartDate: new FormControl(''),
      // Fecha de finalización de contrato
      contractEndDate: new FormControl(''),
      // Fecha de nacimiento
      birthDate: new FormControl('', [Validators.required, minimumAgeValidator(18)]),
      // Email
      email: new FormControl('', [Validators.required, Validators.email], [emailExistsValidator(this._userService)]),
      // Dirección postal
      postalAddress: new FormControl('', [Validators.required]),
      // Ciudad
      city: new FormControl('', [Validators.required]),
      // Región
      region: new FormControl('', [Validators.required]),
      // Código postal
      zipCode: new FormControl('', [Validators.required, puertoRicoZipCodeValidator()]),
      // Comentarios
      comments: new FormControl('', [Validators.required]),
      // Campos específicos para Miembros de la Junta
      tenureDuration: new FormControl(''),
      tenureDurationUnit: new FormControl(''),
      receivesProgramSalary: new FormControl(''),
      // Campos de revisión (solo para administradores)
      reviewResult: new FormControl(''),
      reviewDate: new FormControl(''),
      reviewJustification: new FormControl(''),
    }),
    // Cancel button
    cancelButtonShow: true,
    cancelButtonText: 'staff.add.buttons.cancel',
    // Submit button
    submitButtonShow: true,
    submitButtonText: 'staff.add.buttons.save',
  };

  // Compare methods
  compare = compare;
  comparePostal = comparePostal;
  compareById = compareById

  // Agencia Id
  agencyId: number = 0;

  // Loading
  isLoading: boolean = false;

  // Lenguaje actual
  currentLang: string = 'es';

  // Variable para pre-seleccionar el tipo de staff
  preSelectStaffType: string | null = null;

  // Propiedad para controlar si mostrar campos de revisión (solo para administradores)
  canViewReviewFields: boolean = false;

  // Lista de opciones de revisión
  reviewResult: OptionSelection[] = [];

  /**
   * Obtiene el label correcto para el campo de comentarios según el tipo de staff
   */
  get commentsLabel(): string {
    if (this.isEmployee) {
      return this._translocoService.translate('staff.add.comments.employee.label');
    } else if (this.isBoardMember) {
      return this._translocoService.translate('staff.add.comments.boardMember.label');
    } else {
      return this._translocoService.translate('staff.add.comments.label');
    }
  }

  ngOnInit(): void {
    // Obtener datos del resolver en lugar de suscribirse
    const resolvedData = this._activatedRoute.snapshot.data['data'];

    if (resolvedData) {
      // Asignar datos directamente desde el resolver
      this.listCities = resolvedData.cities;
      this.listRegions = resolvedData.regions;
      this.allOptionSelections = resolvedData.options.data;
      this.listStaffTypes = resolvedData.staffTypes;
      this.listStaffClassifications = resolvedData.staffClassifications;

      // Filtrar opciones específicas
      this.listStatus = this.allOptionSelections.filter((option: OptionSelection) => option.optionKey === 'isActive');
      this.listAdministrativePositions = this.allOptionSelections.filter((option: OptionSelection) => option.optionKey === 'administrativePosition');
      this.listOperationalPositions = this.allOptionSelections.filter((option: OptionSelection) => option.optionKey === 'operationalPosition');
        this.listBoardMemberTitles = this.allOptionSelections.filter((option: OptionSelection) => option.optionKey === 'boardMemberTitle');
        // Listas para campos de Miembros de la Junta
        this.listTenureDurationUnits = this.allOptionSelections.filter((option: OptionSelection) => option.optionKey === 'tenureDurationUnit');
        this.listReceivesProgramSalary = this.allOptionSelections.filter((option: OptionSelection) => option.optionKey === 'yesNo');
      this.reviewResult = this.allOptionSelections.filter((option: OptionSelection) => option.optionKey === 'reviewResult');

      // Pre-seleccionar tipo de staff según query parameter o por defecto
      this.handleStaffTypePreselection();

      this._changeDetectorRef.detectChanges();
    }

    // Obtener Agencia desde local storage desde AuthService
    this.agencyId = this._authService.getAgencyId();

    // Verificar permisos de administrador
    this.checkAdminPermissions();

    // Leer query parameters para pre-seleccionar el tipo de staff
    this._activatedRoute.queryParams.pipe(takeUntil(this._unsubscribeAll)).subscribe(params => {
      const staffTypeParam = params['staffType'];
      if (staffTypeParam) {
        // Guardar el parámetro para usarlo cuando se carguen los tipos de staff
        this.preSelectStaffType = staffTypeParam;
        this.handleStaffTypePreselection();
      }
    });

    // Transloco
    this._translocoService.langChanges$.pipe(takeUntil(this._unsubscribeAll)).subscribe((lang: string) => {
      this.currentLang = lang;
    });
  }

  /**
   * Maneja la pre-selección del tipo de staff
   */
  private handleStaffTypePreselection(): void {
    if (this.preSelectStaffType === 'employee') {
      // Pre-seleccionar "Empleado"
      const employeeType = this.listStaffTypes.find(staffType =>
        staffType.name === 'Empleado' || staffType.nameEn === 'Employee'
      );

      if (employeeType) {
        this.headerConfig.formGroup.patchValue({
          staffType: employeeType
        });

        // Configurar las variables de estado
        this.isEmployee = true;
        this.isBoardMember = false;

        // Actualizar validaciones
        this.updateValidations();
      }
    } else if (this.preSelectStaffType === 'board-member') {
      // Pre-seleccionar "Miembro de la Junta"
      const boardMemberType = this.listStaffTypes.find(staffType =>
        staffType.name === 'Miembro de la Junta' || staffType.nameEn === 'Board Member'
      );

      if (boardMemberType) {
        this.headerConfig.formGroup.patchValue({
          staffType: boardMemberType
        });

        // Configurar las variables de estado
        this.isEmployee = false;
        this.isBoardMember = true;

        // Actualizar validaciones
        this.updateValidations();

        // Cargar posiciones para miembros de junta
        this.loadPositionsByType();
      }
    } else {
      // Pre-seleccionar "Miembro de la Junta" por defecto (comportamiento original)
      const boardMemberType = this.listStaffTypes.find(staffType =>
        staffType.name === 'Miembro de la Junta' || staffType.nameEn === 'Board Member'
      );

      if (boardMemberType) {
        this.headerConfig.formGroup.patchValue({
          staffType: boardMemberType
        });

        // Configurar las variables de estado
        this.isEmployee = false;
        this.isBoardMember = true;

        // Actualizar validaciones
        this.updateValidations();

        // Cargar posiciones para miembros de junta
        this.loadPositionsByType();
      }
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onSubmit(): void {
    // Validar formulario
    if (this.headerConfig.formGroup.invalid) {
      this._notificationService.showError(this._translocoService.translate('staff.add.error.incompleteFields'));
      this.headerConfig.formGroup.markAllAsTouched();
      return;
    }

    const formValues = this.headerConfig.formGroup.value;

    // Fecha de nacimiento (solo para miembros de junta)
    const birthDate: string = this.isBoardMember ? formValues.birthDate : null;

    // Email (solo para no empleados)
    const email: string = this.isEmployee ? '' : (formValues.email || '');

    // Dirección postal (solo para no empleados)
    const postalAddress: string = this.isEmployee ? '' : (formValues.postalAddress || '');

    // Código postal (solo para no empleados)
    const zipCode: string = this.isEmployee ? '' : (formValues.zipCode || '');

    // Ciudad (solo para no empleados)
    const cityId: number = this.isEmployee ? 0 : (formValues.city?.id || 0);

    // Región (solo para no empleados)
    const regionId: number = this.isEmployee ? 0 : (formValues.region?.id || 0);

    // Fecha de inicio de contrato (solo para empleados)
    const contractStartDate: string | null = this.isEmployee ? formValues.contractStartDate || null : null;

    // Fecha de finalización de contrato (solo para empleados)
    const contractEndDate: string | null = this.isEmployee ? formValues.contractEndDate || null : null;

    // Status - establecer por defecto a 1 (Activo)
    const statusId: number = formValues.status?.id || 1;

    // Cargo
    const positionId: number = formValues.position?.id || 0;

    // Tipo de Staff
    const staffTypeId: number = formValues.staffType?.id || 0;

    // Clasificación de Staff (solo para empleados)
    const staffClassificationId: number = this.isEmployee ? (formValues.staffClassification?.id || 0) : 0;

    // Comentarios
    const comments: string = formValues.comments || '';

    // Nombre (para todos los tipos de staff)
    const firstName: string = formValues.firstName || '';

    // Middle name (para todos los tipos de staff)
    const middleName: string = formValues.middleName || '';

    // Apellido Paterno (para todos los tipos de staff)
    const fatherLastName: string = formValues.fatherLastName || '';

    // Apellido Materno (para todos los tipos de staff)
    const motherLastName: string = formValues.motherLastName || '';

    // Loading
    this.isLoading = true;

    // Validaciones específicas según el tipo de staff
    if (this.isEmployee) {
      // Para empleados: clasificación es requerida
      if (!staffClassificationId) {
        this._notificationService.showError(this._translocoService.translate('staff.add.error.classificationRequired'));
        this.isLoading = false;
        return;
      }
    } else if (this.isBoardMember) {
      // Para miembros de junta: email, dirección postal, ciudad, región, código postal son requeridos
      if (!email || !postalAddress || !cityId || !regionId || !zipCode) {
        this._notificationService.showError(this._translocoService.translate('staff.add.error.contactLocationRequired'));
        this.isLoading = false;
        return;
      }
    }

    // Crear staff con campos condicionales según el tipo
    const staffRequest: any = {
      statusId: statusId,
      positionId: positionId,
      staffTypeId: staffTypeId,
      comments: comments,
      isActive: true,
      // Campos de nombres (para todos los tipos de staff)
      firstName: firstName,
      middleName: middleName,
      fatherLastName: fatherLastName,
      motherLastName: motherLastName,
    };

    // Agregar campos de contacto y ubicación solo si no es empleado
    if (!this.isEmployee) {
      staffRequest.email = email;
      staffRequest.postalAddress = postalAddress;
      staffRequest.cityId = cityId;
      staffRequest.regionId = regionId;
      staffRequest.zipCode = zipCode;
    }

    // Agregar clasificación solo si es empleado
    if (this.isEmployee) {
      staffRequest.staffClassificationId = staffClassificationId;
    }

    // Agregar fechas de contrato solo si es empleado
    if (this.isEmployee) {
      staffRequest.contractStartDate = contractStartDate;
      staffRequest.contractEndDate = contractEndDate;
    }

    // Agregar fecha de nacimiento solo si es miembro de junta
    if (this.isBoardMember) {
      staffRequest.birthDate = birthDate;
      // Agregar campos específicos para miembros de junta
      staffRequest.tenureDuration = formValues.tenureDuration ? parseInt(formValues.tenureDuration) : null;
      staffRequest.tenureDurationUnitId = formValues.tenureDurationUnit?.id || null;
      staffRequest.receivesProgramSalaryId = formValues.receivesProgramSalary?.id || null;
    }

    // Agregar campos de revisión solo si el usuario tiene permisos para verlos
    if (this.canViewReviewFields) {
      staffRequest.reviewResultId = formValues.reviewResult?.id;
      staffRequest.reviewDate = formValues.reviewDate;
      staffRequest.reviewJustification = formValues.reviewJustification;
    }

    // Disable the form
    this.headerConfig.formGroup.disable();

    // Crear staff
    this._staffService.insertStaff(staffRequest, {}).subscribe({
            next: (response) => {
        switch (response.body) {
          case true:
            // Mensaje específico para staff usando traducciones
            const staffTypeKey = this.isEmployee ? 'staff.add.success.employee' : 'staff.add.success.boardMember';

            this._notificationService.showSuccessDialogWithCallback(
              this._translocoService.translate(staffTypeKey),
              (result) => {
                if (result === 'confirmed') {
                  // Usuario presionó Confirm, navegar a la lista correspondiente según el tipo de staff
                  const targetRoute = this.isBoardMember ? 'staff/board-members' : 'staff/employees';
                  this._customRouterService.navigate([targetRoute]);
                }
              }
            );
            break;
          default:
            this._notificationService.showErrorDialog('staff.add.error.general');
            break;
        }
      },
      error: (err) => {
        this._notificationService.showError(this._translocoService.translate('staff.add.error.general'));
        this.headerConfig.formGroup.enable();
      },
      complete: () => {
        this.isLoading = false;
        // Enable the form
        this.headerConfig.formGroup.enable();
        // Reset the form
        this.headerConfig.formGroup.reset();
      },
    });
  }

  onCancel(): void {
    // Navegar a la lista correspondiente según el tipo de staff seleccionado
    const targetRoute = this.isBoardMember ? 'staff/board-members' : 'staff/employees';
    this._customRouterService.navigate([targetRoute]);
  }

  // Método para obtener todas las regiones según el ID de la ciudad
  // Get all regions by city ID
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
            const regionControl = this.headerConfig.formGroup.get('region');
            if (regionControl) {
              if (this.listRegions.length === 1) {
                // Asignar automáticamente la única región encontrada para Dirección Física
                this.headerConfig.formGroup.patchValue({ region: this.listRegions[0] });
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

  /**
   * Actualiza las validaciones según el tipo de staff
   */
  updateValidations(): void {
    const staffClassificationControl = this.headerConfig.formGroup.get('staffClassification');
    const birthDateControl = this.headerConfig.formGroup.get('birthDate');
    const firstNameControl = this.headerConfig.formGroup.get('firstName');
    const middleNameControl = this.headerConfig.formGroup.get('middleName');
    const fatherLastNameControl = this.headerConfig.formGroup.get('fatherLastName');
    const motherLastNameControl = this.headerConfig.formGroup.get('motherLastName');
    const emailControl = this.headerConfig.formGroup.get('email');
    const cityControl = this.headerConfig.formGroup.get('city');
    const regionControl = this.headerConfig.formGroup.get('region');
    const zipCodeControl = this.headerConfig.formGroup.get('zipCode');
    const postalAddressControl = this.headerConfig.formGroup.get('postalAddress');
    const positionControl = this.headerConfig.formGroup.get('position');
    const contractStartDateControl = this.headerConfig.formGroup.get('contractStartDate');
    const contractEndDateControl = this.headerConfig.formGroup.get('contractEndDate');
    const commentsControl = this.headerConfig.formGroup.get('comments');

    if (this.isEmployee) {
      // Para empleados: clasificación requerida, fecha de nacimiento no requerida
      staffClassificationControl?.setValidators([Validators.required]);
      birthDateControl?.clearValidators();
      // Los campos de nombre SÍ son requeridos para empleados también
      firstNameControl?.setValidators([Validators.required]);
      fatherLastNameControl?.setValidators([Validators.required]);
      // El segundo apellido no es requerido para ningún tipo de staff
      motherLastNameControl?.clearValidators();
      // Los campos de contacto y ubicación NO son requeridos para empleados
      emailControl?.clearValidators();
      cityControl?.clearValidators();
      regionControl?.clearValidators();
      zipCodeControl?.clearValidators();
      postalAddressControl?.clearValidators();

      // Forzar actualización inmediata del estado de validez después de limpiar
      firstNameControl?.updateValueAndValidity({ emitEvent: false });
      fatherLastNameControl?.updateValueAndValidity({ emitEvent: false });
      motherLastNameControl?.updateValueAndValidity({ emitEvent: false });
      birthDateControl?.updateValueAndValidity({ emitEvent: false });
      emailControl?.updateValueAndValidity({ emitEvent: false });
      cityControl?.updateValueAndValidity({ emitEvent: false });
      regionControl?.updateValueAndValidity({ emitEvent: false });
      zipCodeControl?.updateValueAndValidity({ emitEvent: false });
      postalAddressControl?.updateValueAndValidity({ emitEvent: false });

      // Resetear completamente el estado de los campos después de limpiar validadores
      firstNameControl?.markAsUntouched();
      firstNameControl?.markAsPristine();
      fatherLastNameControl?.markAsUntouched();
      fatherLastNameControl?.markAsPristine();
      motherLastNameControl?.markAsUntouched();
      motherLastNameControl?.markAsPristine();
      birthDateControl?.markAsUntouched();
      birthDateControl?.markAsPristine();
      emailControl?.markAsUntouched();
      emailControl?.markAsPristine();
      cityControl?.markAsUntouched();
      cityControl?.markAsPristine();
      regionControl?.markAsUntouched();
      regionControl?.markAsPristine();
      zipCodeControl?.markAsUntouched();
      zipCodeControl?.markAsPristine();
      postalAddressControl?.markAsUntouched();
      postalAddressControl?.markAsPristine();

      // El campo de clasificación SIEMPRE debe estar habilitado para empleados
      staffClassificationControl?.enable({ emitEvent: false });

      // Si no hay clasificación seleccionada, deshabilitar solo los campos que dependen de la clasificación
      if (!this.selectedClassification) {
        // Deshabilitar campos de nombres y apellidos
        firstNameControl?.disable({ emitEvent: false });
        middleNameControl?.disable({ emitEvent: false });
        fatherLastNameControl?.disable({ emitEvent: false });
        motherLastNameControl?.disable({ emitEvent: false });
        positionControl?.disable({ emitEvent: false });
        contractStartDateControl?.disable({ emitEvent: false });
        contractEndDateControl?.disable({ emitEvent: false });
        commentsControl?.disable({ emitEvent: false });

        // También deshabilitar estos campos que estaban activos
        birthDateControl?.disable({ emitEvent: false });
        emailControl?.disable({ emitEvent: false });
        cityControl?.disable({ emitEvent: false });
        regionControl?.disable({ emitEvent: false });
        zipCodeControl?.disable({ emitEvent: false });
        postalAddressControl?.disable({ emitEvent: false });
        // Deshabilitar campos específicos de miembros de junta para empleados
        const tenureDurationControl = this.headerConfig.formGroup.get('tenureDuration');
        const tenureDurationUnitControl = this.headerConfig.formGroup.get('tenureDurationUnit');
        const receivesProgramSalaryControl = this.headerConfig.formGroup.get('receivesProgramSalary');
        tenureDurationControl?.clearValidators();
        tenureDurationUnitControl?.clearValidators();
        receivesProgramSalaryControl?.clearValidators();
        tenureDurationControl?.disable({ emitEvent: false });
        tenureDurationUnitControl?.disable({ emitEvent: false });
        receivesProgramSalaryControl?.disable({ emitEvent: false });
      } else {
        // Si hay clasificación seleccionada, habilitar todos los campos

        firstNameControl?.enable({ emitEvent: false });
        middleNameControl?.enable({ emitEvent: false });
        fatherLastNameControl?.enable({ emitEvent: false });
        motherLastNameControl?.enable({ emitEvent: false });
        positionControl?.enable({ emitEvent: false });
        contractStartDateControl?.enable({ emitEvent: false });
        contractEndDateControl?.enable({ emitEvent: false });
        commentsControl?.enable({ emitEvent: false });

      // También habilitar estos campos
      birthDateControl?.enable({ emitEvent: false });
      emailControl?.enable({ emitEvent: false });
      cityControl?.enable({ emitEvent: false });
      regionControl?.enable({ emitEvent: false });
      zipCodeControl?.enable({ emitEvent: false });
      postalAddressControl?.enable({ emitEvent: false });
      // Deshabilitar campos específicos de miembros de junta para empleados
      const tenureDurationControl = this.headerConfig.formGroup.get('tenureDuration');
      const tenureDurationUnitControl = this.headerConfig.formGroup.get('tenureDurationUnit');
      const receivesProgramSalaryControl = this.headerConfig.formGroup.get('receivesProgramSalary');
      tenureDurationControl?.clearValidators();
      tenureDurationUnitControl?.clearValidators();
      receivesProgramSalaryControl?.clearValidators();
      tenureDurationControl?.disable({ emitEvent: false });
      tenureDurationUnitControl?.disable({ emitEvent: false });
      receivesProgramSalaryControl?.disable({ emitEvent: false });
      }
    } else if (this.isBoardMember) {
      // Para miembros de junta: clasificación no requerida, fecha de nacimiento requerida
      staffClassificationControl?.clearValidators();
      birthDateControl?.setValidators([Validators.required, minimumAgeValidator(18)]);
      // Los campos de nombre son requeridos para miembros de junta
      firstNameControl?.setValidators([Validators.required]);
      // Para miembros de junta, el primer apellido es requerido
      fatherLastNameControl?.setValidators([Validators.required]);
      // El segundo apellido no es requerido para ningún tipo de staff
      motherLastNameControl?.clearValidators();
      // Los campos de contacto y ubicación son requeridos para miembros de junta
      emailControl?.setValidators([Validators.required, Validators.email]);
      cityControl?.setValidators([Validators.required]);
      regionControl?.setValidators([Validators.required]);
      zipCodeControl?.setValidators([Validators.required, puertoRicoZipCodeValidator()]);
      postalAddressControl?.setValidators([Validators.required]);
      // Campos específicos para miembros de junta son requeridos
      const tenureDurationControl = this.headerConfig.formGroup.get('tenureDuration');
      const tenureDurationUnitControl = this.headerConfig.formGroup.get('tenureDurationUnit');
      const receivesProgramSalaryControl = this.headerConfig.formGroup.get('receivesProgramSalary');
      tenureDurationControl?.setValidators([Validators.required]);
      tenureDurationUnitControl?.setValidators([Validators.required]);
      receivesProgramSalaryControl?.setValidators([Validators.required]);

      // Habilitar todos los campos para miembros de junta
      firstNameControl?.enable({ emitEvent: false });
      fatherLastNameControl?.enable({ emitEvent: false });
      motherLastNameControl?.enable({ emitEvent: false });
      positionControl?.enable({ emitEvent: false });
      contractStartDateControl?.enable({ emitEvent: false });
      contractEndDateControl?.enable({ emitEvent: false });
      commentsControl?.enable({ emitEvent: false });
      tenureDurationControl?.enable({ emitEvent: false });
      tenureDurationUnitControl?.enable({ emitEvent: false });
      receivesProgramSalaryControl?.enable({ emitEvent: false });
    } else {
      // Para otros casos: ambos requeridos
      staffClassificationControl?.setValidators([Validators.required]);
      birthDateControl?.setValidators([Validators.required, minimumAgeValidator(18)]);
      // Los campos de nombre son requeridos para otros tipos
      firstNameControl?.setValidators([Validators.required]);
      // Los apellidos no son requeridos para ningún tipo de staff
      fatherLastNameControl?.clearValidators();
      motherLastNameControl?.clearValidators();
      // Los campos de contacto y ubicación son requeridos para otros tipos
      emailControl?.setValidators([Validators.required, Validators.email]);
      cityControl?.setValidators([Validators.required]);
      regionControl?.setValidators([Validators.required]);
      zipCodeControl?.setValidators([Validators.required, puertoRicoZipCodeValidator()]);
      postalAddressControl?.setValidators([Validators.required]);

      // Habilitar todos los campos para otros tipos
      firstNameControl?.enable({ emitEvent: false });
      fatherLastNameControl?.enable({ emitEvent: false });
      motherLastNameControl?.enable({ emitEvent: false });
      positionControl?.enable({ emitEvent: false });
      contractStartDateControl?.enable({ emitEvent: false });
      contractEndDateControl?.enable({ emitEvent: false });
      commentsControl?.enable({ emitEvent: false });
    }

    staffClassificationControl?.updateValueAndValidity();
    birthDateControl?.updateValueAndValidity();
    firstNameControl?.updateValueAndValidity();
    fatherLastNameControl?.updateValueAndValidity();
    motherLastNameControl?.updateValueAndValidity();
    emailControl?.updateValueAndValidity();
    cityControl?.updateValueAndValidity();
    regionControl?.updateValueAndValidity();
    zipCodeControl?.updateValueAndValidity();
    postalAddressControl?.updateValueAndValidity();

    // Actualizar validaciones de campos específicos de miembros de junta
    const tenureDurationControl = this.headerConfig.formGroup.get('tenureDuration');
    const tenureDurationUnitControl = this.headerConfig.formGroup.get('tenureDurationUnit');
    const receivesProgramSalaryControl = this.headerConfig.formGroup.get('receivesProgramSalary');
    tenureDurationControl?.updateValueAndValidity();
    tenureDurationUnitControl?.updateValueAndValidity();
    receivesProgramSalaryControl?.updateValueAndValidity();
  }

  /**
   * Carga las posiciones según el tipo de staff
   */
  loadPositionsByType(): void {
    if (this.isEmployee) {
      // Para empleados, las posiciones se cargarán según la clasificación
      // No vaciamos la lista aquí, se cargará cuando se seleccione la clasificación
      this.listPositions = [];
    } else if (this.isBoardMember) {
      // Para miembros de junta, usar la lista específica
      this.listPositions = this.listBoardMemberTitles;
      this._changeDetectorRef.detectChanges();
    } else {
      // Para otros tipos, mantener la lista actual
      this._changeDetectorRef.detectChanges();
    }
  }

  /**
   * Carga las posiciones según la clasificación de staff
   */
  loadPositionsByClassification(): void {
    if (!this.selectedClassification) {
      this.listPositions = [];
      return;
    }

    let optionKey = '';
    if (this.selectedClassification?.name === 'Administrativo' || this.selectedClassification?.nameEn === 'Administrative') {
      this.listPositions = this.listAdministrativePositions;
    } else if (this.selectedClassification?.name === 'Operacional' || this.selectedClassification?.nameEn === 'Operational') {
      this.listPositions = this.listOperationalPositions;
    } else {
      this.listPositions = [];
    }
    this._changeDetectorRef.detectChanges();
  }

  /**
   * Maneja el cambio en el tipo de staff seleccionado
   */
  onStaffTypeChange(staffType: StaffType): void {
    if (!staffType) {
      this.resetStaffTypeFields();
      return;
    }

    // Determinar si es empleado o miembro de junta
    this.isEmployee = staffType.name === 'Empleado' || staffType.nameEn === 'Employee';
    this.isBoardMember = staffType.name === 'Miembro de la Junta' || staffType.nameEn === 'Board Member';

    // Resetear campos relacionados
    this.headerConfig.formGroup.patchValue({
      staffClassification: null,
      position: null
    });

    // Si es miembro de junta, limpiar los campos de fecha de contrato
    if (this.isBoardMember) {
      this.headerConfig.formGroup.patchValue({
        contractStartDate: null,
        contractEndDate: null
      });
    }

    // Si es empleado, limpiar campos que no son requeridos para empleados
    if (this.isEmployee) {
      this.headerConfig.formGroup.patchValue({
        birthDate: null,
        email: '',
        city: null,
        region: null,
        zipCode: '',
        postalAddress: ''
      });

      // Limpiar el estado de validación de estos campos
      const fieldsToClear = ['birthDate', 'email', 'city', 'region', 'zipCode', 'postalAddress'];
      fieldsToClear.forEach(fieldName => {
        const control = this.headerConfig.formGroup.get(fieldName);
        if (control) {
          control.markAsUntouched();
          control.markAsPristine();
          control.setErrors(null);
        }
      });
    }

    // Actualizar validaciones
    this.updateValidations();

    // Cargar posiciones según el tipo
    this.loadPositionsByType();

    this._changeDetectorRef.detectChanges();
  }

  /**
   * Maneja el cambio en la clasificación de staff
   */
  onClassificationChange(classification: StaffClassification): void {
    this.selectedClassification = classification;

    // Cargar posiciones según la clasificación
    this.loadPositionsByClassification();

    // Actualizar validaciones
    this.updateValidations();

    this._changeDetectorRef.detectChanges();
  }

  /**
   * Resetea los campos relacionados con el tipo de staff
   */
  private resetStaffTypeFields(): void {
    this.isEmployee = false;
    this.isBoardMember = false;
    this.selectedClassification = null;

    // Resetear campos del formulario
    this.headerConfig.formGroup.patchValue({
      staffClassification: null,
      position: null,
      contractStartDate: null,
      contractEndDate: null
    });

    // Limpiar listas
    this.listPositions = [];

    // Actualizar validaciones
    this.updateValidations();

    this._changeDetectorRef.detectChanges();
  }

  /**
   * Verifica los permisos de administrador para mostrar campos de revisión
   */
  private checkAdminPermissions(): void {
    const userRole = this._authService.getUserRole();
    // Solo mostrar campos de revisión si el usuario es administrador
    this.canViewReviewFields = userRole === 'Administrator' || userRole === 'Admin';

    if (this.canViewReviewFields) {
      this.headerConfig.formGroup.get('reviewResult')?.setValidators([Validators.required]);
      this.headerConfig.formGroup.get('reviewDate')?.setValidators([Validators.required]);
      this.headerConfig.formGroup.get('reviewJustification')?.setValidators([Validators.required]);
    } else {
      this.headerConfig.formGroup.get('reviewResult')?.clearValidators();
      this.headerConfig.formGroup.get('reviewDate')?.clearValidators();
      this.headerConfig.formGroup.get('reviewJustification')?.clearValidators();
    }
    this.headerConfig.formGroup.get('reviewResult')?.updateValueAndValidity();
    this.headerConfig.formGroup.get('reviewDate')?.updateValueAndValidity();
    this.headerConfig.formGroup.get('reviewJustification')?.updateValueAndValidity();
  }
}
