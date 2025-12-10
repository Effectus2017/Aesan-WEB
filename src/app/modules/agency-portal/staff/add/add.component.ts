import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { ViewEncapsulation } from '@angular/core';
import { StaffService } from 'app/shared/services/staff.service';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
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
import { compare, compareById, comparePostal, isNullOrUndefinedEmptyStringNullArray, minimumAgeValidator, logFormValidationErrors } from 'app/shared/utils';
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
import { SiteService } from 'app/shared/services/site.service';
import { Site } from 'app/shared/models/Site';
import { UserService } from 'app/shared/services/user.service';
import { emailExistsValidator } from 'app/shared/validators/email-exists.validator';
import { puertoRicoZipCodeValidator } from 'app/shared/validators/puerto-rico-zip-code.validator';
import { PuertoRicoZipCodeDirective } from 'app/shared/directives/puerto-rico-zip-code.directive';
import { DynamicGridDirective } from "app/shared/directives/dynamic-grid.directive";
import { NumericOnlyDirective } from 'app/shared/directives/numeric-only.directive';

@Component({
  selector: 'app-add-staff',
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
    DynamicGridDirective,
    NumericOnlyDirective
],
})
export class AddStaffComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers {
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
  private _siteService = inject(SiteService);
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
  // Lista de Sitios
  listSites: Site[] = [];

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
      comments: new FormControl(''),
      // Sitio asignado
      site: new FormControl('', [Validators.required]),
      isPrimary: new FormControl(false),
      // Campos específicos para Miembros de la Junta
      tenureDuration: new FormControl(''),
      tenureDurationUnit: new FormControl(''),
      receivesProgramSalary: new FormControl(''),
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
    // Obtener Agencia desde local storage desde AuthService
    this.agencyId = this._authService.getAgencyId();

    // Leer query parameters para pre-seleccionar el tipo de staff
    this._activatedRoute.queryParams.pipe(takeUntil(this._unsubscribeAll)).subscribe(params => {
      const staffTypeParam = params['staffType'];
      if (staffTypeParam) {
        // Guardar el parámetro para usarlo cuando se carguen los tipos de staff
        this.preSelectStaffType = staffTypeParam;
      }
    });

    // Transloco
    this._translocoService.langChanges$.pipe(takeUntil(this._unsubscribeAll)).subscribe((lang: string) => {
      this.currentLang = lang;
    });

    // Cargar opciones SOLO UNA VEZ desde el resolver
    this._optionSelectionService.options$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        // Guardar todas las opciones para filtrar en memoria
        this.allOptionSelections = result.body.data;
        // Status
        this.listStatus = this.allOptionSelections.filter((option: OptionSelection) => option.optionKey === 'isActive');
        // Poblar listas separadas
        this.listAdministrativePositions = this.allOptionSelections.filter((option: OptionSelection) => option.optionKey === 'administrativePosition');
        this.listOperationalPositions = this.allOptionSelections.filter((option: OptionSelection) => option.optionKey === 'operationalPosition');
        this.listBoardMemberTitles = this.allOptionSelections.filter((option: OptionSelection) => option.optionKey === 'boardMemberTitle');
        // Listas para campos de Miembros de la Junta
        this.listTenureDurationUnits = this.allOptionSelections.filter((option: OptionSelection) => option.optionKey === 'tenureDurationUnit');
        this.listReceivesProgramSalary = this.allOptionSelections.filter((option: OptionSelection) => option.optionKey === 'yesNo');

        this._changeDetectorRef.detectChanges();
      }
    });

    // Cargar tipos de staff
    this._staffTypeService.staffTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.listStaffTypes = result.body;

        // Pre-seleccionar tipo de staff según query parameter o por defecto
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

        this._changeDetectorRef.detectChanges();
      }
    });

    // Cargar clasificaciones de staff
    this._staffClassificationService.staffClassifications$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.listStaffClassifications = result.body;

        // Si ya está preseleccionado como empleado, actualizar validaciones después de cargar las clasificaciones
        if (this.isEmployee) {
          this.updateValidations();
        }

        this._changeDetectorRef.detectChanges();
      }
    });

    // Cities
    this._geoService.cities$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.listCities = result.body;
        this._changeDetectorRef.detectChanges();
      }
    });

    // Regions
    this._geoService.regions$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.listRegions = result.body;
        this._changeDetectorRef.detectChanges();
      }
    });

    // Sites - Cargar desde el resolver
    const resolvedData = this._activatedRoute.snapshot.data['data'];
    if (resolvedData && resolvedData.sites) {
      this.listSites = resolvedData.sites; // El backend ya devuelve solo activas con isList: true
    }

    // El código para cargar tipos de asignación ya está en la función existente arriba
    // Solo necesitamos agregar el filtro siguiendo el mismo patrón

    // Suscribirse a cambios en el tipo de staff
    this.headerConfig.formGroup.get('staffType')?.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((staffType: StaffType) => {
      this.onStaffTypeChange(staffType);
    });

    // Suscribirse a cambios en la clasificación
    this.headerConfig.formGroup.get('staffClassification')?.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((classification: StaffClassification) => {
      this.onClassificationChange(classification);
    });

    // Suscribirse a cambios en la fecha de nacimiento para limpiar errores de validación
    this.headerConfig.formGroup.get('birthDate')?.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((birthDate: any) => {
      this.onBirthDateChange(birthDate);
    });

    // Deshabilitar campos de contrato por defecto (solo se habilitan para empleados)
    const contractStartDateControl = this.headerConfig.formGroup.get('contractStartDate');
    const contractEndDateControl = this.headerConfig.formGroup.get('contractEndDate');
    contractStartDateControl?.disable({ emitEvent: false });
    contractEndDateControl?.disable({ emitEvent: false });

  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }


  /**
   * Muestra el mensaje de éxito después de crear el staff
   */
  private showSuccessMessage(): void {
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
  }

  onSubmit(): void {
    // Validar formulario
    if (this.headerConfig.formGroup.invalid) {
      // Log detallado de campos inválidos usando función utilitaria
      logFormValidationErrors(this.headerConfig.formGroup, 'Formulario de Personal');

      this._notificationService.showErrorDialog(this._translocoService.translate('staff.add.error.incompleteFields'));
      this.headerConfig.formGroup.markAllAsTouched();
      return;
    }

    const formValues = this.headerConfig.formGroup.value;

    // Fecha de nacimiento (solo para miembros de junta)
    const birthDate: string = formValues.birthDate || null;

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

    // Sitio asignado
    const siteId: number = formValues.site?.id || null;
    const isPrimary: boolean = formValues.isPrimary || false;

    // Loading
    this.isLoading = true;

    // Validaciones específicas según el tipo de staff
    if (this.isEmployee) {
      // Para empleados: clasificación es requerida
      if (!staffClassificationId) {
        this._notificationService.showErrorDialog(this._translocoService.translate('staff.add.error.classificationRequired'));
        this.isLoading = false;
        return;
      }
    } else if (this.isBoardMember) {
      // Para miembros de junta: email, dirección postal, ciudad, región, código postal son requeridos
      if (!email || !postalAddress || !cityId || !regionId || !zipCode) {
        this._notificationService.showErrorDialog(this._translocoService.translate('staff.add.error.contactLocationRequired'));
        this.isLoading = false;
        return;
      }
      // Validar campos específicos de miembros de junta
      const tenureDuration = formValues.tenureDuration;
      const tenureDurationUnit = formValues.tenureDurationUnit;
      const receivesProgramSalary = formValues.receivesProgramSalary;
      if (!tenureDuration || !tenureDurationUnit || !receivesProgramSalary) {
        this._notificationService.showErrorDialog(this._translocoService.translate('staff.add.error.incompleteFields'));
        this.isLoading = false;
        return;
      }
    }

    // Crear staff con campos condicionales según el tipo
    const staffRequest: any = {
      statusId: statusId,
      positionId: positionId,
      staffTypeId: staffTypeId,
      contractStartDate: contractStartDate,
      contractEndDate: contractEndDate,
      comments: comments,
      isActive: true,
      agencyId: this.agencyId,
      // Campos de nombres (para todos los tipos de staff)
      firstName: firstName,
      middleName: middleName,
      fatherLastName: fatherLastName,
      motherLastName: motherLastName,
      // Información de asignación de sitio
      siteId: siteId,
      isPrimary: isPrimary,
      birthDate: birthDate,
    };

    // Agregar campos de contacto y ubicación solo si no es empleado
    if (!this.isEmployee) {
      staffRequest.email = email;
      staffRequest.postalAddress = postalAddress;
      staffRequest.cityId = cityId;
      staffRequest.regionId = regionId;
      staffRequest.zipCode = zipCode;
    }

    // Agregar campos específicos para miembros de junta
    if (this.isBoardMember) {
      const formValues = this.headerConfig.formGroup.value;
      staffRequest.tenureDuration = formValues.tenureDuration ? parseInt(formValues.tenureDuration) : null;
      staffRequest.tenureDurationUnitId = formValues.tenureDurationUnit?.id || null;
      staffRequest.receivesProgramSalaryId = formValues.receivesProgramSalary?.id || null;
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
    // if (this.isBoardMember) {
    //   staffRequest.birthDate = birthDate;
    // }

    // Disable the form
    this.headerConfig.formGroup.disable();

    // Crear staff (el backend ahora maneja también la asociación con el sitio)
    let isSuccess = false;
    this._staffService.insertStaff(staffRequest, {}).subscribe({
      next: (response) => {
        switch (response.body) {
          case true:
            // Mostrar mensaje de éxito
            isSuccess = true;
            // Limpiar el estado de validación para evitar que se muestren errores en el fondo
            // pero mantener los valores del formulario
            this.clearValidationErrors();
            this.showSuccessMessage();
            break;
          default:
            this._notificationService.showErrorDialog(this._translocoService.translate('staff.add.error.general'));
            this.headerConfig.formGroup.enable();
            break;
        }
      },
      error: (err) => {
        this._notificationService.showErrorDialog(this._translocoService.translate('staff.add.error.general'));
        this.headerConfig.formGroup.enable();
      },
      complete: () => {
        this.isLoading = false;
        // Solo habilitar el formulario si no fue exitoso (para permitir reintentos)
        // Si fue exitoso, mantenerlo deshabilitado hasta que se navegue
        if (!isSuccess) {
          this.headerConfig.formGroup.enable();
        }
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

    // Resetear posición
    this.headerConfig.formGroup.patchValue({
      position: null
    });

    // Cargar posiciones según la clasificación
    this.loadPositionsByClassification();

    // Si es empleado y ahora tiene clasificación, habilitar todos los campos
    if (this.isEmployee && this.selectedClassification) {
      const firstNameControl = this.headerConfig.formGroup.get('firstName');
      const middleNameControl = this.headerConfig.formGroup.get('middleName');
      const fatherLastNameControl = this.headerConfig.formGroup.get('fatherLastName');
      const motherLastNameControl = this.headerConfig.formGroup.get('motherLastName');
      const positionControl = this.headerConfig.formGroup.get('position');
      const contractStartDateControl = this.headerConfig.formGroup.get('contractStartDate');
      const contractEndDateControl = this.headerConfig.formGroup.get('contractEndDate');
      const commentsControl = this.headerConfig.formGroup.get('comments');
      const birthDateControl = this.headerConfig.formGroup.get('birthDate');
      const emailControl = this.headerConfig.formGroup.get('email');
      const cityControl = this.headerConfig.formGroup.get('city');
      const regionControl = this.headerConfig.formGroup.get('region');
      const zipCodeControl = this.headerConfig.formGroup.get('zipCode');
      const postalAddressControl = this.headerConfig.formGroup.get('postalAddress');

      // Habilitar todos los campos
      firstNameControl?.enable({ emitEvent: false });
      middleNameControl?.enable({ emitEvent: false });
      fatherLastNameControl?.enable({ emitEvent: false });
      motherLastNameControl?.enable({ emitEvent: false });
      positionControl?.enable({ emitEvent: false });
      contractStartDateControl?.enable({ emitEvent: false });
      contractEndDateControl?.enable({ emitEvent: false });
      commentsControl?.enable({ emitEvent: false });
      birthDateControl?.enable({ emitEvent: false });
      emailControl?.enable({ emitEvent: false });
      cityControl?.enable({ emitEvent: false });
      regionControl?.enable({ emitEvent: false });
      zipCodeControl?.enable({ emitEvent: false });
      postalAddressControl?.enable({ emitEvent: false });
    }

    this._changeDetectorRef.detectChanges();
  }

  /**
   * Maneja el cambio en la fecha de nacimiento para limpiar errores de validación
   */
  onBirthDateChange(birthDate: any): void {
    if (!birthDate) {
      return;
    }

    const birthDateControl = this.headerConfig.formGroup.get('birthDate');
    if (!birthDateControl) {
      return;
    }

    // Limpiar inmediatamente cualquier error de validación anterior
    birthDateControl.markAsUntouched();
    birthDateControl.markAsPristine();

    // Forzar revalidación del campo para aplicar las nuevas validaciones
    birthDateControl.updateValueAndValidity({ emitEvent: false });

    // Si después de la revalidación no hay errores, asegurar que el estado esté limpio
    if (!birthDateControl.errors) {
      birthDateControl.markAsUntouched();
      birthDateControl.markAsPristine();
    }
  }

  /**
   * Resetea los campos relacionados con el tipo de staff
   */
  resetStaffTypeFields(): void {
    this.isEmployee = false;
    this.isBoardMember = false;
    this.selectedClassification = null;

    this.headerConfig.formGroup.patchValue({
      staffClassification: null,
      position: null,
      contractStartDate: null,
      contractEndDate: null,
      birthDate: null,
      email: '',
      city: null,
      region: null,
      zipCode: '',
      postalAddress: ''
    });

    // Deshabilitar campos de contrato por defecto (solo se habilitan para empleados)
    const contractStartDateControl = this.headerConfig.formGroup.get('contractStartDate');
    const contractEndDateControl = this.headerConfig.formGroup.get('contractEndDate');
    contractStartDateControl?.disable({ emitEvent: false });
    contractEndDateControl?.disable({ emitEvent: false });

    // Limpiar completamente el estado de validación
    this.clearValidationState();

    this.updateValidations();
  }

  /**
   * Limpia los errores de validación sin cambiar los valores del formulario
   * Útil después de un éxito para evitar que se muestren errores en el fondo
   */
  private clearValidationErrors(): void {
    // Marcar todos los controles como untouched y pristine para ocultar errores
    Object.keys(this.headerConfig.formGroup.controls).forEach(key => {
      const control = this.headerConfig.formGroup.get(key);
      if (control) {
        control.markAsUntouched();
        control.markAsPristine();
        // No limpiar los errores aquí, solo el estado de touched/pristine
        // para que no se muestren visualmente
      }
    });
  }

  /**
   * Limpia completamente el estado de validación de todos los campos
   */
  private clearValidationState(): void {
    const controls = [
      'staffClassification',
      'birthDate',
      'firstName',
      'middleName',
      'fatherLastName',
      'motherLastName',
      'email',
      'city',
      'region',
      'zipCode',
      'postalAddress',
      'position',
      'contractStartDate',
      'contractEndDate',
      'comments'
    ];

    controls.forEach(controlName => {
      const control = this.headerConfig.formGroup.get(controlName);
      if (control) {
        control.markAsUntouched();
        control.markAsPristine();
        control.setErrors(null);
      }
    });
  }

  /**
   * Resetea el formulario después de un guardado exitoso
   */
  private resetFormAfterSuccess(): void {
    // Resetear el formulario
    this.headerConfig.formGroup.reset();

    // Resetear las variables de estado
    this.isEmployee = false;
    this.isBoardMember = false;
    this.selectedClassification = null;

    // Limpiar las listas de posiciones
    this.listPositions = [];

    // Seleccionar el tipo de staff por defecto (Miembro de la Junta)
    if (this.listStaffTypes.length > 0) {
      const boardMemberType = this.listStaffTypes.find(staffType =>
        staffType.name === 'Miembro de la Junta' || staffType.nameEn === 'Board Member'
      );

      if (boardMemberType) {
        this.headerConfig.formGroup.patchValue({
          staffType: boardMemberType
        });

        // Configurar el estado correcto
        this.isBoardMember = true;
        this.isEmployee = false;

        // Cargar posiciones para miembros de junta
        this.loadPositionsByType();

        // Actualizar validaciones
        this.updateValidations();
      }
    }

    // Seleccionar estado "Activo" por defecto
    if (this.listStatus.length > 0) {
      const activeStatus = this.listStatus.find(status =>
        status.name === 'Activo' || status.nameEN === 'Active'
      );

      if (activeStatus) {
        this.headerConfig.formGroup.patchValue({
          status: activeStatus
        });
      }
    }

    // Limpiar completamente el estado de validación
    this.clearValidationState();

    // Deshabilitar campos de contrato por defecto (solo se habilitan para empleados)
    const contractStartDateControl = this.headerConfig.formGroup.get('contractStartDate');
    const contractEndDateControl = this.headerConfig.formGroup.get('contractEndDate');
    contractStartDateControl?.disable({ emitEvent: false });
    contractEndDateControl?.disable({ emitEvent: false });

    // Forzar detección de cambios
    this._changeDetectorRef.detectChanges();
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
      // Para empleados: clasificación requerida, fecha de nacimiento requerida
      staffClassificationControl?.setValidators([Validators.required]);
      birthDateControl?.setValidators([Validators.required]);

      // Los campos de nombre SÍ son requeridos para empleados también
      firstNameControl?.setValidators([Validators.required]);
      fatherLastNameControl?.setValidators([Validators.required]);
      // El segundo apellido no es requerido para ningún tipo de staff
      motherLastNameControl?.clearValidators();
      // El campo position SÍ es requerido para empleados
      positionControl?.setValidators([Validators.required]);
      // Los campos de contacto y ubicación NO son requeridos para empleados
      emailControl?.clearValidators();
      cityControl?.clearValidators();
      regionControl?.clearValidators();
      zipCodeControl?.clearValidators();
      postalAddressControl?.clearValidators();

      // Resetear valores de campos que no son requeridos para empleados
      if (emailControl?.value) {
        emailControl.setValue('', { emitEvent: false });
      }
      if (cityControl?.value) {
        cityControl.setValue(null, { emitEvent: false });
      }
      if (regionControl?.value) {
        regionControl.setValue(null, { emitEvent: false });
      }
      if (zipCodeControl?.value) {
        zipCodeControl.setValue('', { emitEvent: false });
      }
      if (postalAddressControl?.value) {
        postalAddressControl.setValue('', { emitEvent: false });
      }

      // Forzar actualización inmediata del estado de validez después de limpiar
      firstNameControl?.updateValueAndValidity({ emitEvent: false });
      fatherLastNameControl?.updateValueAndValidity({ emitEvent: false });
      birthDateControl?.updateValueAndValidity({ emitEvent: false });
      motherLastNameControl?.updateValueAndValidity({ emitEvent: false });
      birthDateControl?.updateValueAndValidity({ emitEvent: false });
      emailControl?.updateValueAndValidity({ emitEvent: false });
      cityControl?.updateValueAndValidity({ emitEvent: false });
      regionControl?.updateValueAndValidity({ emitEvent: false });
      zipCodeControl?.updateValueAndValidity({ emitEvent: false });
      postalAddressControl?.updateValueAndValidity({ emitEvent: false });

      // Resetear completamente el estado de los campos después de limpiar validaciones
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
        // Los campos de contrato solo están disponibles para empleados
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
      } else {
        // Si hay clasificación seleccionada, habilitar todos los campos
        firstNameControl?.enable({ emitEvent: false });
        middleNameControl?.enable({ emitEvent: false });
        fatherLastNameControl?.enable({ emitEvent: false });
        motherLastNameControl?.enable({ emitEvent: false });
        positionControl?.enable({ emitEvent: false });
        // Los campos de contrato solo están disponibles para empleados
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

      // Limpiar el estado de validación del campo birthDate antes de aplicar nuevas validaciones
      birthDateControl?.markAsUntouched();
      birthDateControl?.markAsPristine();
      birthDateControl?.setErrors(null);

      // Los campos de nombre son requeridos para miembros de junta
      firstNameControl?.setValidators([Validators.required]);
      // Para miembros de junta, el primer apellido es requerido
      fatherLastNameControl?.setValidators([Validators.required]);
      // El segundo apellido no es requerido para ningún tipo de staff
      motherLastNameControl?.clearValidators();
      // El campo position NO es requerido para miembros de junta
      positionControl?.clearValidators();
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
      // Los campos de contrato NO están disponibles para miembros de junta
      contractStartDateControl?.disable({ emitEvent: false });
      contractEndDateControl?.disable({ emitEvent: false });
      commentsControl?.enable({ emitEvent: false });
      // Habilitar campos específicos para miembros de junta (ya declarados arriba)
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
      // Los campos de contrato NO están disponibles para otros tipos
      contractStartDateControl?.disable({ emitEvent: false });
      contractEndDateControl?.disable({ emitEvent: false });
      commentsControl?.enable({ emitEvent: false });
    }

    staffClassificationControl?.updateValueAndValidity();
    birthDateControl?.updateValueAndValidity();
    firstNameControl?.updateValueAndValidity();
    fatherLastNameControl?.updateValueAndValidity();
    motherLastNameControl?.updateValueAndValidity();
    positionControl?.updateValueAndValidity();
    emailControl?.updateValueAndValidity();
    cityControl?.updateValueAndValidity();
    regionControl?.updateValueAndValidity();
    zipCodeControl?.updateValueAndValidity();
    postalAddressControl?.updateValueAndValidity();

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
}
