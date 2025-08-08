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
import { compare, comparePostal, isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
import { GeoService } from 'app/shared/services/geo.service';
import { City } from 'app/shared/models/City';
import { Region } from 'app/shared/models/Region';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { StaffTypeService } from 'app/shared/services/staff-type.service';
import { StaffType } from 'app/shared/models/StaffType';
import { StaffClassificationService } from 'app/shared/services/staff-classification.service';
import { StaffClassification } from 'app/shared/models/StaffClassification';

function minimumAgeValidator(minAge: number): (control: AbstractControl) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const birthDate = new Date(control.value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= minAge ? null : { minimumAge: { requiredAge: minAge, actualAge: age } };
  };
}

@Component({
  selector: 'app-staff-add',
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
      firstName: new FormControl(''),
      // Middle name
      middleName: new FormControl(''),
      // Apellido Paterno
      fatherLastName: new FormControl(''),
      // Apellido Materno
      motherLastName: new FormControl(''),
      // Status
      status: new FormControl('', [Validators.required]),
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
      email: new FormControl('', [Validators.required, Validators.email]),
      // Dirección postal
      postalAddress: new FormControl('', [Validators.required]),
      // Ciudad
      city: new FormControl('', [Validators.required]),
      // Región
      region: new FormControl('', [Validators.required]),
      // Código de área
      areaCode: new FormControl('', [Validators.required]),
      // Comentarios
      comments: new FormControl(''),
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
  compareById = (a: any, b: any) => a && b && a.id === b.id;

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

        // Preseleccionar estado "Activo" por defecto
        const activeStatus = this.listStatus.find(status =>
          status.name === 'Activo' || status.nameEN === 'Active'
        );

        if (activeStatus) {
          this.headerConfig.formGroup.patchValue({
            status: activeStatus
          });
        }
        // Poblar listas separadas
        this.listAdministrativePositions = this.allOptionSelections.filter((option: OptionSelection) => option.optionKey === 'administrativePosition');
        this.listOperationalPositions = this.allOptionSelections.filter((option: OptionSelection) => option.optionKey === 'operationalPosition');
        this.listBoardMemberTitles = this.allOptionSelections.filter((option: OptionSelection) => option.optionKey === 'boardMemberTitle');
        this._changeDetectorRef.detectChanges();
      }
    });

    // Cargar tipos de staff
    this._staffTypeService.staffTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.listStaffTypes = result.body;

        // Preseleccionar "Miembro de la Junta" por defecto
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

        this._changeDetectorRef.detectChanges();
      }
    });

    // Cargar clasificaciones de staff
    this._staffClassificationService.staffClassifications$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.listStaffClassifications = result.body;
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
    const email: string = this.isEmployee ? '' : formValues.email;
    // Dirección postal (solo para no empleados)
    const postalAddress: string = this.isEmployee ? '' : formValues.postalAddress;
    // Código de área (solo para no empleados)
    const areaCode: string = this.isEmployee ? '' : formValues.areaCode;
    // Ciudad (solo para no empleados)
    const cityId: number = this.isEmployee ? 0 : formValues.city.id;
    // Región (solo para no empleados)
    const regionId: number = this.isEmployee ? 0 : formValues.region.id;
    // Fecha de inicio de contrato
    const contractStartDate: string = formValues.contractStartDate;
    // Fecha de finalización de contrato
    const contractEndDate: string = formValues.contractEndDate;

    // Status
    const statusId: number = formValues.status.id;
    // Cargo
    const positionId: number = formValues.position.id;
    // Tipo de Staff
    const staffTypeId: number = formValues.staffType.id;
    // Clasificación de Staff (solo para empleados)
    const staffClassificationId: number = this.isEmployee ? formValues.staffClassification?.id : null;
    // Comentarios
    const comments: string = formValues.comments;
    // Nombre (solo para no empleados)
    const firstName: string = this.isEmployee ? '' : formValues.firstName;
    // Middle name (solo para no empleados)
    const middleName: string = this.isEmployee ? '' : formValues.middleName;
    // Apellido Paterno (solo para no empleados)
    const fatherLastName: string = this.isEmployee ? '' : formValues.fatherLastName;
    // Apellido Materno (solo para no empleados)
    const motherLastName: string = this.isEmployee ? '' : formValues.motherLastName;

    // Loading
    this.isLoading = true;

    // Crear staff con campos condicionales según el tipo
    const staffRequest: any = {
      statusId: statusId,
      positionId: positionId,
      staffTypeId: staffTypeId,
      contractStartDate: contractStartDate,
      contractEndDate: contractEndDate,
      comments: comments,
      isActive: true,
    };

    // Agregar campos solo si no es empleado
    if (!this.isEmployee) {
      staffRequest.firstName = firstName;
      staffRequest.middleName = middleName;
      staffRequest.fatherLastName = fatherLastName;
      staffRequest.motherLastName = motherLastName;
      staffRequest.email = email;
      staffRequest.postalAddress = postalAddress;
      staffRequest.cityId = cityId;
      staffRequest.regionId = regionId;
      staffRequest.areaCode = areaCode;
    }

    // Agregar clasificación solo si es empleado
    if (this.isEmployee) {
      staffRequest.staffClassificationId = staffClassificationId;
    }

    // Agregar fecha de nacimiento solo si es miembro de junta
    if (this.isBoardMember) {
      staffRequest.birthDate = birthDate;
    }

    // Disable the form
    this.headerConfig.formGroup.disable();

    // Crear staff
    this._staffService.insertStaff(staffRequest, {}).subscribe({
      next: (response) => {
        switch (response.body) {
          case true:
            this._notificationService.showSuccessDialog();
            break;
          default:
            this._notificationService.showErrorDialog();
            break;
        }
      },
      error: (err) => {
        this._notificationService.showErrorDialog();
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
    this._customRouterService.navigate(['staff/list']);
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

    // Si es empleado, limpiar los campos de nombre
    if (this.isEmployee) {
      this.headerConfig.formGroup.patchValue({
        firstName: '',
        middleName: '',
        fatherLastName: '',
        motherLastName: '',
        email: '',
        city: null,
        region: null,
        areaCode: '',
        postalAddress: ''
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
      position: null
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
    const fatherLastNameControl = this.headerConfig.formGroup.get('fatherLastName');
    const motherLastNameControl = this.headerConfig.formGroup.get('motherLastName');
    const emailControl = this.headerConfig.formGroup.get('email');
    const cityControl = this.headerConfig.formGroup.get('city');
    const regionControl = this.headerConfig.formGroup.get('region');
    const areaCodeControl = this.headerConfig.formGroup.get('areaCode');
    const postalAddressControl = this.headerConfig.formGroup.get('postalAddress');

    if (this.isEmployee) {
      // Para empleados: clasificación requerida, fecha de nacimiento no requerida
      staffClassificationControl?.setValidators([Validators.required]);
      birthDateControl?.clearValidators();
      // Los campos de nombre no son requeridos para empleados
      firstNameControl?.clearValidators();
      fatherLastNameControl?.clearValidators();
      motherLastNameControl?.clearValidators();
      // Los campos de contacto y ubicación no son requeridos para empleados
      emailControl?.clearValidators();
      cityControl?.clearValidators();
      regionControl?.clearValidators();
      areaCodeControl?.clearValidators();
      postalAddressControl?.clearValidators();
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
      areaCodeControl?.setValidators([Validators.required]);
      postalAddressControl?.setValidators([Validators.required]);
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
      areaCodeControl?.setValidators([Validators.required]);
      postalAddressControl?.setValidators([Validators.required]);
    }

    staffClassificationControl?.updateValueAndValidity();
    birthDateControl?.updateValueAndValidity();
    firstNameControl?.updateValueAndValidity();
    fatherLastNameControl?.updateValueAndValidity();
    motherLastNameControl?.updateValueAndValidity();
    emailControl?.updateValueAndValidity();
    cityControl?.updateValueAndValidity();
    regionControl?.updateValueAndValidity();
    areaCodeControl?.updateValueAndValidity();
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
