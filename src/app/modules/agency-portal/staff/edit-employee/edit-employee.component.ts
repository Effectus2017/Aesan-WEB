import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
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
import { OptionSelection } from 'app/shared/models/common/OptionSelection';
import {
  compareById,
  compareItems,
  isNullOrUndefinedEmptyStringNullArray,
  minimumAgeValidator,
  logFormValidationErrors,
  generateTimeOptions,
  getEndTimeOptions,
  TimeOption,
} from 'app/shared/utils';
import { AuthService } from 'app/core/auth/auth.service';
import { isAdminRole } from 'app/shared/constants/role-keys';
import { provideNativeDateAdapter } from '@angular/material/core';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { StaffTypeService } from 'app/shared/services/staff-type.service';
import { StaffType } from 'app/shared/models/staff/StaffType';
import { Staff } from 'app/shared/models/staff/Staff';
import { StaffClassificationService } from 'app/shared/services/staff-classification.service';
import { StaffClassification } from 'app/shared/models/staff/StaffClassification';
import { StaffStatusModalComponent, StaffStatusModalData } from '../staff-status-modal/staff-status-modal.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FieldVisibilityService } from '../../../../shared/services/field-visibility.service';
import { SiteService } from 'app/shared/services/site.service';
import { SiteStaffService } from 'app/shared/services/site-staff.service';
import { Site } from 'app/shared/models/site/Site';
import { UserService } from 'app/shared/services/user.service';
import { emailExistsValidator } from 'app/shared/validators/email-exists.validator';
import { noOverlappingSchedulesValidator } from 'app/shared/validators/no-overlapping-schedules.validator';
import { DisableIfAgencyRestrictedDirective } from 'app/shared/directives/disable-if-agency-restricted/disable-if-agency-restricted.directive';
import { DisableIfNoPermissionDirective } from 'app/shared/directives/disable-if-no-permission/disable-if-no-permission.directive';
@Component({
  selector: 'app-edit-employee',
  templateUrl: './edit-employee.component.html',
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
    MatDialogModule,
  ],
})
export class EditEmployeeComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _staffService = inject(StaffService);
  private _customRouterService = inject(CustomRouterService);
  private _notificationService = inject(NotificationService);
  private _authService = inject(AuthService);
  private _translocoService = inject(TranslocoService);
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _matDialog = inject(MatDialog);
  public fieldVisibilityService = inject(FieldVisibilityService);
  private _siteStaffService = inject(SiteStaffService);
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
  // Lista de Sitios
  listSites: Site[] = [];
  // Resultado de revisión / Review result
  reviewResult: OptionSelection[] = [];

  // Lista completa de opciones de selección
  listAdministrativePositions: OptionSelection[] = [];
  listOperationalPositions: OptionSelection[] = [];

  /** Opciones de hora para Desde/Hasta (rango cada 30 min), como en sitios. */
  timeOptions: TimeOption[] = [];

  /** Para mostrar el diálogo de solapamiento de horarios solo una vez por sesión de error. */
  private _schedulesOverlapWarningShown = false;

  // Propiedades específicas de empleados
  selectedClassification: StaffClassification | null = null;

  // Propiedad para controlar si mostrar campos de revisión (solo para administradores)
  canViewReviewFields: boolean = false;

  // ViewChild para el contenedor del formulario
  @ViewChild('formContainer', { static: false }) formContainer!: ElementRef;

  // Tipo de staff actual para control de visibilidad de campos
  currentStaffType: string = 'employee';

  // Lista completa de opciones de selección
  //allOptionSelections: OptionSelection[] = [];
  listSalaryOrigins: OptionSelection[] = [];

  // Parámetro del staff
  param: Staff | null = null;

  // Email original para excluir de la validación en edición
  originalEmail: string = '';

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
      staffClassification: new FormControl('', [Validators.required]),
      // Contract start date
      contractStartDate: new FormControl('', [Validators.required]),
      // Contract end date
      contractEndDate: new FormControl('', [Validators.required]),
      scheduleFrom: new FormControl('', [Validators.required]),
      scheduleTo: new FormControl('', [Validators.required]),
      administrativePosition: new FormControl(''),
      administrativeContractStartDate: new FormControl(''),
      administrativeContractEndDate: new FormControl(''),
      administrativeScheduleFrom: new FormControl(''),
      administrativeScheduleTo: new FormControl(''),
      operationalPosition: new FormControl(''),
      operationalContractStartDate: new FormControl(''),
      operationalContractEndDate: new FormControl(''),
      operationalScheduleFrom: new FormControl(''),
      operationalScheduleTo: new FormControl(''),
      // Birth date
      birthDate: new FormControl('', [Validators.required]),
      // Email
      email: new FormControl('', [Validators.required, Validators.email], [emailExistsValidator(this._userService, this.originalEmail)]),
      // Comments
      comments: new FormControl(''),
      // Sitio asignado (opcional)
      site: new FormControl(null),
      // Review result
      reviewResult: new FormControl(''),
      // Review date
      reviewDate: new FormControl(''),
      // Review justification
      reviewJustification: new FormControl(''),
      salaryOrigins: new FormControl([] as OptionSelection[], [Validators.required]),
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
        icon: 'mat_outline:check_box',
        iconColor: 'text-green-500',
      },
    ],
  };

  // Compare methods
  compareById = compareById;
  compareItems = compareItems;

  /** True si la clasificación es "Ambos" (id 3). */
  get isClassificationBoth(): boolean {
    return this.selectedClassification?.id === 3;
  }

  /**
   * Opciones filtradas para el campo "Hasta" según la hora "Desde" seleccionada (como en sitios).
   */
  getScheduleToOptions(fromFieldName: string): TimeOption[] {
    const fromControl = this.headerConfig.formGroup.get(fromFieldName);
    if (!fromControl) return this.timeOptions;
    return getEndTimeOptions(this.timeOptions, fromControl.value, '23:59');
  }

  // Agencia Id
  agencyId: number = 0;

  // Loading
  isLoading: boolean = false;

  // Lenguaje actual
  currentLang: string = 'es';

  /**
   * Obtiene el label correcto para el campo de comentarios para empleados
   */
  get commentsLabel(): string {
    return this._translocoService.translate('staff.edit.comments.employee.label');
  }

  /**
   * Actualiza el estado del botón de guardar
   */
  private updateSubmitButtonState(): void {
    this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;
    this._changeDetectorRef.detectChanges();
  }

  ngOnInit(): void {
    // Obtener Agencia desde local storage desde AuthService
    this.agencyId = this._authService.getAgencyId();

    // Establecer la configuración activa para este formulario
    this.fieldVisibilityService.setActiveConfig('staff');

    // Establecer tipo de staff como empleado
    this.currentStaffType = 'employee';

    // Establecer valores por defecto para el usuario actual
    const userRole = this._authService.getUserRole();
    const userPermissions = this._authService.getUserPermissions() || [];

    if (userRole) {
      this.fieldVisibilityService.setCurrentUser(userRole, userPermissions);
    }

    // Verificar permisos de administrador
    this.canViewReviewFields = isAdminRole(userRole);

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

    // Opciones de hora para Desde/Hasta (como en sitios)
    this.timeOptions = generateTimeOptions();

    // Transloco
    this._translocoService.langChanges$.pipe(takeUntil(this._unsubscribeAll)).subscribe((lang: string) => {
      this.currentLang = lang;
    });

    // Obtener datos del resolver
    const resolvedData = this._activatedRoute.snapshot.data['data'];
    if (resolvedData) {
      // Cargar opciones desde el resolver
      //this.allOptionSelections = resolvedData.options;
      // Status
      this.listStatus = resolvedData.options.filter((option: OptionSelection) => option.optionKey === 'isActive');
      // Posiciones administrativas y operacionales
      this.listAdministrativePositions = resolvedData.options.filter((option: OptionSelection) => option.optionKey === 'administrativePosition');
      this.listOperationalPositions = resolvedData.options.filter((option: OptionSelection) => option.optionKey === 'operationalPosition');
      // Review result
      this.reviewResult = resolvedData.options.filter((option: OptionSelection) => option.optionKey === 'reviewResult');
      this.listSalaryOrigins = resolvedData.options.filter((option: OptionSelection) => option.optionKey === 'salaryOrigin');

      // Cargar datos desde el resolver
      this.listStaffTypes = resolvedData.staffTypes;
      this.listStaffClassifications = resolvedData.staffClassifications;

      // Cargar staff desde el resolver
      this.param = resolvedData.staff;
      this.onSetForm(resolvedData.staff);

      // Cargar sitios desde el resolver
      if (resolvedData.sites) {
        this.listSites = resolvedData.sites;
      }
    }

    // Suscribirse a cambios en la clasificación
    this.headerConfig.formGroup
      .get('staffClassification')
      ?.valueChanges.pipe(takeUntil(this._unsubscribeAll))
      .subscribe((classification: StaffClassification) => {
        this.onClassificationChange(classification);
      });

    // Suscribirse a cambios de validación del formulario para actualizar el estado del botón de guardar (solo submitDisabled para evitar stack overflow)
    this.headerConfig.formGroup.statusChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
      this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;
      const hasOverlap = this.headerConfig.formGroup.hasError('schedulesOverlap');
      if (hasOverlap && !this._schedulesOverlapWarningShown) {
        this._schedulesOverlapWarningShown = true;
        this._notificationService.showWarningDialog('staff.add.schedulesOverlap');
      }
      if (!hasOverlap) {
        this._schedulesOverlapWarningShown = false;
      }
    });

    // Establecer el estado inicial del botón
    this.updateSubmitButtonState();

    // Única llamada a detectChanges al final de ngOnInit
    this._changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onSetForm(param: Staff): void {
    this.param = param;

    // Guardar el email original para excluirlo de la validación
    this.originalEmail = param.email || '';

    // Para empleados, las posiciones se cargarán según la clasificación
    this.listPositions = [];

    // Buscar los objetos correctos de las listas usando los IDs
    const staffClassification = param.staffClassification?.id ? this.listStaffClassifications.find((sc) => sc.id === param.staffClassification.id) : param.staffClassification;

    const status = param.status?.id ? this.listStatus.find((s) => s.id === param.status.id) : param.status;

    // Establecer la clasificación seleccionada ANTES de cargar posiciones y establecer valores
    if (param.staffClassification) {
      this.selectedClassification = param.staffClassification;
      this.loadPositionsByClassification();
    }

    // Buscar position después de cargar las posiciones
    const position = param.position?.id && this.listPositions.length > 0 ? this.listPositions.find((p) => p.id === param.position.id) : param.position;

    const contracts = param.classificationContracts ?? [];
    const adminContract = contracts.find((c: { staffClassificationId: number }) => c.staffClassificationId === 1);
    const operContract = contracts.find((c: { staffClassificationId: number }) => c.staffClassificationId === 2);
    const adminPosition =
      adminContract?.positionId && this.listAdministrativePositions.length > 0 ? this.listAdministrativePositions.find((p) => p.id === adminContract.positionId) : null;
    const operPosition = operContract?.positionId && this.listOperationalPositions.length > 0 ? this.listOperationalPositions.find((p) => p.id === operContract.positionId) : null;

    this.headerConfig.formGroup.patchValue({
      id: param.id,
      firstName: param.firstName,
      middleName: param.middleName,
      fatherLastName: param.fatherLastName,
      motherLastName: param.motherLastName,
      status,
      position,
      staffType: param.staffType,
      staffClassification: staffClassification,
      contractStartDate: param.contractStartDate,
      contractEndDate: param.contractEndDate,
      birthDate: param.birthDate,
      email: param.email,
      comments: param.comments,
      reviewDate: param.reviewDate,
      reviewJustification: param.reviewJustification,
      site: param.site,
      salaryOrigins: param.salaryOrigins,
    });

    if (param.staffClassificationId === 3 && adminContract && operContract) {
      this.headerConfig.formGroup.patchValue({
        administrativePosition: adminPosition,
        administrativeContractStartDate: adminContract.contractStartDate ?? null,
        administrativeContractEndDate: adminContract.contractEndDate ?? null,
        administrativeScheduleFrom: adminContract.scheduleFrom ?? '',
        administrativeScheduleTo: adminContract.scheduleTo ?? '',
        operationalPosition: operPosition,
        operationalContractStartDate: operContract.contractStartDate ?? null,
        operationalContractEndDate: operContract.contractEndDate ?? null,
        operationalScheduleFrom: operContract.scheduleFrom ?? '',
        operationalScheduleTo: operContract.scheduleTo ?? '',
      });
    } else if (contracts.length > 0 && contracts[0]) {
      const first = contracts[0];

      this.headerConfig.formGroup.patchValue({
        scheduleFrom: first.scheduleFrom ?? '',
        scheduleTo: first.scheduleTo ?? '',
      });
    }

    const positionControl = this.headerConfig.formGroup.get('position');
    const contractStartDateControl = this.headerConfig.formGroup.get('contractStartDate');
    const contractEndDateControl = this.headerConfig.formGroup.get('contractEndDate');
    const scheduleFromControl = this.headerConfig.formGroup.get('scheduleFrom');
    const scheduleToControl = this.headerConfig.formGroup.get('scheduleTo');
    const administrativePositionControl = this.headerConfig.formGroup.get('administrativePosition');
    const operationalPositionControl = this.headerConfig.formGroup.get('operationalPosition');
    const administrativeContractStartDateControl = this.headerConfig.formGroup.get('administrativeContractStartDate');
    const administrativeContractEndDateControl = this.headerConfig.formGroup.get('administrativeContractEndDate');
    const administrativeScheduleFromControl = this.headerConfig.formGroup.get('administrativeScheduleFrom');
    const administrativeScheduleToControl = this.headerConfig.formGroup.get('administrativeScheduleTo');
    const operationalContractStartDateControl = this.headerConfig.formGroup.get('operationalContractStartDate');
    const operationalContractEndDateControl = this.headerConfig.formGroup.get('operationalContractEndDate');
    const operationalScheduleFromControl = this.headerConfig.formGroup.get('operationalScheduleFrom');
    const operationalScheduleToControl = this.headerConfig.formGroup.get('operationalScheduleTo');

    if (param.staffClassificationId === 3) {
      positionControl?.clearValidators();
      contractStartDateControl?.clearValidators();
      contractEndDateControl?.clearValidators();
      scheduleFromControl?.clearValidators();
      scheduleToControl?.clearValidators();
      administrativePositionControl?.setValidators([Validators.required]);
      operationalPositionControl?.setValidators([Validators.required]);
      administrativeContractStartDateControl?.setValidators([Validators.required]);
      administrativeContractEndDateControl?.setValidators([Validators.required]);
      administrativeScheduleFromControl?.setValidators([Validators.required]);
      administrativeScheduleToControl?.setValidators([Validators.required]);
      operationalContractStartDateControl?.setValidators([Validators.required]);
      operationalContractEndDateControl?.setValidators([Validators.required]);
      operationalScheduleFromControl?.setValidators([Validators.required]);
      operationalScheduleToControl?.setValidators([Validators.required]);
      this.headerConfig.formGroup.setValidators([noOverlappingSchedulesValidator()]);
    } else {
      positionControl?.setValidators([Validators.required]);
      contractStartDateControl?.setValidators([Validators.required]);
      contractEndDateControl?.setValidators([Validators.required]);
      scheduleFromControl?.setValidators([Validators.required]);
      scheduleToControl?.setValidators([Validators.required]);
      administrativePositionControl?.clearValidators();
      operationalPositionControl?.clearValidators();
      administrativeContractStartDateControl?.clearValidators();
      administrativeContractEndDateControl?.clearValidators();
      administrativeScheduleFromControl?.clearValidators();
      administrativeScheduleToControl?.clearValidators();
      operationalContractStartDateControl?.clearValidators();
      operationalContractEndDateControl?.clearValidators();
      operationalScheduleFromControl?.clearValidators();
      operationalScheduleToControl?.clearValidators();
      this.headerConfig.formGroup.clearValidators();
    }
    positionControl?.updateValueAndValidity();
    contractStartDateControl?.updateValueAndValidity();
    contractEndDateControl?.updateValueAndValidity();
    scheduleFromControl?.updateValueAndValidity();
    scheduleToControl?.updateValueAndValidity();
    administrativePositionControl?.updateValueAndValidity();
    operationalPositionControl?.updateValueAndValidity();
    administrativeContractStartDateControl?.updateValueAndValidity();
    administrativeContractEndDateControl?.updateValueAndValidity();
    administrativeScheduleFromControl?.updateValueAndValidity();
    administrativeScheduleToControl?.updateValueAndValidity();
    operationalContractStartDateControl?.updateValueAndValidity();
    operationalContractEndDateControl?.updateValueAndValidity();
    operationalScheduleFromControl?.updateValueAndValidity();
    operationalScheduleToControl?.updateValueAndValidity();
    this.headerConfig.formGroup.updateValueAndValidity();

    // Actualizar el validador de email con el email original
    const emailControl = this.headerConfig.formGroup.get('email');
    if (emailControl) {
      emailControl.clearAsyncValidators();
      emailControl.setAsyncValidators([emailExistsValidator(this._userService, this.originalEmail)]);
      emailControl.updateValueAndValidity();
    }

    // Cargar sitio actualmente asignado al staff
    if (param.id) {
      this.loadCurrentSiteAssignment(param.id);
    }

    // 🔒 DESHABILITAR EL CONTROL staffType DEL FORMULARIO DESPUÉS de establecer el valor
    const staffTypeControl = this.headerConfig.formGroup.get('staffType');
    staffTypeControl?.disable();

    // Actualizar el estado del botón después de establecer valores
    this.updateSubmitButtonState();
  }

  /**
   * Muestra el mensaje de éxito después de actualizar el staff
   */
  private showEditSuccessMessage(): void {
    this._notificationService.showSuccessDialogWithCallback(this._translocoService.translate('staff.edit.success.employee'), (result) => {
      if (result === 'confirmed') {
        this._customRouterService.navigate(['staff/employees']);
      }
    });
  }

  onSubmit(): void {
    if (this.isLoading) return;
    // Validar formulario
    if (this.headerConfig.formGroup.invalid) {
      logFormValidationErrors(this.headerConfig.formGroup, 'Formulario de Personal');
      this._notificationService.showErrorDialog(this._translocoService.translate('staff.edit.error.incompleteFields'));
      this.headerConfig.formGroup.markAllAsTouched();
      return;
    }

    const formValues = this.headerConfig.formGroup.value;

    // Fecha de nacimiento
    const birthDate: string = formValues.birthDate || null;

    // Email
    const email: string = formValues.email || '';

    // Fecha de inicio de contrato
    const contractStartDate: string | null = formValues.contractStartDate || null;

    // Fecha de finalización de contrato
    const contractEndDate: string | null = formValues.contractEndDate || null;

    // Status
    const statusId: number = formValues.status?.id || this.param?.statusId || 1;

    // Cargo
    const positionId: number = formValues.position?.id || 0;

    // Tipo de Staff
    const staffTypeId: number = formValues.staffType?.id || this.param?.staffType?.id || 0;

    // Clasificación de Staff
    const staffClassificationId: number = formValues.staffClassification?.id || 0;

    // Comentarios
    const comments: string = formValues.comments || '';

    // Nombres
    const firstName: string = formValues.firstName || '';
    const middleName: string = formValues.middleName || '';
    const fatherLastName: string = formValues.fatherLastName || '';
    const motherLastName: string = formValues.motherLastName || '';

    // Sitio asignado (opcional)
    const siteId: number = formValues.site?.id || null;
    const isPrimary: boolean = false;

    // Loading
    this.isLoading = true;

    // Validación: clasificación es requerida para empleados
    if (!staffClassificationId) {
      this._notificationService.showErrorDialog(this._translocoService.translate('staff.edit.error.classificationRequired'));
      this.isLoading = false;
      return;
    }

    // Validar que staffTypeId sea válido
    if (!staffTypeId) {
      this._notificationService.showErrorDialog(this._translocoService.translate('staff.edit.error.staffTypeRequired'));
      this.isLoading = false;
      return;
    }

    // Campos de revisión
    let reviewResultId: number | undefined;
    let reviewDate: string | undefined;
    let reviewJustification: string | undefined;

    if (this.canViewReviewFields) {
      reviewResultId = formValues.reviewResult?.id;
      reviewDate = formValues.reviewDate;
      reviewJustification = formValues.reviewJustification;
    }

    // Usar valores del formulario directamente. 1=Administrativo, 2=Operacional, 3=Ambos
    let classificationContracts: Array<{
      staffClassificationId: number;
      positionId: number;
      contractStartDate: string | null;
      contractEndDate: string | null;
      scheduleFrom: string | null;
      scheduleTo: string | null;
    }>;
    let effectivePositionId: number;
    let effectiveContractStart: string | null;
    let effectiveContractEnd: string | null;

    if (staffClassificationId === 3) {
      classificationContracts = [
        {
          staffClassificationId: 1,
          positionId: formValues.administrativePosition?.id ?? 0,
          contractStartDate: formValues.administrativeContractStartDate ?? null,
          contractEndDate: formValues.administrativeContractEndDate ?? null,
          scheduleFrom: formValues.administrativeScheduleFrom || null,
          scheduleTo: formValues.administrativeScheduleTo || null,
        },
        {
          staffClassificationId: 2,
          positionId: formValues.operationalPosition?.id ?? 0,
          contractStartDate: formValues.operationalContractStartDate ?? null,
          contractEndDate: formValues.operationalContractEndDate ?? null,
          scheduleFrom: formValues.operationalScheduleFrom || null,
          scheduleTo: formValues.operationalScheduleTo || null,
        },
      ];
      effectivePositionId = formValues.administrativePosition?.id ?? 0;
      effectiveContractStart = formValues.administrativeContractStartDate ?? null;
      effectiveContractEnd = formValues.administrativeContractEndDate ?? null;
    } else {
      classificationContracts = [
        {
          staffClassificationId: staffClassificationId,
          positionId: positionId,
          contractStartDate: contractStartDate,
          contractEndDate: contractEndDate,
          scheduleFrom: formValues.scheduleFrom || null,
          scheduleTo: formValues.scheduleTo || null,
        },
      ];
      effectivePositionId = positionId;
      effectiveContractStart = contractStartDate;
      effectiveContractEnd = contractEndDate;
    }

    // Crear staff request para empleados
    const staffRequest: any = {
      id: formValues.id,
      statusId: statusId,
      positionId: effectivePositionId,
      staffTypeId: staffTypeId,
      staffClassificationId: staffClassificationId,
      comments: comments,
      isActive: formValues.status?.booleanValue ?? true,
      agencyId: this.agencyId,
      firstName: firstName,
      middleName: middleName,
      fatherLastName: fatherLastName,
      motherLastName: motherLastName,
      siteId: siteId,
      isPrimary: isPrimary,
      birthDate: birthDate,
      email: email,
      contractStartDate: effectiveContractStart,
      contractEndDate: effectiveContractEnd,
      salaryOrigins: formValues.salaryOrigins ?? [],
      classificationContracts,
    };

    // Disable the form
    this.headerConfig.formGroup.disable();

    // Actualizar staff
    this._staffService.updateStaff(staffRequest, {}).subscribe({
      next: (response) => {
        switch (response.body) {
          case true:
            this.showEditSuccessMessage();
            break;
          default:
            this._notificationService.showErrorDialog('staff.edit.error.general');
            break;
        }
      },
      error: () => {
        this._notificationService.showErrorDialog('staff.edit.error.general');
        this.headerConfig.formGroup.enable();
      },
      complete: () => {
        this.isLoading = false;
        this.headerConfig.formGroup.enable();
        this.headerConfig.formGroup.get('staffType')?.disable();
      },
    });
  }

  onCancel(): void {
    this._customRouterService.navigate(['staff/employees']);
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
        isActiveOptions: this.listStatus,
      } as StaffStatusModalData,
      disableClose: false,
      width: '600px',
      maxWidth: '90vw',
      panelClass: ['mat-dialog-container', 'dialog-responsive'],
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action === 'submit') {
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
      forDropdown: false,
      isActive: false,
    };

    this._staffService.getStaffById(requestParameters).subscribe({
      next: (response: any) => {
        if (response?.body) {
          this.param = response.body;
          this.onSetForm(response.body);
          this._changeDetectorRef.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error al recargar los datos del staff:', error);
      },
    });
  }

  /**
   * Maneja el cambio en la clasificación de staff
   */
  onClassificationChange(classification: StaffClassification): void {
    const previousClassification = this.selectedClassification;
    // Evitar reprocesar si el valor no cambió (p. ej. re-emisión del mat-select tras re-render)
    if (previousClassification?.id === classification?.id) {
      return;
    }
    this.selectedClassification = classification;

    // Cargar posiciones según la clasificación
    this.loadPositionsByClassification();

    // Actualizar validaciones en el siguiente tick para evitar stack overflow (igual que en add-employee)
    setTimeout(() => {
      const positionControl = this.headerConfig.formGroup.get('position');
      const adminPosControl = this.headerConfig.formGroup.get('administrativePosition');
      const operPosControl = this.headerConfig.formGroup.get('operationalPosition');
      const adminContractStart = this.headerConfig.formGroup.get('administrativeContractStartDate');
      const adminContractEnd = this.headerConfig.formGroup.get('administrativeContractEndDate');
      const adminScheduleFrom = this.headerConfig.formGroup.get('administrativeScheduleFrom');
      const adminScheduleTo = this.headerConfig.formGroup.get('administrativeScheduleTo');
      const operContractStart = this.headerConfig.formGroup.get('operationalContractStartDate');
      const operContractEnd = this.headerConfig.formGroup.get('operationalContractEndDate');
      const operScheduleFrom = this.headerConfig.formGroup.get('operationalScheduleFrom');
      const operScheduleTo = this.headerConfig.formGroup.get('operationalScheduleTo');
      const contractStartDate = this.headerConfig.formGroup.get('contractStartDate');
      const contractEndDate = this.headerConfig.formGroup.get('contractEndDate');
      const scheduleFrom = this.headerConfig.formGroup.get('scheduleFrom');
      const scheduleTo = this.headerConfig.formGroup.get('scheduleTo');

      if (this.selectedClassification?.id === 3) {
        positionControl?.clearValidators();
        contractStartDate?.clearValidators();
        contractEndDate?.clearValidators();
        scheduleFrom?.clearValidators();
        scheduleTo?.clearValidators();
        adminPosControl?.setValidators([Validators.required]);
        operPosControl?.setValidators([Validators.required]);
        adminContractStart?.setValidators([Validators.required]);
        adminContractEnd?.setValidators([Validators.required]);
        adminScheduleFrom?.setValidators([Validators.required]);
        adminScheduleTo?.setValidators([Validators.required]);
        operContractStart?.setValidators([Validators.required]);
        operContractEnd?.setValidators([Validators.required]);
        operScheduleFrom?.setValidators([Validators.required]);
        operScheduleTo?.setValidators([Validators.required]);
        this.headerConfig.formGroup.setValidators([noOverlappingSchedulesValidator()]);
      } else {
        positionControl?.setValidators([Validators.required]);
        contractStartDate?.setValidators([Validators.required]);
        contractEndDate?.setValidators([Validators.required]);
        scheduleFrom?.setValidators([Validators.required]);
        scheduleTo?.setValidators([Validators.required]);
        adminPosControl?.clearValidators();
        operPosControl?.clearValidators();
        adminContractStart?.clearValidators();
        adminContractEnd?.clearValidators();
        adminScheduleFrom?.clearValidators();
        adminScheduleTo?.clearValidators();
        operContractStart?.clearValidators();
        operContractEnd?.clearValidators();
        operScheduleFrom?.clearValidators();
        operScheduleTo?.clearValidators();
        this.headerConfig.formGroup.clearValidators();
      }
      positionControl?.updateValueAndValidity();
      contractStartDate?.updateValueAndValidity();
      contractEndDate?.updateValueAndValidity();
      scheduleFrom?.updateValueAndValidity();
      scheduleTo?.updateValueAndValidity();
      adminPosControl?.updateValueAndValidity();
      operPosControl?.updateValueAndValidity();
      adminContractStart?.updateValueAndValidity();
      adminContractEnd?.updateValueAndValidity();
      adminScheduleFrom?.updateValueAndValidity();
      adminScheduleTo?.updateValueAndValidity();
      operContractStart?.updateValueAndValidity();
      operContractEnd?.updateValueAndValidity();
      operScheduleFrom?.updateValueAndValidity();
      operScheduleTo?.updateValueAndValidity();
      this.headerConfig.formGroup.updateValueAndValidity();

      // Al pasar de Ambos a Administrativo u Operacional, rellenar campos únicos con el bloque que corresponda
      if (previousClassification?.id === 3 && classification?.id === 1) {
        this.headerConfig.formGroup.patchValue({
          position: this.headerConfig.formGroup.get('administrativePosition')?.value,
          contractStartDate: this.headerConfig.formGroup.get('administrativeContractStartDate')?.value,
          contractEndDate: this.headerConfig.formGroup.get('administrativeContractEndDate')?.value,
          scheduleFrom: this.headerConfig.formGroup.get('administrativeScheduleFrom')?.value,
          scheduleTo: this.headerConfig.formGroup.get('administrativeScheduleTo')?.value,
        });
      } else if (previousClassification?.id === 3 && classification?.id === 2) {
        this.headerConfig.formGroup.patchValue({
          position: this.headerConfig.formGroup.get('operationalPosition')?.value,
          contractStartDate: this.headerConfig.formGroup.get('operationalContractStartDate')?.value,
          contractEndDate: this.headerConfig.formGroup.get('operationalContractEndDate')?.value,
          scheduleFrom: this.headerConfig.formGroup.get('operationalScheduleFrom')?.value,
          scheduleTo: this.headerConfig.formGroup.get('operationalScheduleTo')?.value,
        });
      } else if (previousClassification?.id === 1 && classification?.id === 3) {
        // Al pasar de Administrativo a Ambos, rellenar bloque administrativo con los campos únicos
        this.headerConfig.formGroup.patchValue({
          administrativePosition: this.headerConfig.formGroup.get('position')?.value,
          administrativeContractStartDate: this.headerConfig.formGroup.get('contractStartDate')?.value,
          administrativeContractEndDate: this.headerConfig.formGroup.get('contractEndDate')?.value,
          administrativeScheduleFrom: this.headerConfig.formGroup.get('scheduleFrom')?.value,
          administrativeScheduleTo: this.headerConfig.formGroup.get('scheduleTo')?.value,
        });
      } else if (previousClassification?.id === 2 && classification?.id === 3) {
        // Al pasar de Operacional a Ambos, rellenar bloque operacional con los campos únicos
        this.headerConfig.formGroup.patchValue({
          operationalPosition: this.headerConfig.formGroup.get('position')?.value,
          operationalContractStartDate: this.headerConfig.formGroup.get('contractStartDate')?.value,
          operationalContractEndDate: this.headerConfig.formGroup.get('contractEndDate')?.value,
          operationalScheduleFrom: this.headerConfig.formGroup.get('scheduleFrom')?.value,
          operationalScheduleTo: this.headerConfig.formGroup.get('scheduleTo')?.value,
        });
      }

      this.updateSubmitButtonState();
      this._changeDetectorRef.detectChanges();
    }, 0);
  }

  /**
   * Carga las posiciones según la clasificación de staff
   */
  loadPositionsByClassification(): void {
    if (!this.selectedClassification) {
      this.listPositions = [];
      return;
    }

    // Usar IDs en lugar de nombres para identificar clasificaciones
    // ID 1: Administrativo, ID 2: Operacional, ID 3: Ambos
    if (this.selectedClassification?.id === 1) {
      this.listPositions = this.listAdministrativePositions;
    } else if (this.selectedClassification?.id === 2) {
      this.listPositions = this.listOperationalPositions;
    } else {
      this.listPositions = [];
    }

    // Si hay un valor de position en el formulario, actualizarlo para que coincida con la lista cargada
    const positionControl = this.headerConfig.formGroup.get('position');
    const currentPosition = positionControl?.value;
    if (currentPosition?.id && this.listPositions.length > 0) {
      const foundPosition = this.listPositions.find((p) => p.id === currentPosition.id);
      if (foundPosition && foundPosition !== currentPosition) {
        positionControl?.setValue(foundPosition);
      }
    } else if (!currentPosition || !currentPosition.id) {
      // Si no hay posición válida, limpiar el campo y forzar validación
      positionControl?.setValue(null);
      positionControl?.updateValueAndValidity();
    }

    // Forzar revalidación del campo position
    positionControl?.updateValueAndValidity();

    this._changeDetectorRef.detectChanges();
  }

  /**
   * Carga el sitio actualmente asignado al staff
   */
  private loadCurrentSiteAssignment(staffId: number): void {
    const queryParameters: QueryParameters = {
      staffId: staffId,
    };
    this._siteStaffService.getSitesByStaff(queryParameters).subscribe({
      next: (siteStaffs: any) => {
        if (siteStaffs && siteStaffs.length > 0) {
          const activeAssignment = siteStaffs.find((assignment: any) => assignment.isActive);
          if (activeAssignment && this.listSites.length > 0) {
            const site = this.listSites.find((s) => s.id === activeAssignment.siteId);
            if (site) {
              this.headerConfig.formGroup.patchValue({
                site: site,
              });
            }
          }
        }
      },
      error: (err) => {
        console.error('Error loading site assignment:', err);
      },
    });
  }
}
