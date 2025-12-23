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
import { OptionSelection } from 'app/shared/models/OptionSelection';
import { compareById, isNullOrUndefinedEmptyStringNullArray, minimumAgeValidator, logFormValidationErrors } from 'app/shared/utils';
import { AuthService } from 'app/core/auth/auth.service';
import { provideNativeDateAdapter } from '@angular/material/core';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { StaffTypeService } from 'app/shared/services/staff-type.service';
import { StaffType } from 'app/shared/models/StaffType';
import { Staff } from 'app/shared/models/Staff';
import { StaffClassificationService } from 'app/shared/services/staff-classification.service';
import { StaffClassification } from 'app/shared/models/StaffClassification';
import { StaffStatusModalComponent, StaffStatusModalData } from '../staff-status-modal/staff-status-modal.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FieldVisibilityService } from '../../../../shared/services/field-visibility.service';
import { SiteService } from 'app/shared/services/site.service';
import { SiteStaffService } from 'app/shared/services/site-staff.service';
import { Site } from 'app/shared/models/Site';
import { UserService } from 'app/shared/services/user.service';
import { emailExistsValidator } from 'app/shared/validators/email-exists.validator';

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
  private _staffTypeService = inject(StaffTypeService);
  private _staffClassificationService = inject(StaffClassificationService);
  private _matDialog = inject(MatDialog);
  public fieldVisibilityService = inject(FieldVisibilityService);
  private _siteService = inject(SiteService);
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
  // Lista de Sitios - COMENTADO: Ya no es necesario para empleados
  // listSites: Site[] = [];
  // Resultado de revisión / Review result
  reviewResult: OptionSelection[] = [];

  // Lista completa de opciones de selección
  listAdministrativePositions: OptionSelection[] = [];
  listOperationalPositions: OptionSelection[] = [];

  // Propiedades específicas de empleados
  selectedClassification: StaffClassification | null = null;

  // Propiedad para controlar si mostrar campos de revisión (solo para administradores)
  canViewReviewFields: boolean = false;

  // ViewChild para el contenedor del formulario
  @ViewChild('formContainer', { static: false }) formContainer!: ElementRef;

  // Tipo de staff actual para control de visibilidad de campos
  currentStaffType: string = 'employee';

  // Lista completa de opciones de selección
  allOptionSelections: OptionSelection[] = [];

  // Parámetro del staff
  param: Staff | null = null;

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
      contractStartDate: new FormControl(''),
      // Contract end date
      contractEndDate: new FormControl(''),
      // Birth date
      birthDate: new FormControl('', [Validators.required]),
      // Email
      email: new FormControl('', [Validators.required, Validators.email], [emailExistsValidator(this._userService)]),
      // Comments
      comments: new FormControl(''),
      // Sitio asignado - COMENTADO: Ya no es necesario para empleados
      // site: new FormControl(null),
      // isPrimary: new FormControl(false),
      // Review result
      reviewResult: new FormControl(''),
      // Review date
      reviewDate: new FormControl(''),
      // Review justification
      reviewJustification: new FormControl(''),
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
  compareById = compareById;

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
    this.checkAdminPermissions();

    // Transloco
    this._translocoService.langChanges$.pipe(takeUntil(this._unsubscribeAll)).subscribe((lang: string) => {
      this.currentLang = lang;
    });

    // Obtener datos del resolver
    const resolvedData = this._activatedRoute.snapshot.data['data'];
    if (resolvedData) {
      // Cargar opciones desde el resolver
      this.allOptionSelections = resolvedData.options.data;
      // Status
      this.listStatus = this.allOptionSelections.filter((option: OptionSelection) => option.optionKey === 'isActive');
      // Posiciones administrativas y operacionales
      this.listAdministrativePositions = this.allOptionSelections.filter((option: OptionSelection) => option.optionKey === 'administrativePosition');
      this.listOperationalPositions = this.allOptionSelections.filter((option: OptionSelection) => option.optionKey === 'operationalPosition');
      // Review result
      this.reviewResult = this.allOptionSelections.filter((option: OptionSelection) => option.optionKey === 'reviewResult');

      // Cargar datos desde el resolver
      this.listStaffTypes = resolvedData.staffTypes;
      this.listStaffClassifications = resolvedData.staffClassifications;

      // Cargar staff desde el resolver
      this.param = resolvedData.staff;
      this.onSetForm(resolvedData.staff);
    }

    // Sites - Cargar desde el resolver - COMENTADO: Ya no es necesario para empleados
    // const resolvedData = this._activatedRoute.snapshot.data['data'];
    // if (resolvedData && resolvedData.sites) {
    //   this.listSites = resolvedData.sites;
    // }

    // Suscribirse a cambios en la clasificación
    this.headerConfig.formGroup
      .get('staffClassification')
      ?.valueChanges.pipe(takeUntil(this._unsubscribeAll))
      .subscribe((classification: StaffClassification) => {
        this.onClassificationChange(classification);
      });

    // Suscribirse a cambios de validación del formulario para actualizar el estado del botón de guardar
    this.headerConfig.formGroup.statusChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;
        this._changeDetectorRef.detectChanges();
      });

    // Suscribirse a cambios en los valores del formulario para actualizar el botón dinámicamente
    this.headerConfig.formGroup.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;
      });

    // Establecer el estado inicial del botón
    this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;

    // Única llamada a detectChanges al final de ngOnInit
    this._changeDetectorRef.detectChanges();

    // Reset completo de scroll
    this.resetAllScrolls();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onSetForm(param: Staff): void {
    this.param = param;

    // Para empleados, las posiciones se cargarán según la clasificación
    this.listPositions = [];

    // Buscar los objetos correctos de las listas usando los IDs
    const staffClassification = param.staffClassification?.id
      ? this.listStaffClassifications.find(sc => sc.id === param.staffClassification.id)
      : param.staffClassification;

    const status = param.status?.id
      ? this.listStatus.find(s => s.id === param.status.id)
      : param.status;

    // Establecer la clasificación seleccionada ANTES de cargar posiciones y establecer valores
    if (param.staffClassification) {
      this.selectedClassification = param.staffClassification;
      this.loadPositionsByClassification();
    }

    // Buscar position después de cargar las posiciones
    const position = param.position?.id && this.listPositions.length > 0
      ? this.listPositions.find(p => p.id === param.position.id)
      : param.position;

    // Establecer valores del formulario
    this.headerConfig.formGroup.patchValue({
      id: param.id,
      firstName: param.firstName,
      middleName: param.middleName,
      fatherLastName: param.fatherLastName,
      motherLastName: param.motherLastName,
      status: status,
      position: position,
      staffType: param.staffType,
      staffClassification: staffClassification,
      contractStartDate: param.contractStartDate,
      contractEndDate: param.contractEndDate,
      birthDate: param.birthDate,
      email: param.email,
      comments: param.comments,
      reviewDate: param.reviewDate,
      reviewJustification: param.reviewJustification,
    });

    // Actualizar validaciones (después de establecer selectedClassification y valores)
    this.updateValidations();

    // 🔒 DESHABILITAR EL CONTROL staffType DEL FORMULARIO DESPUÉS de establecer el valor
    this.headerConfig.formGroup.get('staffType')?.disable();

    // Actualizar el estado del botón después de establecer valores
    this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;

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

    // Sitio asignado - COMENTADO: Ya no es necesario para empleados
    // const siteId: number = formValues.site?.id || null;
    // const isPrimary: boolean = formValues.isPrimary || false;
    const siteId: number = null; // COMENTADO: Ya no es necesario para empleados
    const isPrimary: boolean = false; // COMENTADO: Ya no es necesario para empleados

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
      this._notificationService.showErrorDialog('El tipo de personal es requerido y no puede ser 0.');
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

    // Crear staff request para empleados
    const staffRequest: any = {
      id: formValues.id,
      statusId: statusId,
      positionId: positionId,
      staffTypeId: staffTypeId,
      staffClassificationId: staffClassificationId,
      comments: comments,
      isActive: true,
      agencyId: this.agencyId,
      firstName: firstName,
      middleName: middleName,
      fatherLastName: fatherLastName,
      motherLastName: motherLastName,
      siteId: siteId,
      isPrimary: isPrimary,
      birthDate: birthDate,
      email: email,
      contractStartDate: contractStartDate,
      contractEndDate: contractEndDate,
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
        isActiveOptions: this.listStatus
      } as StaffStatusModalData,
      disableClose: false,
      width: '600px',
      maxWidth: '90vw',
      panelClass: ['mat-dialog-container', 'dialog-responsive']
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
      isList: false,
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
      }
    });
  }

  /**
   * Maneja el cambio en la clasificación de staff
   */
  onClassificationChange(classification: StaffClassification): void {
    this.selectedClassification = classification;

    // Cargar posiciones según la clasificación
    this.loadPositionsByClassification();

    // Si tiene clasificación, habilitar todos los campos
    if (this.selectedClassification) {
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
    }

    // Actualizar el estado del botón
    this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;

    this._changeDetectorRef.detectChanges();
  }

  /**
   * Actualiza las validaciones para empleados
   */
  updateValidations(): void {
    const staffClassificationControl = this.headerConfig.formGroup.get('staffClassification');
    const birthDateControl = this.headerConfig.formGroup.get('birthDate');
    const firstNameControl = this.headerConfig.formGroup.get('firstName');
    const fatherLastNameControl = this.headerConfig.formGroup.get('fatherLastName');
    const positionControl = this.headerConfig.formGroup.get('position');
    const emailControl = this.headerConfig.formGroup.get('email');

    // Para empleados: clasificación requerida, fecha de nacimiento requerida
    staffClassificationControl?.setValidators([Validators.required]);
    birthDateControl?.setValidators([Validators.required]);
    firstNameControl?.setValidators([Validators.required]);
    fatherLastNameControl?.setValidators([Validators.required]);
    positionControl?.setValidators([Validators.required]);
    emailControl?.setValidators([Validators.required, Validators.email]);
    emailControl?.setAsyncValidators([emailExistsValidator(this._userService)]);

    staffClassificationControl?.updateValueAndValidity();
    birthDateControl?.updateValueAndValidity();
    firstNameControl?.updateValueAndValidity();
    fatherLastNameControl?.updateValueAndValidity();
    positionControl?.updateValueAndValidity();
    emailControl?.updateValueAndValidity();

    // El campo de clasificación SIEMPRE debe estar habilitado
    staffClassificationControl?.enable({ emitEvent: false });

    // Si no hay clasificación seleccionada, deshabilitar campos dependientes
    if (!this.selectedClassification) {
      firstNameControl?.disable({ emitEvent: false });
      fatherLastNameControl?.disable({ emitEvent: false });
      positionControl?.disable({ emitEvent: false });
      birthDateControl?.disable({ emitEvent: false });
      emailControl?.disable({ emitEvent: false });
    } else {
      // Si hay clasificación seleccionada, habilitar todos los campos
      firstNameControl?.enable({ emitEvent: false });
      fatherLastNameControl?.enable({ emitEvent: false });
      positionControl?.enable({ emitEvent: false });
      birthDateControl?.enable({ emitEvent: false });
      emailControl?.enable({ emitEvent: false });
    }

    // Actualizar el estado del botón
    this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;
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
    // ID 1: Administrativo, ID 2: Operacional (verificar en la base de datos si es necesario)
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
      const foundPosition = this.listPositions.find(p => p.id === currentPosition.id);
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

  private checkAdminPermissions(): void {
    const userRole = this._authService.getUserRole();
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
   * Resetea todos los scrolls de la página
   */
  private resetAllScrolls(): void {
    setTimeout(() => {
      window.scrollTo(0, 0);

      if (this.formContainer?.nativeElement) {
        this.formContainer.nativeElement.scrollTop = 0;
      }

      const mainFormContainer = document.querySelector('.overflow-y-auto[cdkScrollable]');
      if (mainFormContainer) {
        mainFormContainer.scrollTop = 0;
      }

      const scrollableElements = document.querySelectorAll('[style*="overflow"], [style*="scroll"], .mat-mdc-dialog-content, .mat-mdc-card-content, .mat-mdc-tab-body-content');

      scrollableElements.forEach((element: any) => {
        if (element.scrollTop !== undefined) {
          element.scrollTop = 0;
        }
        if (element.scrollLeft !== undefined) {
          element.scrollLeft = 0;
        }
      });

      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;

      if (document.body.scrollTop !== 0) {
        document.body.scrollTop = 0;
      }
    }, 300);
  }
}

