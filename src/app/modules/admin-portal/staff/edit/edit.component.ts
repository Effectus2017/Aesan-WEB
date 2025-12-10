import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StaffService } from 'app/shared/services/staff.service';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { NgIf, NgForOf } from '@angular/common';
import { GenericTableConfig } from 'app/shared/components/generic-table/generic-table.interface';
import { MatTableDataSource } from '@angular/material/table';
import { STAFF_RELATIONSHIPS_COLUMNS_SCHEMA } from './columns-schema';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
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
import { OptionSelection } from 'app/shared/models/OptionSelection';
import { City } from 'app/shared/models/City';
import { Region } from 'app/shared/models/Region';
import { compare, compareById, compareItems, comparePostal, isNullOrUndefinedEmptyStringNullArray, minimumAgeValidator } from 'app/shared/utils';
import { AuthService } from 'app/core/auth/auth.service';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
import { GeoService } from 'app/shared/services/geo.service';
import { provideNativeDateAdapter } from '@angular/material/core';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { StaffTypeService } from 'app/shared/services/staff-type.service';
import { StaffType } from 'app/shared/models/StaffType';
import { Staff } from 'app/shared/models/Staff';
import { StaffClassificationService } from 'app/shared/services/staff-classification.service';
import { StaffClassification } from 'app/shared/models/StaffClassification';
import { PermissionService } from 'app/shared/services/permission.service';
import { StaffRelationshipService } from 'app/shared/services/staff-relationship.service';
import { DTOStaffRelationship } from 'app/shared/models/StaffRelationship';
import { MatDialog } from '@angular/material/dialog';
import { AdminAddRelationshipModalComponent } from '../add-relationship-modal/add-relationship-modal.component';
import { AdminEditRelationshipModalComponent } from '../edit-relationship-modal/edit-relationship-modal.component';
import { StaffStatusModalComponent, StaffStatusModalData } from '../../../agency-portal/staff/staff-status-modal/staff-status-modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { UserService } from 'app/shared/services/user.service';
import { emailExistsValidator } from 'app/shared/validators/email-exists.validator';
import { puertoRicoZipCodeValidator } from 'app/shared/validators/puerto-rico-zip-code.validator';
import { PuertoRicoZipCodeDirective } from 'app/shared/directives/puerto-rico-zip-code.directive';
import { NumericOnlyDirective } from 'app/shared/directives/numeric-only.directive';

@Component({
  selector: 'app-admin-edit-staff',
  templateUrl: './edit.component.html',
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
    GenericTableComponent,
    MatDialogModule,
    PuertoRicoZipCodeDirective,
    NumericOnlyDirective,
  ],
})
export class AdminEditStaffComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _staffService = inject(StaffService);
  private _customRouterService = inject(CustomRouterService);
  private _notificationService = inject(NotificationService);
  private _route = inject(ActivatedRoute);
  private _authService = inject(AuthService);
  private _translocoService = inject(TranslocoService);
  private _optionSelectionService = inject(OptionSelectionService);
  private _geoService = inject(GeoService);
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _staffTypeService = inject(StaffTypeService);
  private _staffClassificationService = inject(StaffClassificationService);
  private _permissionService = inject(PermissionService);
  private _staffRelationshipService = inject(StaffRelationshipService);
  private _matDialog = inject(MatDialog);
  private _fuseConfirmationService = inject(FuseConfirmationService);
  private _userService = inject(UserService);

  // Email original para excluir de la validación en edición
  originalEmail: string = '';

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
  // Resultado de revisión / Review result
  // Review result
  reviewResult: OptionSelection[] = [];

  // Lista completa de opciones de selección
  listAdministrativePositions: OptionSelection[] = [];
  listOperationalPositions: OptionSelection[] = [];
  listBoardMemberTitles: OptionSelection[] = [];
  // Listas para campos de Miembros de la Junta
  listTenureDurationUnits: OptionSelection[] = [];
  listReceivesProgramSalary: OptionSelection[] = [];

  // Propiedad para controlar si mostrar campos de revisión (solo para empleados)
  isEmployee: boolean = false;
  isBoardMember: boolean = false;
  selectedClassification: StaffClassification | null = null;

  // Propiedad para controlar si mostrar campos de revisión (solo para administradores)
  canViewReviewFields: boolean = false;

  // Lista completa de opciones de selección
  allOptionSelections: OptionSelection[] = [];

  // Parámetro de la escuela
  // School parameter
  param: Staff | null;

  // Configuración de la tabla de relaciones
  get relationshipsTableConfig(): GenericTableConfig {
    return {
      dataSource: new MatTableDataSource<any>(),
      dataSourceList: [],
      columnsSchema: STAFF_RELATIONSHIPS_COLUMNS_SCHEMA,
      displayedColumns: STAFF_RELATIONSHIPS_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
      handler: this,
      showPaginator: true,
      pageSize: 25,
      pageSizeOptions: [25, 50, 100],
      length: 0,
      addMenuShow: !this.isEmployee, // Solo mostrar para no empleados
      addMenuItems: [
        {
          id: 'add',
          label: 'staff.edit.relationships.add',
        },
      ],
    };
  }

  headerConfig: GenericHeaderConfig = {
    title: 'staff.edit.title',
    formGroup: this._formBuilder.group({
      id: new FormControl(''),
      // First name
      firstName: new FormControl('', [Validators.required]),
      // Middle name
      middleName: new FormControl(''),
      // Father last name
      fatherLastName: new FormControl('', [Validators.required]),
      // Mother last name
      motherLastName: new FormControl(''),
      // Status
      status: new FormControl(''),
      // Position
      position: new FormControl('', [Validators.required]),
      // Staff type
      staffType: new FormControl('', [Validators.required]),
      // Staff classification
      staffClassification: new FormControl(''),
      // Contract start date
      contractStartDate: new FormControl(''),
      contractEndDate: new FormControl(''),
      // Birth date
      birthDate: new FormControl('', [Validators.required, minimumAgeValidator(18)]),
      // Email
      email: new FormControl('', [Validators.required, Validators.email], [emailExistsValidator(this._userService, this.originalEmail)]),
      // Postal address
      postalAddress: new FormControl('', [Validators.required]),
      // City
      city: new FormControl('', [Validators.required]),
      // Region
      region: new FormControl('', [Validators.required]),
      // Area code
      zipCode: new FormControl('', [Validators.required, puertoRicoZipCodeValidator()]),
      // Comments
      comments: new FormControl(''),
      // Review result
      reviewResult: new FormControl(''),
      // Review date
      reviewDate: new FormControl(''),
      // Review justification
      reviewJustification: new FormControl(''),
      // Campos específicos para Miembros de la Junta
      tenureDuration: new FormControl(''),
      tenureDurationUnit: new FormControl(''),
      receivesProgramSalary: new FormControl(''),
    }),
    // Submit button
    submitButtonShow: true,
    submitButtonText: 'staff.edit.submitButton',
    submitDisabled: true, // Inicialmente deshabilitado
    // Cancel button
    cancelButtonShow: true,
    cancelButtonText: 'staff.edit.cancelButton',
    // Settings button
    settingsButtonShow: true,
    settingsButtonTooltip: 'staff.edit.settings.tooltip',
    settingsMenuItems: [
      {
        id: 'toggle-active',
        label: 'staff.edit.settings.toggle-active',
        icon: 'heroicons_outline:power'
      }
    ],
  };

  // Compare methods
  compare = compare;
  comparePostal = comparePostal;
  compareItems = compareItems;
  compareById = compareById;

  // Agencia Id
  agencyId: number = 0;

  // Loading
  isLoading: boolean = false;

  // Lenguaje actual
  currentLang: string = 'es';

  /**
   * Obtiene el label correcto para el campo de comentarios según el tipo de staff
   */
  get commentsLabel(): string {
    if (this.isEmployee) {
      return this._translocoService.translate('staff.edit.comments.employee.label');
    } else if (this.isBoardMember) {
      return this._translocoService.translate('staff.edit.comments.boardMember.label');
    } else {
      return this._translocoService.translate('staff.edit.comments.label');
    }
  }

  /**
   * Determina si el botón de submit debe estar habilitado
   */
  get isSubmitButtonEnabled(): boolean {
    const form = this.headerConfig.formGroup;

    // Si el formulario no es válido, deshabilitar
    if (!form.valid) {
      return false;
    }

    // Validaciones específicas según el tipo de staff
    if (this.isEmployee) {
      // Para empleados: clasificación es requerida
      const staffClassification = form.get('staffClassification')?.value;
      if (!staffClassification) {
        return false;
      }

      // Para empleados: posición es requerida
      const position = form.get('position')?.value;
      if (!position) {
        return false;
      }
    } else if (this.isBoardMember) {
      // Para miembros de junta: email, dirección postal, ciudad, región, código de área son requeridos
      const email = form.get('email')?.value;
      const postalAddress = form.get('postalAddress')?.value;
      const city = form.get('city')?.value;
      const region = form.get('region')?.value;
      const zipCode = form.get('zipCode')?.value;

      if (!email || !postalAddress || !city || !region || !zipCode) {
        return false;
      }
      // Validar campos específicos de miembros de junta
      const tenureDuration = form.get('tenureDuration')?.value;
      const tenureDurationUnit = form.get('tenureDurationUnit')?.value;
      const receivesProgramSalary = form.get('receivesProgramSalary')?.value;
      if (!tenureDuration || !tenureDurationUnit || !receivesProgramSalary) {
        return false;
      }
    }

    return true;
  }

  ngOnInit(): void {
    // Obtener datos del resolver en lugar de suscribirse
    const resolvedData = this._route.snapshot.data['data'];

    if (resolvedData) {
      // Asignar datos directamente desde el resolver
      this.param = resolvedData.staff;
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
      this.reviewResult = this.allOptionSelections.filter((option: OptionSelection) => option.optionKey === 'reviewResult');
      // Listas para campos de Miembros de la Junta
      this.listTenureDurationUnits = this.allOptionSelections.filter((option: OptionSelection) => option.optionKey === 'tenureDurationUnit');
      this.listReceivesProgramSalary = this.allOptionSelections.filter((option: OptionSelection) => option.optionKey === 'yesNo');

      // Si el formulario ya está inicializado y es miembro de junta, actualizar los valores
      if (this.param && this.isBoardMember) {
        const tenureDurationUnitControl = this.headerConfig.formGroup.get('tenureDurationUnit');
        const receivesProgramSalaryControl = this.headerConfig.formGroup.get('receivesProgramSalary');

        if (tenureDurationUnitControl && this.param.tenureDurationUnitId) {
          const tenureUnit = this.listTenureDurationUnits.find(u => u.id === this.param.tenureDurationUnitId);
          if (tenureUnit) {
            tenureDurationUnitControl.setValue(tenureUnit);
          }
        }

        if (receivesProgramSalaryControl && this.param.receivesProgramSalaryId) {
          const receivesSalary = this.listReceivesProgramSalary.find(s => s.id === this.param.receivesProgramSalaryId);
          if (receivesSalary) {
            receivesProgramSalaryControl.setValue(receivesSalary);
          }
        }

        this._changeDetectorRef.detectChanges();
      }

      // Configurar el formulario con los datos del staff
      this.setFormData();

      // Configurar relaciones si existen
      if (resolvedData.relationships) {
        this.setupRelationshipsTable(resolvedData.relationships);
      }

      // Determinar tipo de staff y configurar validaciones
      this.determineStaffTypeAndSetupValidations();

      this._changeDetectorRef.detectChanges();
    }

    // Obtener Agencia desde local storage desde AuthService
    this.agencyId = this._authService.getAgencyId();

    // Verificar permisos de administrador
    this.checkAdminPermissions();

    // Transloco
    this._translocoService.langChanges$.pipe(takeUntil(this._unsubscribeAll)).subscribe((lang: string) => {
      this.currentLang = lang;
    });

    // Suscribirse a cambios en el tipo de staff
    this.headerConfig.formGroup.get('staffType')?.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((staffType: StaffType) => {
      this.onStaffTypeChange(staffType);
    });

    // Suscribirse a cambios en la clasificación
    this.headerConfig.formGroup.get('staffClassification')?.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((classification: StaffClassification) => {
      this.onClassificationChange(classification);
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onSetForm(param: Staff): void {
    this.param = param;

    // Guardar el email original para excluirlo de la validación
    this.originalEmail = param.email || '';

    const staffType = this.listStaffTypes.find((st) => st.id === param.staffType?.id);

    if (staffType) {
      this.isEmployee = staffType.name?.toLowerCase().includes('empleado') || staffType.nameEn?.toLowerCase().includes('employee') || staffType.id === 1;
      this.isBoardMember = staffType.name === 'Miembro de la Junta' || staffType.nameEn === 'Board Member';
    }

    if (this.isEmployee) {

    } else {
      this.listPositions = this.listBoardMemberTitles;
      this._changeDetectorRef.detectChanges();
    }

    // TERCERO: Ahora hacer el patchValue cuando listPositions ya tiene las opciones correctas
    this.headerConfig.formGroup.patchValue({
      id: param.id,
      firstName: param.firstName,
      middleName: param.middleName,
      fatherLastName: param.fatherLastName,
      motherLastName: param.motherLastName,
      status: param.status,
      position: param.position,
      staffType: param.staffType,
      staffClassification: param.staffClassification,
      contractStartDate: param.contractStartDate,
      contractEndDate: param.contractEndDate,
      birthDate: param.birthDate,
      email: param.email,
      postalAddress: param.postalAddress,
      city: param.city,
      region: param.region,
      zipCode: param.zipCode,
      comments: param.comments,
      reviewResult: this.reviewResult.find((o) => o.id === param.reviewResultId),
      reviewDate: param.reviewDate,
      reviewJustification: param.reviewJustification,
      tenureDuration: param.tenureDuration,
      tenureDurationUnit: param.tenureDurationUnitId ? this.listTenureDurationUnits.find(u => u.id === param.tenureDurationUnitId) : null,
      receivesProgramSalary: param.receivesProgramSalaryId ? this.listReceivesProgramSalary.find(s => s.id === param.receivesProgramSalaryId) : null,
    });

    // Actualizar el validador de email con el email original
    const emailControl = this.headerConfig.formGroup.get('email');
    if (emailControl) {
      emailControl.clearAsyncValidators();
      emailControl.setAsyncValidators([emailExistsValidator(this._userService, this.originalEmail)]);
      emailControl.updateValueAndValidity();
    }

    // Actualizar validaciones
    this.updateValidations();

    // Actualizar el estado inicial del botón de submit
    this.updateSubmitButtonState();
  }

  onSubmit(): void {
    // Validar formulario
    if (this.headerConfig.formGroup.invalid) {
      this._notificationService.showError('Por favor, complete todos los campos requeridos');
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

    // Código de área (solo para no empleados)
    const zipCode: string = this.isEmployee ? '' : (formValues.zipCode || '');

    // Ciudad (solo para no empleados)
    const cityId: number = this.isEmployee ? 0 : (formValues.city?.id || 0);

    // Región (solo para no empleados)
    const regionId: number = this.isEmployee ? 0 : (formValues.region?.id || 0);

    // Fecha de inicio de contrato (solo para empleados)
    const contractStartDate: string | null = this.isEmployee ? formValues.contractStartDate || null : null;

    // Fecha de finalización de contrato (solo para empleados)
    const contractEndDate: string | null = this.isEmployee ? formValues.contractEndDate || null : null;

    // Status - usar el valor existente o establecer por defecto a 1 (Activo)
    const statusId: number = formValues.status?.id || this.param?.statusId || 1;

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
        this._notificationService.showError('La clasificación es requerida para empleados');
        this.isLoading = false;
        return;
      }
    } else if (this.isBoardMember) {
      // Para miembros de junta: email, dirección postal, ciudad, región, código de área son requeridos
      if (!email || !postalAddress || !cityId || !regionId || !zipCode) {
        this._notificationService.showError('Los campos de contacto y ubicación son requeridos para miembros de junta');
        this.isLoading = false;
        return;
      }
      // Validar campos específicos de miembros de junta
      const tenureDuration = formValues.tenureDuration;
      const tenureDurationUnit = formValues.tenureDurationUnit;
      const receivesProgramSalary = formValues.receivesProgramSalary;
      if (!tenureDuration || !tenureDurationUnit || !receivesProgramSalary) {
        this._notificationService.showError('Por favor, complete todos los campos requeridos');
        this.isLoading = false;
        return;
      }
    }

    // Campos de revisión
    let reviewResultId: number | undefined;
    let reviewDate: string | undefined;
    let reviewJustification: string | undefined;

    // Solo incluir campos de revisión si el usuario tiene permisos para verlos
    if (this.canViewReviewFields) {
      reviewResultId = formValues.reviewResult?.id;
      reviewDate = formValues.reviewDate;
      reviewJustification = formValues.reviewJustification;
    }

    // Crear staff con campos condicionales según el tipo
    const staffRequest: any = {
      id: formValues.id,
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

    // Agregar campos específicos para miembros de junta
    if (this.isBoardMember) {
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
    if (this.isBoardMember) {
      staffRequest.birthDate = birthDate;
    }

    // Agregar campos de revisión solo si el usuario tiene permisos para verlos
    if (this.canViewReviewFields) {
      staffRequest.reviewResultId = reviewResultId;
      staffRequest.reviewDate = reviewDate;
      staffRequest.reviewJustification = reviewJustification;
    }

    // Disable the form
    this.headerConfig.formGroup.disable();

    // Crear staff
    this._staffService.updateStaff(staffRequest, {}).subscribe({
            next: (response) => {
        switch (response.body) {
          case true:
            // Mensaje específico para staff usando traducciones
            const staffTypeKey = this.isEmployee ? 'staff.edit.success.employee' : 'staff.edit.success.boardMember';

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
            this._notificationService.showErrorDialog('staff.edit.error.general');
            break;
        }
      },
      error: (err) => {
        this._notificationService.showError(this._translocoService.translate('staff.edit.error.general'));
        this.headerConfig.formGroup.enable();
      },
      complete: () => {
        this.isLoading = false;
        // Habilitar el formulario pero mantener staffType deshabilitado
        this.headerConfig.formGroup.enable();
        this.headerConfig.formGroup.get('staffType')?.disable();
      },
    });
  }

  onCancel(): void {
    // Navegar a la lista correspondiente según el tipo de staff seleccionado
    const targetRoute = this.isBoardMember ? 'staff/board-members' : 'staff/employees';
    this._customRouterService.navigate([targetRoute]);
  }

  // Método para manejar acciones del menú de settings
  onSettingsMenuAction(menuItemId: string): void {
    switch (menuItemId) {
      case 'toggle-active':
        this.onToggleActive();
        break;
      default:
        console.warn(`Acción de menú no reconocida: ${menuItemId}`);
    }
  }

  // Método para activar/desactivar
  private onToggleActive(): void {
    if (!this.param?.id) {
      console.error('No se puede cambiar el estado: ID de staff no disponible');
      return;
    }

    const currentIsActive = this.param.isActive ?? true;

    const dialogRef = this._matDialog.open(StaffStatusModalComponent, {
      data: {
        staffId: this.param.id,
        isActive: currentIsActive,
        isActiveOptions: this.listStatus
      } as StaffStatusModalData,
      disableClose: false,
      width: '600px',
      maxWidth: '90vw',
      panelClass: ['mat-dialog-container', 'dialog-responsive']
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action === 'submit') {
        // Recargar los datos del staff
        this.reloadStaffData();
      }
    });
  }

  // Método para recargar los datos del staff después de cambiar el estado
  private reloadStaffData(): void {
    if (!this.param?.id) {
      return;
    }

    const requestParameters: QueryParameters = {
      id: this.param.id,
      isList: false,
      isActive: false,
    };

    this._staffService.getStaffById(requestParameters).subscribe({
      next: (response: any) => {
        if (response?.body) {
          // Actualizar el parámetro con los nuevos datos
          this.param = response.body;
          // Actualizar el formulario con los nuevos datos
          this.onSetForm(response.body);
          this._changeDetectorRef.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error al recargar los datos del staff:', error);
      }
    });
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
    });

    // Si es miembro de junta, limpiar los campos de fecha de contrato
    if (this.isBoardMember) {
      this.headerConfig.formGroup.patchValue({
        contractStartDate: null,
        contractEndDate: null
      });
    }

    // Si es empleado, solo limpiar la clasificación y posición
    // Los campos de nombres se mantienen visibles pero sin validación obligatoria
    if (this.isEmployee) {
      // No limpiar los campos de nombres, solo la clasificación y posición
      // Los campos se mantienen para que el usuario pueda llenar la información si lo desea
    }

    // Actualizar validaciones
    this.updateValidations();

    // Cargar posiciones según el tipo
    this.loadPositionsByType();

    // Actualizar el estado del botón de submit
    this.updateSubmitButtonState();

    this._changeDetectorRef.detectChanges();
  }

  /**
   * Maneja el cambio en la clasificación de staff
   */
  onClassificationChange(classification: StaffClassification): void {
    this.selectedClassification = classification;

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

    // Actualizar el estado del botón de submit
    this.updateSubmitButtonState();

    this._changeDetectorRef.detectChanges();
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
      contractStartDate: null,
      contractEndDate: null,
    });

    // Las validaciones se manejan dinámicamente en updateValidations()
    // No es necesario restaurar validaciones aquí

    this.updateValidations();
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

    // Actualizar el estado del botón de submit
    this.updateSubmitButtonState();
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
      // No limpiar posiciones si ya están cargadas para miembros de junta
      if (!this.isBoardMember) {
        this.listPositions = [];
      }
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
   * Abre el modal para agregar una nueva relación
   */
  onAddRelationship(): void {
    const dialogRef = this._matDialog.open(AdminAddRelationshipModalComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: {
        currentStaffId: this.headerConfig.formGroup.get('id')?.value,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadStaffRelationships();
      }
    });
  }

  /**
   * Método requerido por GenericTable para el botón de agregar
   */
  onAdd(): void {
    this.onAddRelationship();
  }

  /**
   * Método requerido por GenericTable para el botón de agregar (interfaz OnGenericTableHandler)
   */
  onAddButtonClick(event?: Event, tableId?: string): void {
    this.onAddRelationship();
  }

  /**
   * Maneja las acciones del menú de agregar
   */
  onAddMenuAction(menuItemId: string): void {
    if (menuItemId === 'add') {
      this.onAddRelationship();
    }
  }

  /**
   * Edita una relación existente
   */
  onTableEdit(event: Event, element: any): void {
    event.stopPropagation();
    event.preventDefault();
    this.onTableEditElement(event, element);
  }

  /**
   * Elimina una relación existente
   */
  onTableDelete(event: Event, element: any): void {
    event.stopPropagation();
    event.preventDefault();
    this.onTableDeleteElement(event, element);
  }

  /**
   * Elimina una relación existente (interfaz OnGenericTableHandler)
   */
  onTableDeleteElement(event: Event, element: any): void {
    event.stopPropagation();
    event.preventDefault();

    // Mostrar confirmación antes de eliminar
    const dialogRef = this._fuseConfirmationService.open({
      title: 'Confirmar eliminación',
      message: '¿Está seguro de que desea eliminar esta relación?',
      actions: {
        confirm: {
          label: 'Eliminar',
          color: 'warn'
        },
        cancel: {
          label: 'Cancelar'
        }
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirmed') {
        this.deleteRelationship(element.id);
      }
    });
  }

  /**
   * Edita una relación existente (interfaz OnGenericTableHandler)
   */
  onTableEditElement(event: Event, element: any): void {
    event.stopPropagation();
    event.preventDefault();

    // Abrir modal de edición
    const dialogRef = this._matDialog.open(AdminEditRelationshipModalComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: {
        currentStaffId: this.headerConfig.formGroup.get('id')?.value,
        relationship: element
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadStaffRelationships();
      }
    });
  }

  /**
   * Elimina una relación específica
   */
  private deleteRelationship(relationshipId: number): void {
    const queryParams: QueryParameters = {
      id: relationshipId
    };

    this._staffRelationshipService.deactivateRelationship(queryParams).subscribe({
      next: (response) => {
        this._notificationService.showSuccess('Relación eliminada exitosamente');
        this.loadStaffRelationships(); // Recargar la lista
      },
      error: (error) => {
        console.error('Error deleting relationship:', error);
        this._notificationService.showError('Error al eliminar la relación');
      }
    });
  }

    /**
   * Carga las relaciones del empleado
   */
    private loadStaffRelationships(): void {
        // Solo cargar relaciones si tenemos un ID de staff
        const staffId = this.headerConfig.formGroup.get('id')?.value;
        if (!staffId) {
          return;
        }

        const requestParameters: QueryParameters = {
          id: staffId,
          isList: true,
        };

        this._staffRelationshipService.getRelationshipsByStaffId(requestParameters).subscribe((relationships) => {
          if (relationships) {
            this.relationshipsTableConfig.dataSource.data = relationships;
            this.relationshipsTableConfig.length = relationships.length;
            this._changeDetectorRef.detectChanges();
          }
        });
      }

  /**
   * Actualiza el estado del botón de submit basándose en la validez del formulario
   */
  private updateSubmitButtonState(): void {
    this.headerConfig.submitDisabled = !this.isSubmitButtonEnabled;
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

  /**
   * Configura el formulario con los datos del staff
   */
  private setFormData(): void {
    if (this.param) {
      this.headerConfig.formGroup.patchValue({
        id: this.param.id,
        firstName: this.param.firstName,
        middleName: this.param.middleName,
        fatherLastName: this.param.fatherLastName,
        motherLastName: this.param.motherLastName,
        position: this.findPositionById(this.param.positionId),
        staffType: this.listStaffTypes.find(type => type.id === this.param?.staffTypeId),
        staffClassification: this.listStaffClassifications.find(classification => classification.id === this.param?.staffClassificationId),
        contractStartDate: this.param.contractStartDate,
        contractEndDate: this.param.contractEndDate,
        birthDate: this.param.birthDate,
        email: this.param.email,
        postalAddress: this.param.postalAddress,
        city: this.listCities.find(city => city.id === this.param?.cityId),
        region: this.listRegions.find(region => region.id === this.param?.regionId),
        zipCode: this.param.zipCode,
        comments: this.param.comments,
        reviewResult: this.reviewResult.find(result => result.id === this.param?.reviewResultId),
        reviewDate: this.param.reviewDate,
        reviewJustification: this.param.reviewJustification,
      });
    }
  }

  /**
   * Encuentra la posición por ID en las listas de posiciones
   */
  private findPositionById(positionId: number): OptionSelection | null {
    const adminPosition = this.listAdministrativePositions.find(pos => pos.id === positionId);
    if (adminPosition) return adminPosition;

    const operationalPosition = this.listOperationalPositions.find(pos => pos.id === positionId);
    if (operationalPosition) return operationalPosition;

    const boardMemberTitle = this.listBoardMemberTitles.find(pos => pos.id === positionId);
    if (boardMemberTitle) return boardMemberTitle;

    return null;
  }

  /**
   * Configura la tabla de relaciones
   */
  private setupRelationshipsTable(relationships: any[]): void {
    if (relationships && relationships.length > 0) {
      this.relationshipsTableConfig.dataSource.data = relationships;
      this.relationshipsTableConfig.length = relationships.length;
    }
  }

  /**
   * Determina el tipo de staff y configura las validaciones
   */
  private determineStaffTypeAndSetupValidations(): void {
    if (this.param) {
      const staffType = this.param.staffType;

      if (staffType?.name === 'Empleado' || staffType?.nameEn === 'Employee') {
        this.isEmployee = true;
        this.isBoardMember = false;
        this.listPositions = [...this.listAdministrativePositions, ...this.listOperationalPositions];
      } else if (staffType?.name === 'Miembro de la Junta' || staffType?.nameEn === 'Board Member') {
        this.isEmployee = false;
        this.isBoardMember = true;
        this.listPositions = this.listBoardMemberTitles;
      }

      this.updateValidations();
    }
  }
}
