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
import { OptionSelection } from 'app/shared/models/common/OptionSelection';
import { AuthService } from 'app/core/auth/auth.service';
import { compareById, generateTimeOptions, getEndTimeOptions, logFormValidationErrors, TimeOption, toIsoDateString } from 'app/shared/utils';
import { StaffType } from 'app/shared/models/staff/StaffType';
import { StaffClassification } from 'app/shared/models/staff/StaffClassification';
import { ActivatedRoute } from '@angular/router';
import { School } from 'app/shared/models/school/School';
import { Site } from 'app/shared/models/site/Site';
import { UserService } from 'app/shared/services/user.service';
import { emailExistsValidator } from 'app/shared/validators/email-exists.validator';
import { noOverlappingSchedulesValidator } from 'app/shared/validators/no-overlapping-schedules.validator';
import { isAgencyPacnaProgram } from 'app/shared/const';

type PacnaAssignmentMode = 'center' | 'home' | 'mixed' | 'unknown';
type StaffAssignmentType = 'center' | 'home';

interface StaffAssignmentOption {
  id: number;
  schoolId: number;
  siteId?: number | null;
  assignmentType: StaffAssignmentType;
  displayName: string;
  displayCode?: string | null;
  valueKey: string;
}

@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
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
  ],
})
export class AddEmployeeComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers {
  // -----------------------------------------------------------------------------------------------------
  // @ Subject de desuscripción
  // -----------------------------------------------------------------------------------------------------
  private _unsubscribeAll = new Subject<any>();

  // -----------------------------------------------------------------------------------------------------
  // @ Inyecciones privadas
  // -----------------------------------------------------------------------------------------------------
  private _activatedRoute = inject(ActivatedRoute);
  private _authService = inject(AuthService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _customRouterService = inject(CustomRouterService);
  private _formBuilder = inject(UntypedFormBuilder);
  private _notificationService = inject(NotificationService);
  private _staffService = inject(StaffService);
  private _translocoService = inject(TranslocoService);
  private _userService = inject(UserService);

  // -----------------------------------------------------------------------------------------------------
  // @ Variables
  // -----------------------------------------------------------------------------------------------------
  headerConfig: GenericHeaderConfig = {
    title: 'staff.add.title',
    formGroup: this._formBuilder.group({
      // Nombre
      firstName: new FormControl(null),
      // Middle name
      middleName: new FormControl(null),
      // Apellido Paterno
      fatherLastName: new FormControl(null),
      // Apellido Materno
      motherLastName: new FormControl(null),
      // Status
      status: new FormControl(null),
      // Cargo
      position: new FormControl(null),
      // Tipo de Staff (fijo, no visible en el formulario)
      staffType: new FormControl(null, [Validators.required]),
      // Clasificación de Staff
      staffClassification: new FormControl(null, [Validators.required]),
      // Fecha de inicio de contrato
      contractStartDate: new FormControl(null),
      // Fecha de finalización de contrato
      contractEndDate: new FormControl(null),
      // Horario Desde/Hasta (clasificación única)
      scheduleFrom: new FormControl(null),
      scheduleTo: new FormControl(null),
      // Bloque Ambos: administrativo
      administrativePosition: new FormControl(null),
      administrativeContractStartDate: new FormControl(null),
      administrativeContractEndDate: new FormControl(null),
      administrativeScheduleFrom: new FormControl(null),
      administrativeScheduleTo: new FormControl(null),
      // Bloque Ambos: operacional
      operationalPosition: new FormControl(null),
      operationalContractStartDate: new FormControl(null),
      operationalContractEndDate: new FormControl(null),
      operationalScheduleFrom: new FormControl(null),
      operationalScheduleTo: new FormControl(null),
      // Fecha de nacimiento
      birthDate: new FormControl(null),
      // Email - validadores asignados en updateValidations()
      email: new FormControl(null, [Validators.email], [emailExistsValidator(this._userService)]),
      // Comentarios
      comments: new FormControl(null, [Validators.required]),
      // Escuela asignada (opcional; `schoolId` en el alta)
      school: new FormControl(null),
      salaryOrigins: new FormControl([], [Validators.required]),
    }),
    // Cancel button
    cancelButtonShow: true,
    cancelButtonText: 'staff.add.buttons.cancel',
    // Submit button
    submitButtonShow: true,
    submitButtonText: 'staff.add.buttons.save',
    submitDisabled: true, // Inicialmente deshabilitado hasta que el formulario sea válido
  };

  compareById = compareById;

  agencyId: number = 0;

  currentLang: string = 'es';

  isLoading: boolean = false;

  listStatus: OptionSelection[] = [];

  listPositions: OptionSelection[] = [];

  listStaffTypes: StaffType[] = [];

  listStaffClassifications: StaffClassification[] = [];

  /** Escuelas de la agencia (resolver `get-schools-by-agency`) para asignación opcional al crear empleado. */
  listSchools: School[] = [];
  /** Sitios de la agencia para construir opciones de hogares PACNA. */
  listSites: Site[] = [];
  /** Opciones finales a mostrar en el selector de asignación. */
  assignmentOptions: StaffAssignmentOption[] = [];
  /** Opciones de centros. */
  centerAssignmentOptions: StaffAssignmentOption[] = [];
  /** Opciones de hogares. */
  homeAssignmentOptions: StaffAssignmentOption[] = [];

  /** PACNA: en UI se usa la nomenclatura «Centro» en lugar de «Escuela». */
  useCenterLabelsForSchoolAssignment = false;
  /** PACNA: para agencias de solo hogares se usa la nomenclatura «Hogar». */
  useHomeLabelsForSchoolAssignment = false;
  /** PACNA: para agencias mixtas se muestran Centros y Hogares. */
  useMixedLabelsForSchoolAssignment = false;

  listAdministrativePositions: OptionSelection[] = [];

  listOperationalPositions: OptionSelection[] = [];

  listSalaryOrigins: OptionSelection[] = [];

  selectedClassification: StaffClassification | null = null;

  /** Opciones de hora cada 30 min para Desde/Hasta (como en sitios). */
  timeOptions: TimeOption[] = [];

  /** Tipo de staff fijo (siempre empleado). */
  private employeeStaffType: StaffType | null = null;
  private _agencyData: any = null;

  /** Evita mostrar el aviso de solapamiento de horarios más de una vez por sesión de error. */
  private _schedulesOverlapWarningShown = false;

  // -----------------------------------------------------------------------------------------------------
  // @ Getters
  // -----------------------------------------------------------------------------------------------------
  /** Indica si la clasificación seleccionada es "Ambos" (id 3). */
  get isClassificationBoth(): boolean {
    return this.selectedClassification?.id === 3;
  }

  /** Etiqueta traducida del campo de comentarios para empleados. */
  get commentsLabel(): string {
    return this._translocoService.translate('staff.add.comments.employee.label');
  }

  /** Clave i18n del título de la sección de asignación. */
  get assignmentTitleKey(): string {
    if (this.useMixedLabelsForSchoolAssignment) {
      return 'staff.add.mixed-assignment';
    }
    if (this.useHomeLabelsForSchoolAssignment) {
      return 'staff.add.home-assignment';
    }
    if (this.useCenterLabelsForSchoolAssignment) {
      return 'staff.add.center-assignment';
    }
    return 'staff.add.school-assignment';
  }

  /** Clave i18n de la descripción de la sección de asignación. */
  get assignmentDescriptionKey(): string {
    if (this.useMixedLabelsForSchoolAssignment) {
      return 'staff.add.mixed-assignment-description';
    }
    if (this.useHomeLabelsForSchoolAssignment) {
      return 'staff.add.home-assignment-description';
    }
    if (this.useCenterLabelsForSchoolAssignment) {
      return 'staff.add.center-assignment-description';
    }
    return 'staff.add.school-assignment-description';
  }

  /** Clave i18n para el label del selector de asignación. */
  get assignmentPickerLabelKey(): string {
    if (this.useMixedLabelsForSchoolAssignment) {
      return 'staff.add.mixedPicker.label';
    }
    if (this.useHomeLabelsForSchoolAssignment) {
      return 'staff.add.homePicker.label';
    }
    if (this.useCenterLabelsForSchoolAssignment) {
      return 'staff.add.centerPicker.label';
    }
    return 'staff.add.schoolPicker.label';
  }

  /** Clave i18n para placeholder del selector de asignación. */
  get assignmentPickerPlaceholderKey(): string {
    if (this.useMixedLabelsForSchoolAssignment) {
      return 'staff.add.mixedPicker.placeholder';
    }
    if (this.useHomeLabelsForSchoolAssignment) {
      return 'staff.add.homePicker.placeholder';
    }
    if (this.useCenterLabelsForSchoolAssignment) {
      return 'staff.add.centerPicker.placeholder';
    }
    return 'staff.add.schoolPicker.placeholder';
  }

  /** Clave i18n para hint de lista vacía del selector de asignación. */
  get assignmentPickerEmptyListKey(): string {
    if (this.useMixedLabelsForSchoolAssignment) {
      return 'staff.add.mixedPicker.emptyList';
    }
    if (this.useHomeLabelsForSchoolAssignment) {
      return 'staff.add.homePicker.emptyList';
    }
    if (this.useCenterLabelsForSchoolAssignment) {
      return 'staff.add.centerPicker.emptyList';
    }
    return 'staff.add.schoolPicker.emptyList';
  }

  /** Clave i18n para hint informativo del selector de asignación. */
  get assignmentPickerHintKey(): string {
    if (this.useMixedLabelsForSchoolAssignment) {
      return 'staff.add.mixedPicker.hint';
    }
    if (this.useHomeLabelsForSchoolAssignment) {
      return 'staff.add.homePicker.hint';
    }
    if (this.useCenterLabelsForSchoolAssignment) {
      return 'staff.add.centerPicker.hint';
    }
    return 'staff.add.schoolPicker.hint';
  }

  /** Indica si se deben agrupar opciones en centros/hogares. */
  get shouldShowAssignmentGroups(): boolean {
    return this.useMixedLabelsForSchoolAssignment
      && this.centerAssignmentOptions.length > 0
      && this.homeAssignmentOptions.length > 0;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ ngOnInit / ngOnDestroy
  // -----------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.timeOptions = generateTimeOptions();

    this._agencyData = this._resolveAgencyFromRouteData();

    // Obtener Agencia desde local storage desde AuthService
    this.agencyId = this._authService.getAgencyId();

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
      // Poblar listas separadas
      this.listAdministrativePositions = resolvedData.options.filter((option: OptionSelection) => option.optionKey === 'administrativePosition');
      this.listOperationalPositions = resolvedData.options.filter((option: OptionSelection) => option.optionKey === 'operationalPosition');
      this.listSalaryOrigins = resolvedData.options.filter((option: OptionSelection) => option.optionKey === 'salaryOrigin');

      // Cargar datos desde el resolver
      this.listStaffTypes = resolvedData.staffTypes;
      this.listStaffClassifications = resolvedData.staffClassifications;
      // Escuelas de la agencia (paginado amplio en el resolver)
      const schoolsPayload = resolvedData.schools;
      const rawSchools: School[] = Array.isArray(schoolsPayload)
        ? schoolsPayload
        : schoolsPayload?.data ?? [];
      this.listSchools = rawSchools.filter((s) => s.isActive !== false);

      const sitesPayload = resolvedData.sites;
      const rawSites: Site[] = Array.isArray(sitesPayload)
        ? sitesPayload
        : sitesPayload?.data ?? [];
      this.listSites = rawSites.filter((s) => s.isActive !== false);

      this._configureAssignmentOptions(resolvedData.options ?? []);

      // Asignar tipo de staff "Empleado" (ID: 1) - este componente es únicamente para empleados
      this.employeeStaffType = this.listStaffTypes.find(staffType => staffType.id === 1);

      if (this.employeeStaffType) {
        this.headerConfig.formGroup.patchValue({
          staffType: this.employeeStaffType
        });

        // Actualizar validaciones
        this.updateValidations();
      }

      this._changeDetectorRef.detectChanges();
    }

    // Suscribirse a cambios en la clasificación
    this.headerConfig.formGroup.get('staffClassification')?.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((classification: StaffClassification) => {
      this.onClassificationChange(classification);
    });

    // Suscribirse a cambios en la fecha de nacimiento para limpiar errores de validación
    this.headerConfig.formGroup.get('birthDate')?.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((birthDate: any) => {
      this.onBirthDateChange(birthDate);
    });

    // Actualizar estado del botón guardar según validez del formulario
    this.headerConfig.formGroup.statusChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
      this.headerConfig.submitDisabled = this.headerConfig.formGroup!.invalid;
      const hasOverlap = this.headerConfig.formGroup.hasError('schedulesOverlap');
      if (hasOverlap && !this._schedulesOverlapWarningShown) {
        this._schedulesOverlapWarningShown = true;
        this._notificationService.showWarningDialog('staff.add.schedulesOverlap');
      }
      if (!hasOverlap) {
        this._schedulesOverlapWarningShown = false;
      }
    });
    this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;

    // Deshabilitar por defecto todos los campos dependientes de la clasificación (se habilitan al elegir clasificación)
    const contractStartDateControl = this.headerConfig.formGroup.get('contractStartDate');
    const contractEndDateControl = this.headerConfig.formGroup.get('contractEndDate');
    const scheduleFromControl = this.headerConfig.formGroup.get('scheduleFrom');
    const scheduleToControl = this.headerConfig.formGroup.get('scheduleTo');
    contractStartDateControl?.disable({ emitEvent: false });
    contractEndDateControl?.disable({ emitEvent: false });
    scheduleFromControl?.disable({ emitEvent: false });
    scheduleToControl?.disable({ emitEvent: false });
    this.headerConfig.formGroup.get('middleName')?.disable({ emitEvent: false });
    this.headerConfig.formGroup.get('motherLastName')?.disable({ emitEvent: false });
    this.headerConfig.formGroup.get('salaryOrigins')?.disable({ emitEvent: false });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Funciones On (componentes genéricos)
  // -----------------------------------------------------------------------------------------------------
  /** Envía el formulario y crea el empleado vía API. */
  onSubmit(): void {
    if (this.isLoading) return;
    // Validar formulario
    if (this.headerConfig.formGroup.invalid) {
      logFormValidationErrors(this.headerConfig.formGroup, 'Formulario de Personal');
      this._notificationService.showErrorDialog(this._translocoService.translate('staff.add.error.incompleteFields'));
      this.headerConfig.formGroup.markAllAsTouched();
      return;
    }

    // Usar getRawValue() para incluir controles que pueden haber estado deshabilitados (contractStartDate/contractEndDate)
    const formValues = this.headerConfig.formGroup.getRawValue();

    // Fechas en formato ISO (YYYY-MM-DD) para que el backend .NET las deserialice correctamente
    const birthDate: string | null = toIsoDateString(formValues.birthDate) ?? null;
    const contractStartDate: string | null = toIsoDateString(formValues.contractStartDate) ?? null;
    const contractEndDate: string | null = toIsoDateString(formValues.contractEndDate) ?? null;

    // Status - establecer por defecto a 1 (Activo)
    const statusId: number = formValues.status?.id || 1;

    // Cargo
    const positionId: number = formValues.position?.id || 0;

    // Tipo de Staff
    const staffTypeId: number = this.employeeStaffType?.id || 0;

    // Clasificación de Staff
    const staffClassificationId: number = formValues.staffClassification?.id || 0;

    // Comentarios
    const comments: string = formValues.comments || '';

    // Email
    const email: string = formValues.email || '';

    // Nombre
    const firstName: string = formValues.firstName || '';

    // Middle name
    const middleName: string = formValues.middleName || '';

    // Apellido Paterno
    const fatherLastName: string = formValues.fatherLastName || '';

    // Apellido Materno
    const motherLastName: string = formValues.motherLastName || '';

    // Escuela asignada (opcional)
    const schoolId: number | null = formValues.school?.schoolId ?? formValues.school?.id ?? null;
    const siteId: number | null = formValues.school?.siteId ?? null;
    const isPrimary: boolean = false;

    // Loading
    this.isLoading = true;

    // Validación: clasificación es requerida para empleados
    if (!staffClassificationId) {
      this._notificationService.showErrorDialog(this._translocoService.translate('staff.add.error.classificationRequired'));
      this.isLoading = false;
      return;
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
          contractStartDate: toIsoDateString(formValues.administrativeContractStartDate) ?? null,
          contractEndDate: toIsoDateString(formValues.administrativeContractEndDate) ?? null,
          scheduleFrom: formValues.administrativeScheduleFrom || null,
          scheduleTo: formValues.administrativeScheduleTo || null,
        },
        {
          staffClassificationId: 2,
          positionId: formValues.operationalPosition?.id ?? 0,
          contractStartDate: toIsoDateString(formValues.operationalContractStartDate) ?? null,
          contractEndDate: toIsoDateString(formValues.operationalContractEndDate) ?? null,
          scheduleFrom: formValues.operationalScheduleFrom || null,
          scheduleTo: formValues.operationalScheduleTo || null,
        },
      ];
      effectivePositionId = formValues.administrativePosition?.id ?? 0;
      effectiveContractStart = toIsoDateString(formValues.administrativeContractStartDate) ?? null;
      effectiveContractEnd = toIsoDateString(formValues.administrativeContractEndDate) ?? null;
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
      statusId: statusId,
      positionId: effectivePositionId,
      staffTypeId: staffTypeId,
      staffClassificationId: staffClassificationId,
      contractStartDate: effectiveContractStart,
      contractEndDate: effectiveContractEnd,
      comments: comments,
      isActive: true,
      agencyId: this.agencyId,
      firstName: firstName,
      middleName: middleName,
      fatherLastName: fatherLastName,
      motherLastName: motherLastName,
      schoolId: schoolId,
      siteId: siteId,
      isPrimary: isPrimary,
      birthDate: birthDate,
      email: email,
      salaryOrigins: formValues.salaryOrigins ?? [],
      classificationContracts,
    };

    // Disable the form
    this.headerConfig.formGroup.disable();

    // Crear staff
    let isSuccess = false;

    this._staffService.insertStaff(staffRequest, {}).subscribe({
      next: (response) => {
        switch (response.body) {
          case true:
            isSuccess = true;
            this.clearValidationErrors();
            this.showSuccessMessage();
            break;
          default:
            this._notificationService.showErrorDialog(this._translocoService.translate('staff.add.error.general'));
            this.headerConfig.formGroup.enable();
            break;
        }
      },
      error: () => {
        this._notificationService.showErrorDialog(this._translocoService.translate('staff.add.error.general'));
        this.headerConfig.formGroup.enable();
      },
      complete: () => {
        this.isLoading = false;
        if (!isSuccess) {
          this.headerConfig.formGroup.enable();
        }
      },
    });
  }

  /** Navega a la lista de empleados sin guardar. */
  onCancel(): void {
    this._customRouterService.navigate(['staff/employees']);
  }

  /** Reacciona al cambio de clasificación: sincroniza campos, listas de cargo y validadores. */
  onClassificationChange(classification: StaffClassification): void {
    const previousClassification = this.selectedClassification;
    // Evitar reprocesar si el valor no cambió
    if (previousClassification?.id === classification?.id) {
      return;
    }
    this.selectedClassification = classification;

    // Cargar posiciones según la clasificación
    this.loadPositionsByClassification();

    // Transferir valores entre campos cuando cambias de clasificación
    if (previousClassification?.id === 3 && classification?.id === 1) {
      // De AMBOS a ADMINISTRATIVO
      this.headerConfig.formGroup.patchValue({
        position: this.headerConfig.formGroup.get('administrativePosition')?.value,
        contractStartDate: this.headerConfig.formGroup.get('administrativeContractStartDate')?.value,
        contractEndDate: this.headerConfig.formGroup.get('administrativeContractEndDate')?.value,
        scheduleFrom: this.headerConfig.formGroup.get('administrativeScheduleFrom')?.value,
        scheduleTo: this.headerConfig.formGroup.get('administrativeScheduleTo')?.value,
      });
    } else if (previousClassification?.id === 3 && classification?.id === 2) {
      // De AMBOS a OPERACIONAL
      this.headerConfig.formGroup.patchValue({
        position: this.headerConfig.formGroup.get('operationalPosition')?.value,
        contractStartDate: this.headerConfig.formGroup.get('operationalContractStartDate')?.value,
        contractEndDate: this.headerConfig.formGroup.get('operationalContractEndDate')?.value,
        scheduleFrom: this.headerConfig.formGroup.get('operationalScheduleFrom')?.value,
        scheduleTo: this.headerConfig.formGroup.get('operationalScheduleTo')?.value,
      });
    } else if (previousClassification?.id === 1 && classification?.id === 3) {
      // De ADMINISTRATIVO a AMBOS
      this.headerConfig.formGroup.patchValue({
        administrativePosition: this.headerConfig.formGroup.get('position')?.value,
        administrativeContractStartDate: this.headerConfig.formGroup.get('contractStartDate')?.value,
        administrativeContractEndDate: this.headerConfig.formGroup.get('contractEndDate')?.value,
        administrativeScheduleFrom: this.headerConfig.formGroup.get('scheduleFrom')?.value,
        administrativeScheduleTo: this.headerConfig.formGroup.get('scheduleTo')?.value,
      });
    } else if (previousClassification?.id === 2 && classification?.id === 3) {
      // De OPERACIONAL a AMBOS
      this.headerConfig.formGroup.patchValue({
        operationalPosition: this.headerConfig.formGroup.get('position')?.value,
        operationalContractStartDate: this.headerConfig.formGroup.get('contractStartDate')?.value,
        operationalContractEndDate: this.headerConfig.formGroup.get('contractEndDate')?.value,
        operationalScheduleFrom: this.headerConfig.formGroup.get('scheduleFrom')?.value,
        operationalScheduleTo: this.headerConfig.formGroup.get('scheduleTo')?.value,
      });
    }

    // Actualizar validaciones y habilitar/deshabilitar campos según la clasificación
    // Usar setTimeout para evitar stack overflow con updateValueAndValidity
    setTimeout(() => {
      this.updateValidations();
      this._changeDetectorRef.detectChanges();
    }, 0);
  }

  /** Limpia el estado de error del control de fecha de nacimiento al cambiar el valor. */
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

  // -----------------------------------------------------------------------------------------------------
  // @ Otras funciones públicas
  // -----------------------------------------------------------------------------------------------------
  /** Devuelve las opciones de hora "Hasta" filtradas según el valor de "Desde" del campo indicado. */
  getScheduleToOptions(fromFieldName: string): TimeOption[] {
    const fromControl = this.headerConfig.formGroup.get(fromFieldName);
    if (!fromControl) return this.timeOptions;
    return getEndTimeOptions(this.timeOptions, fromControl.value, '23:59');
  }

  /** Aplica validadores y habilita o deshabilita controles según la clasificación de empleado. */
  updateValidations(): void {
    const staffClassificationControl = this.headerConfig.formGroup.get('staffClassification');
    const birthDateControl = this.headerConfig.formGroup.get('birthDate');
    const firstNameControl = this.headerConfig.formGroup.get('firstName');
    const middleNameControl = this.headerConfig.formGroup.get('middleName');
    const fatherLastNameControl = this.headerConfig.formGroup.get('fatherLastName');
    const motherLastNameControl = this.headerConfig.formGroup.get('motherLastName');
    const positionControl = this.headerConfig.formGroup.get('position');
    const emailControl = this.headerConfig.formGroup.get('email');
    const contractStartDateControl = this.headerConfig.formGroup.get('contractStartDate');
    const contractEndDateControl = this.headerConfig.formGroup.get('contractEndDate');
    const scheduleFromControl = this.headerConfig.formGroup.get('scheduleFrom');
    const scheduleToControl = this.headerConfig.formGroup.get('scheduleTo');
    const commentsControl = this.headerConfig.formGroup.get('comments');
    const schoolControl = this.headerConfig.formGroup.get('school');
    const salaryOriginsControl = this.headerConfig.formGroup.get('salaryOrigins');
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

    // Para empleados: clasificación requerida, fecha de nacimiento requerida
    staffClassificationControl?.setValidators([Validators.required]);
    birthDateControl?.setValidators([Validators.required]);
    firstNameControl?.setValidators([Validators.required]);
    fatherLastNameControl?.setValidators([Validators.required]);

    if (this.selectedClassification?.id === 3) {
      // AMBOS: Usar campos administrativo/operacional, desactivar campos únicos
      positionControl?.clearValidators();
      contractStartDateControl?.clearValidators();
      contractEndDateControl?.clearValidators();
      scheduleFromControl?.clearValidators();
      scheduleToControl?.clearValidators();
      contractStartDateControl?.disable({ emitEvent: false });
      contractEndDateControl?.disable({ emitEvent: false });
      scheduleFromControl?.disable({ emitEvent: false });
      scheduleToControl?.disable({ emitEvent: false });

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
      // Individual (Administrativo o Operacional): Usar campos únicos, desactivar admin/operacional
      positionControl?.setValidators([Validators.required]);
      contractStartDateControl?.setValidators([Validators.required]);
      contractEndDateControl?.setValidators([Validators.required]);
      scheduleFromControl?.setValidators([Validators.required]);
      scheduleToControl?.setValidators([Validators.required]);
      contractStartDateControl?.enable({ emitEvent: false });
      contractEndDateControl?.enable({ emitEvent: false });
      scheduleFromControl?.enable({ emitEvent: false });
      scheduleToControl?.enable({ emitEvent: false });

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

    emailControl?.setValidators([Validators.required, Validators.email]);
    emailControl?.setAsyncValidators([emailExistsValidator(this._userService)]);

    staffClassificationControl?.updateValueAndValidity();
    birthDateControl?.updateValueAndValidity();
    firstNameControl?.updateValueAndValidity();
    fatherLastNameControl?.updateValueAndValidity();
    positionControl?.updateValueAndValidity();
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
    emailControl?.updateValueAndValidity();
    this.headerConfig.formGroup.updateValueAndValidity();

    // El campo de clasificación SIEMPRE debe estar habilitado
    staffClassificationControl?.enable({ emitEvent: false });

    // Habilitar/deshabilitar campos globales (dependientes de la clasificación)
    const globalControls = [
      firstNameControl, fatherLastNameControl, birthDateControl, emailControl,
      middleNameControl, motherLastNameControl, schoolControl, salaryOriginsControl
    ];

    if (!this.selectedClassification) {
      globalControls.forEach(ctrl => ctrl?.disable({ emitEvent: false }));
      commentsControl?.disable({ emitEvent: false });
    } else {
      globalControls.forEach(ctrl => ctrl?.enable({ emitEvent: false }));
      commentsControl?.enable({ emitEvent: false }); // Comentarios siempre habilitado y requerido
    }

    this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;
    this._changeDetectorRef.detectChanges();
  }

  /** Rellena `listPositions` según la clasificación actual (administrativo, operacional o ambos). */
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
      this.listPositions = []; // Ambos: cada bloque usa su lista
    }
    this._changeDetectorRef.detectChanges();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Funciones privadas
  // -----------------------------------------------------------------------------------------------------
  /** Compara opciones de asignación por clave estable (tipo + id). */
  compareAssignmentOptions = (a: StaffAssignmentOption | null, b: StaffAssignmentOption | null): boolean => {
    if (!a && !b) {
      return true;
    }
    return a?.valueKey === b?.valueKey;
  };

  /** Configura opciones y etiquetas de asignación según el modo PACNA de la agencia. */
  private _configureAssignmentOptions(options: OptionSelection[]): void {
    const isPacnaAgency = this._isPacnaAgency();

    this.centerAssignmentOptions = this._buildCenterAssignmentOptions();
    const isDayCareHomeOptions = options.filter((option) => option.optionKey === 'isDayCareHome');
    const homeOptionId = isDayCareHomeOptions.find((option) => option.booleanValue === true)?.id ?? null;
    this.homeAssignmentOptions = this._buildHomeAssignmentOptions(homeOptionId);

    if (!isPacnaAgency) {
      this.useCenterLabelsForSchoolAssignment = false;
      this.useHomeLabelsForSchoolAssignment = false;
      this.useMixedLabelsForSchoolAssignment = false;
      this.assignmentOptions = [...this.centerAssignmentOptions];
      return;
    }

    const mode = this._resolvePacnaAssignmentMode();
    if (mode === 'center') {
      this.useCenterLabelsForSchoolAssignment = true;
      this.useHomeLabelsForSchoolAssignment = false;
      this.useMixedLabelsForSchoolAssignment = false;
      this.assignmentOptions = [...this.centerAssignmentOptions];
      return;
    }

    if (mode === 'home') {
      this.useCenterLabelsForSchoolAssignment = false;
      this.useHomeLabelsForSchoolAssignment = true;
      this.useMixedLabelsForSchoolAssignment = false;
      this.assignmentOptions = [...this.homeAssignmentOptions];
      return;
    }

    const hasCenters = this.centerAssignmentOptions.length > 0;
    const hasHomes = this.homeAssignmentOptions.length > 0;

    this.useCenterLabelsForSchoolAssignment = hasCenters && !hasHomes;
    this.useHomeLabelsForSchoolAssignment = hasHomes && !hasCenters;
    this.useMixedLabelsForSchoolAssignment = hasCenters && hasHomes;
    this.assignmentOptions = hasCenters && hasHomes
      ? [...this.centerAssignmentOptions, ...this.homeAssignmentOptions]
      : hasHomes
        ? [...this.homeAssignmentOptions]
        : [...this.centerAssignmentOptions];

  }

  /** Construye opciones de centros a partir de escuelas activas. */
  private _buildCenterAssignmentOptions(): StaffAssignmentOption[] {
    return this.listSchools.map((school) => ({
      id: school.id,
      schoolId: school.id,
      siteId: null,
      assignmentType: 'center',
      displayName: school.name,
      displayCode: school.schoolCode,
      valueKey: `center-${school.id}`,
    }));
  }

  /** Construye opciones de hogares desde sitios activos con schoolId asociado. */
  private _buildHomeAssignmentOptions(homeOptionId: number | null): StaffAssignmentOption[] {
    return this.listSites
      .filter((site) => this._isHomeSite(site, homeOptionId))
      .map((site) => {
        const schoolId = this._readSiteSchoolId(site);
        if (!schoolId) {
          return null;
        }

        return {
          id: site.id ?? schoolId,
          schoolId,
          siteId: site.id ?? null,
          assignmentType: 'home',
          displayName: site.name ?? '',
          displayCode: site.siteCode ?? null,
          valueKey: `home-${site.id ?? schoolId}`,
        } as StaffAssignmentOption;
      })
      .filter((option): option is StaffAssignmentOption => option !== null);
  }

  /** Determina si un sitio corresponde a Hogar PACNA. */
  private _isHomeSite(site: Site, homeOptionId: number | null): boolean {
    if (site.isDayCareHome?.booleanValue === true) {
      return true;
    }
    if (site.isDayCareHome?.booleanValue === false) {
      return false;
    }
    if (homeOptionId != null && site.isDayCareHomeId != null) {
      return site.isDayCareHomeId === homeOptionId;
    }
    // Fallback defensivo: si el API no trae discriminador, en PACNA se considera sitio de hogar
    // para no dejar el selector vacío en agencias con Hogares o Ambos.
    return true;
  }

  /** Obtiene schoolId asociado al sitio (si existe). */
  private _readSiteSchoolId(site: Site): number | null {
    const siteWithSchoolId = site as Site & { schoolId?: number | null };
    return site.school?.id ?? siteWithSchoolId.schoolId ?? null;
  }

  /** Resuelve modo de asignación PACNA leyendo la inscripción de la agencia en sesión. */
  private _resolvePacnaAssignmentMode(): PacnaAssignmentMode {
    const inscriptionOption = this._agencyData?.inscription?.isDayCareHome;
    if (inscriptionOption) {
      if (inscriptionOption.booleanValue === true) {
        return 'home';
      }
      if (inscriptionOption.booleanValue === false) {
        return 'center';
      }
      return 'mixed';
    }

    const isDayCareHomeRaw = localStorage.getItem('agencyIsDayCareHome');
    if (isDayCareHomeRaw === 'true') {
      return 'home';
    }
    if (isDayCareHomeRaw === 'false') {
      return 'center';
    }
    if (isDayCareHomeRaw === 'null') {
      return 'mixed';
    }

    try {
      const agencyRaw = localStorage.getItem('agency');
      if (!agencyRaw) {
        return 'unknown';
      }

      const agency = JSON.parse(agencyRaw);
      const isDayCareHomeOption = agency?.inscription?.isDayCareHome;
      if (!isDayCareHomeOption) {
        return 'unknown';
      }

      if (isDayCareHomeOption.booleanValue === true) {
        return 'home';
      }

      if (isDayCareHomeOption.booleanValue === false) {
        return 'center';
      }

      return 'mixed';
    } catch {
      return 'unknown';
    }
  }

  /** Busca la agencia resuelta en la cadena de rutas (current -> parent -> root). */
  private _resolveAgencyFromRouteData(): any | null {
    let currentSnapshot = this._activatedRoute.snapshot;
    while (currentSnapshot) {
      const agency = currentSnapshot.data?.['initialData']?.agency;
      if (agency) {
        return agency;
      }
      currentSnapshot = currentSnapshot.parent as any;
    }
    return null;
  }

  /** Determina si la agencia actual incluye PACNA. */
  private _isPacnaAgency(): boolean {
    const agencyPrograms = this._agencyData?.programs;
    if (Array.isArray(agencyPrograms) && agencyPrograms.some((program: { id?: number }) => program?.id === 3)) {
      return true;
    }
    return isAgencyPacnaProgram();
  }

  /** Muestra el diálogo de éxito y navega a la lista de empleados si el usuario confirma. */
  private showSuccessMessage(): void {
    this._notificationService.showSuccessDialogWithCallback(
      'staff.add.success.employee',
      (result) => {
        if (result === 'confirmed') {
          this._customRouterService.navigate(['staff/employees']);
        }
      }
    );
  }

  /** Marca todos los controles como no tocados y prístinos sin alterar valores. */
  private clearValidationErrors(): void {
    Object.keys(this.headerConfig.formGroup.controls).forEach(key => {
      const control = this.headerConfig.formGroup.get(key);
      if (control) {
        control.markAsUntouched();
        control.markAsPristine();
      }
    });
  }
}
