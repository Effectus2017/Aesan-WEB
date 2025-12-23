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
import { compareById, isNullOrUndefinedEmptyStringNullArray, minimumAgeValidator, logFormValidationErrors } from 'app/shared/utils';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { StaffTypeService } from 'app/shared/services/staff-type.service';
import { StaffType } from 'app/shared/models/StaffType';
import { StaffClassificationService } from 'app/shared/services/staff-classification.service';
import { StaffClassification } from 'app/shared/models/StaffClassification';
import { ActivatedRoute } from '@angular/router';
import { Site } from 'app/shared/models/Site';

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
  private _formBuilder = inject(UntypedFormBuilder);
  private _staffService = inject(StaffService);
  private _customRouterService = inject(CustomRouterService);
  private _notificationService = inject(NotificationService);
  private _translocoService = inject(TranslocoService);
  private _authService = inject(AuthService);
  private _optionSelectionService = inject(OptionSelectionService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _staffTypeService = inject(StaffTypeService);
  private _staffClassificationService = inject(StaffClassificationService);
  private _activatedRoute = inject(ActivatedRoute);

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

  // Listas separadas para cada tipo de posición
  listAdministrativePositions: OptionSelection[] = [];
  listOperationalPositions: OptionSelection[] = [];

  // Propiedades para controlar la visibilidad de campos
  selectedClassification: StaffClassification | null = null;

  // Lista completa de opciones de selección
  allOptionSelections: OptionSelection[] = [];

  // Tipo de staff fijo (siempre será empleado)
  private employeeStaffType: StaffType | null = null;

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
      // Tipo de Staff (fijo, no visible en el formulario)
      staffType: new FormControl('', [Validators.required]),
      // Clasificación de Staff
      staffClassification: new FormControl('', [Validators.required]),
      // Fecha de inicio de contrato
      contractStartDate: new FormControl(''),
      // Fecha de finalización de contrato
      contractEndDate: new FormControl(''),
      // Fecha de nacimiento
      birthDate: new FormControl('', [Validators.required]),
      // Comentarios
      comments: new FormControl('', [Validators.required]),
      // Sitio asignado - COMENTADO: Ya no es necesario para empleados
      // site: new FormControl('', [Validators.required]),
      // isPrimary: new FormControl(false),
    }),
    // Cancel button
    cancelButtonShow: true,
    cancelButtonText: 'staff.add.buttons.cancel',
    // Submit button
    submitButtonShow: true,
    submitButtonText: 'staff.add.buttons.save',
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
    return this._translocoService.translate('staff.add.comments.employee.label');
  }

  ngOnInit(): void {
    // Obtener Agencia desde local storage desde AuthService
    this.agencyId = this._authService.getAgencyId();

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

        this._changeDetectorRef.detectChanges();
      }
    });

    // Cargar tipos de staff y pre-seleccionar "Empleado"
    this._staffTypeService.staffTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.listStaffTypes = result.body;

        // Pre-seleccionar "Empleado"
        const employeeType = this.listStaffTypes.find(staffType =>
          staffType.name === 'Empleado' || staffType.nameEn === 'Employee'
        );

        if (employeeType) {
          this.employeeStaffType = employeeType;
          this.headerConfig.formGroup.patchValue({
            staffType: employeeType
          });

          // Actualizar validaciones
          this.updateValidations();
        }

        this._changeDetectorRef.detectChanges();
      }
    });

    // Cargar clasificaciones de staff
    this._staffClassificationService.staffClassifications$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.listStaffClassifications = result.body;

        // Actualizar validaciones después de cargar las clasificaciones
        this.updateValidations();

        this._changeDetectorRef.detectChanges();
      }
    });

    // Sites - Cargar desde el resolver - COMENTADO: Ya no es necesario para empleados
    // const resolvedData = this._activatedRoute.snapshot.data['data'];
    // if (resolvedData && resolvedData.sites) {
    //   this.listSites = resolvedData.sites;
    // }

    // Suscribirse a cambios en la clasificación
    this.headerConfig.formGroup.get('staffClassification')?.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((classification: StaffClassification) => {
      this.onClassificationChange(classification);
    });

    // Suscribirse a cambios en la fecha de nacimiento para limpiar errores de validación
    this.headerConfig.formGroup.get('birthDate')?.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((birthDate: any) => {
      this.onBirthDateChange(birthDate);
    });

    // Deshabilitar campos de contrato por defecto (solo se habilitan cuando hay clasificación)
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
    this._notificationService.showSuccessDialogWithCallback(
      this._translocoService.translate('staff.add.success.employee'),
      (result) => {
        if (result === 'confirmed') {
          this._customRouterService.navigate(['staff/employees']);
        }
      }
    );
  }

  onSubmit(): void {
    // Validar formulario
    if (this.headerConfig.formGroup.invalid) {
      logFormValidationErrors(this.headerConfig.formGroup, 'Formulario de Personal');
      this._notificationService.showErrorDialog(this._translocoService.translate('staff.add.error.incompleteFields'));
      this.headerConfig.formGroup.markAllAsTouched();
      return;
    }

    const formValues = this.headerConfig.formGroup.value;

    // Fecha de nacimiento
    const birthDate: string = formValues.birthDate || null;

    // Fecha de inicio de contrato
    const contractStartDate: string | null = formValues.contractStartDate || null;

    // Fecha de finalización de contrato
    const contractEndDate: string | null = formValues.contractEndDate || null;

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

    // Nombre
    const firstName: string = formValues.firstName || '';

    // Middle name
    const middleName: string = formValues.middleName || '';

    // Apellido Paterno
    const fatherLastName: string = formValues.fatherLastName || '';

    // Apellido Materno
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
      this._notificationService.showErrorDialog(this._translocoService.translate('staff.add.error.classificationRequired'));
      this.isLoading = false;
      return;
    }

    // Crear staff request para empleados
    const staffRequest: any = {
      statusId: statusId,
      positionId: positionId,
      staffTypeId: staffTypeId,
      staffClassificationId: staffClassificationId,
      contractStartDate: contractStartDate,
      contractEndDate: contractEndDate,
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
      error: (err) => {
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

  onCancel(): void {
    this._customRouterService.navigate(['staff/employees']);
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
   * Limpia los errores de validación sin cambiar los valores del formulario
   */
  private clearValidationErrors(): void {
    Object.keys(this.headerConfig.formGroup.controls).forEach(key => {
      const control = this.headerConfig.formGroup.get(key);
      if (control) {
        control.markAsUntouched();
        control.markAsPristine();
      }
    });
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

    // Para empleados: clasificación requerida, fecha de nacimiento requerida
    staffClassificationControl?.setValidators([Validators.required]);
    birthDateControl?.setValidators([Validators.required]);
    firstNameControl?.setValidators([Validators.required]);
    fatherLastNameControl?.setValidators([Validators.required]);
    positionControl?.setValidators([Validators.required]);

    staffClassificationControl?.updateValueAndValidity();
    birthDateControl?.updateValueAndValidity();
    firstNameControl?.updateValueAndValidity();
    fatherLastNameControl?.updateValueAndValidity();
    positionControl?.updateValueAndValidity();

    // El campo de clasificación SIEMPRE debe estar habilitado
    staffClassificationControl?.enable({ emitEvent: false });

    // Si no hay clasificación seleccionada, deshabilitar campos dependientes
    if (!this.selectedClassification) {
      firstNameControl?.disable({ emitEvent: false });
      fatherLastNameControl?.disable({ emitEvent: false });
      positionControl?.disable({ emitEvent: false });
      birthDateControl?.disable({ emitEvent: false });
      const contractStartDateControl = this.headerConfig.formGroup.get('contractStartDate');
      const contractEndDateControl = this.headerConfig.formGroup.get('contractEndDate');
      const commentsControl = this.headerConfig.formGroup.get('comments');
      contractStartDateControl?.disable({ emitEvent: false });
      contractEndDateControl?.disable({ emitEvent: false });
      commentsControl?.disable({ emitEvent: false });
    } else {
      // Si hay clasificación seleccionada, habilitar todos los campos
      firstNameControl?.enable({ emitEvent: false });
      fatherLastNameControl?.enable({ emitEvent: false });
      positionControl?.enable({ emitEvent: false });
      birthDateControl?.enable({ emitEvent: false });
      const contractStartDateControl = this.headerConfig.formGroup.get('contractStartDate');
      const contractEndDateControl = this.headerConfig.formGroup.get('contractEndDate');
      const commentsControl = this.headerConfig.formGroup.get('comments');
      contractStartDateControl?.enable({ emitEvent: false });
      contractEndDateControl?.enable({ emitEvent: false });
      commentsControl?.enable({ emitEvent: false });
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

