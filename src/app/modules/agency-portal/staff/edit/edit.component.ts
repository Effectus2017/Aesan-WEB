import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, FormControl, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StaffService } from 'app/shared/services/staff.service';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { StaffRequest } from 'app/shared/models/Request/StaffRequest';
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
import { AddRelationshipModalComponent } from '../relationship-modal/add-relationship-modal.component';
import { MatDialogModule } from '@angular/material/dialog';



@Component({
  selector: 'app-staff-edit',
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
  ],
})
export class EditStaffComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers {
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
  relationshipsTableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<any>(),
    dataSourceList: [],
    columnsSchema: STAFF_RELATIONSHIPS_COLUMNS_SCHEMA,
    displayedColumns: STAFF_RELATIONSHIPS_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 25,
    pageSizeOptions: [25, 50, 100],
    length: 0,
    addButtonShow: true,
    addButtonLabel: 'staff.edit.relationships.add',
    addButtonIcon: 'add',
    onAddButtonClick: (event?: Event) => this.onAddRelationship(),
  };

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
      status: new FormControl('', [Validators.required]),
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
      email: new FormControl('', [Validators.required, Validators.email]),
      // Postal address
      postalAddress: new FormControl('', [Validators.required]),
      // City
      city: new FormControl('', [Validators.required]),
      // Region
      region: new FormControl('', [Validators.required]),
      // Area code
      areaCode: new FormControl('', [Validators.required]),
      // Comments
      comments: new FormControl(''),
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
    // Cancel button
    cancelButtonShow: true,
    cancelButtonText: 'staff.edit.cancelButton',
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

    // Verificar permisos de administrador
    this.checkAdminPermissions();

    // Transloco
    this._translocoService.langChanges$.pipe(takeUntil(this._unsubscribeAll)).subscribe((lang: string) => {
      this.currentLang = lang;
    });

    // Cargar opciones
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

        // Resultado de revisión / Review result
        this.reviewResult = this.allOptionSelections.filter((option: OptionSelection) => option.optionKey === 'reviewResult');

        this._changeDetectorRef.detectChanges();
      }
    });

    // Cargar tipos de staff
    this._staffTypeService.staffTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.listStaffTypes = result.body;

        // Preseleccionar "Miembro de la Junta" por defecto
        const boardMemberType = this.listStaffTypes.find((staffType) => staffType.name === 'Miembro de la Junta' || staffType.nameEn === 'Board Member');

        // Configurar las variables de estado
        this.isEmployee = false;
        this.isBoardMember = true;

        this._changeDetectorRef.detectChanges();
      }
    });

    // Cargar clasificaciones de staff
    this._staffClassificationService.staffClassifications$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.listStaffClassifications = result.body;

        const boardMemberClassification = this.listStaffClassifications.find(
          (staffClassification) => staffClassification.name === 'Miembro de la Junta' || staffClassification.nameEn === 'Board Member'
        );

        if (boardMemberClassification) {
          this.headerConfig.formGroup.patchValue({
            staffClassification: boardMemberClassification,
          });

          // Configurar las variables de estado
          this.isEmployee = false;
          this.isBoardMember = true;

          // Actualizar validaciones
          this.updateValidations();
        }

        this._changeDetectorRef.detectChanges();
      }
    });

    // car clasificaciones de staff
    this._staffClassificationService.staffClassifications$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.listStaffClassifications = result.body;
        this._changeDetectorRef.detectChanges();
      }
    });

    // Cities
    this._geoService.cities$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result.body)) {
        this.listCities = result.body;
        this._changeDetectorRef.detectChanges();
      }
    });

    // Regions
    this._geoService.regions$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result.body)) {
        this.listRegions = result.body;
        this._changeDetectorRef.detectChanges();
      }
    });

    // Suscribirse a cambios en el tipo de staff
    this.headerConfig.formGroup
      .get('staffType')
      ?.valueChanges.pipe(takeUntil(this._unsubscribeAll))
      .subscribe((staffType: StaffType) => {
        this.onStaffTypeChange(staffType);
      });

    // Suscribirse a cambios en la clasificación
    this.headerConfig.formGroup
      .get('staffClassification')
      ?.valueChanges.pipe(takeUntil(this._unsubscribeAll))
      .subscribe((classification: StaffClassification) => {
        this.onClassificationChange(classification);
      });

      // Subscribierse a obtener relaciones
      this._staffRelationshipService.relationships$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
        if (!isNullOrUndefinedEmptyStringNullArray(result)) {
          this.loadStaffRelationships();
        }
      });

      // Subscribierse a obtener staff
      this._staffService.staff$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
        if (!isNullOrUndefinedEmptyStringNullArray(result)) {
          this.onSetForm(result.body);
        }
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onSetForm(param: Staff): void {
    this.param = param;

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
      areaCode: param.areaCode,
      comments: param.comments,
      //reviewResult: this.reviewResult.find((o) => o.id === staff.reviewResultId),
      reviewDate: param.reviewDate,
      reviewJustification: param.reviewJustification,
    });

    // Actualizar validaciones
    this.updateValidations();

    // Recargar las relaciones del empleado
    this.loadStaffRelationships();
  }

  onSubmit(): void {
    // Validar formulario
    if (this.headerConfig.formGroup.invalid) {
      this._notificationService.showError('Por favor, complete todos los campos requeridos');
      this.headerConfig.formGroup.markAllAsTouched();
      return;
    }

    const formValues = this.headerConfig.formGroup.value;
    // Ciudad
    const cityId: number = formValues.city.id;
    // Región
    const regionId: number = formValues.region.id;

    // Status
    const statusId: number = formValues.status.id;
    // Cargo
    const positionId: number = formValues.position.id;
    // Tipo de Staff
    const staffTypeId: number = formValues.staffType.id;
    // Fecha de inicio de contrato
    const contractStartDate: string = formValues.contractStartDate;
    // Fecha de finalización de contrato
    const contractEndDate: string = formValues.contractEndDate;
    // Fecha de nacimiento
    const birthDate: string = formValues.birthDate;
    // Email
    const email: string = formValues.email;
    // Dirección postal
    const postalAddress: string = formValues.postalAddress;
    // Código de área
    const areaCode: string = formValues.areaCode;
    // Comentarios
    const comments: string = formValues.comments;
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

    // Nombre
    const firstName: string = formValues.firstName;
    // Middle name
    const middleName: string = formValues.middleName;
    // Apellido Paterno
    const fatherLastName: string = formValues.fatherLastName;
    // Apellido Materno
    const motherLastName: string = formValues.motherLastName;
    // Loading
    this.isLoading = true;

    // Crear staff
    const staffRequest: StaffRequest = {
      id: formValues.id,
      firstName: firstName,
      middleName: middleName,
      fatherLastName: fatherLastName,
      motherLastName: motherLastName,
      statusId: statusId,
      positionId: positionId,
      staffTypeId: staffTypeId,
      contractStartDate: contractStartDate,
      contractEndDate: contractEndDate,
      birthDate: birthDate,
      email: email,
      postalAddress: postalAddress,
      cityId: cityId,
      regionId: regionId,
      areaCode: areaCode,
      comments: comments,
      isActive: true,
      reviewResultId: reviewResultId,
      reviewDate: reviewDate,
      reviewJustification: reviewJustification,
    };

    // Disable the form
    this.headerConfig.formGroup.disable();

    // Crear staff
    this._staffService.updateStaff(staffRequest, {}).subscribe({
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

    // Actualizar validaciones
    this.updateValidations();

    this._changeDetectorRef.detectChanges();
  }

  /**
   * Maneja el cambio en la clasificación de staff
   */
  onClassificationChange(classification: StaffClassification): void {
    this.selectedClassification = classification;

    // Cargar posiciones según la clasificación SOLO para empleados
    if (this.isEmployee) {
      this.loadPositionsByClassification();
    }

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
      position: null,
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
   * Abre el modal para agregar una nueva relación
   */
  onAddRelationship(): void {
    const dialogRef = this._matDialog.open(AddRelationshipModalComponent, {
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
   * Edita una relación existente
   */
  onTableEditElement(event: Event, element: any): void {
    event.stopPropagation();
    event.preventDefault();
  }

  /**
   * Elimina una relación
   */
  onTableDeleteElement(event: Event, element: any): void {
    event.stopPropagation();
    event.preventDefault();
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

    // Suscribirse al observable del servicio
    this._staffRelationshipService.relationships$.pipe(takeUntil(this._unsubscribeAll)).subscribe((relationships) => {
      if (relationships) {
        const mappedRelationships = relationships.map((rel: DTOStaffRelationship) => ({
          id: rel.id,
          relatedStaffFullName: rel.relatedStaff.fullName,
          relationshipType: rel.relationshipType,
          relatedStaffPosition: rel.relatedStaff.position,
          relatedStaffType: rel.relatedStaff.staffType,
          relatedStaffEmail: rel.relatedStaff.email,
          isActive: rel.isActive,
        }));

        this.relationshipsTableConfig.dataSource.data = mappedRelationships;
        this.relationshipsTableConfig.length = mappedRelationships.length;
        this._changeDetectorRef.detectChanges();
      }
    });

    // Cargar las relaciones desde el servicio
    this._staffRelationshipService.getRelationshipsByStaffId({ staffId, isList: true });
  }
}
