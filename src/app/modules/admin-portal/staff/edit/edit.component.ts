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
import { compare, compareItems, comparePostal, isNullOrUndefinedEmptyStringNullArray, minimumAgeValidator } from 'app/shared/utils';
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



@Component({
  selector: 'app-admin-staff-edit',
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
    TranslocoModule,
    MatDatepickerModule,
    MatTooltipModule,
    MatIconModule,
    MatTimepickerModule,
    MatIconModule,
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

  // Lista de Status
  listStatus: OptionSelection[] = [];
  // Lista de Posiciones
  listPositions: OptionSelection[] = [];
  // Lista de Tipos de Staff
  listStaffTypes: StaffType[] = [];
  // Lista de Ciudades
  listCities: City[] = [];
  // Lista de Regiones
  listRegions: Region[] = [];

  // Propiedad para controlar si mostrar campos de revisión (solo para empleados)
  isEmployee: boolean = false;
  isBoardMember: boolean = false;
  selectedClassification: StaffClassification | null = null;

  // Propiedad para controlar si mostrar campos de revisión (solo para administradores)
  canViewReviewFields: boolean = false;

  // Lista completa de opciones de selección
  allOptionSelections: OptionSelection[] = [];

  headerConfig: GenericHeaderConfig = {
    title: 'staff.edit.title',
    formGroup: this._formBuilder.group({
      id: new FormControl(''),
      firstName: new FormControl('', [Validators.required]),
      middleName: new FormControl(''),
      fatherLastName: new FormControl('', [Validators.required]),
      motherLastName: new FormControl(''),
      status: new FormControl('', [Validators.required]),
      position: new FormControl('', [Validators.required]),
      staffType: new FormControl('', [Validators.required]),
      contractStartDate: new FormControl(''),
      contractEndDate: new FormControl(''),
      birthDate: new FormControl('', [Validators.required, minimumAgeValidator(18)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      postalAddress: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      region: new FormControl('', [Validators.required]),
      areaCode: new FormControl('', [Validators.required]),
      comments: new FormControl(''),
    }),
    submitButtonShow: true,
    submitButtonText: 'staff.edit.submitButton',
    cancelButtonShow: true,
    cancelButtonText: 'staff.edit.cancelButton',
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
        // Status
        this.listStatus = result.body.data.filter((option: OptionSelection) => option.optionKey === 'isActive');
        // Positions
        this.listPositions = result.body.data.filter((option: OptionSelection) => option.optionKey === 'employeePosition');

        this._changeDetectorRef.detectChanges();
      }
    });

    // Cargar tipos de staff
    const queryParams: QueryParameters = {
      take: 100,
      skip: 0,
      alls: true,
      isList: true
    };
    this._staffTypeService.getAllStaffTypesFromDb(queryParams).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.listStaffTypes = result.body.data;
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

    // Cargar datos del staff a editar
    const data = this._route.snapshot.data['data'];
    if (data) {
      this.onSetForm(data);
    }

    // Suscribirse a cambios en el tipo de staff
    this.headerConfig.formGroup.get('staffType')?.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((staffType: StaffType) => {
      this.onStaffTypeChange(staffType);
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onSetForm(staff: any): void {
    this.headerConfig.formGroup.patchValue({
      id: staff.id,
      firstName: staff.firstName,
      middleName: staff.middleName,
      fatherLastName: staff.fatherLastName,
      motherLastName: staff.motherLastName,
      status: staff.statusId,
      position: staff.positionId,
      staffType: staff.staffTypeId,
      contractStartDate: staff.contractStartDate,
      contractEndDate: staff.contractEndDate,
      birthDate: staff.birthDate,
      email: staff.email,
      postalAddress: staff.postalAddress,
      city: staff.cityId,
      region: staff.regionId,
      areaCode: staff.areaCode,
      comments: staff.comments,
    });

    // Configurar las propiedades de tipo de staff
    if (staff.staffTypeName) {
      this.isEmployee = staff.staffTypeName === 'Empleado' || staff.staffTypeName === 'Employee';
      this.isBoardMember = staff.staffTypeName === 'Miembro de la Junta' || staff.staffTypeName === 'Board Member';
    }
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

    // Si es miembro de junta, limpiar los campos de fecha de contrato
    if (this.isBoardMember) {
      this.headerConfig.formGroup.patchValue({
        contractStartDate: null,
        contractEndDate: null
      });
    }

    this._changeDetectorRef.detectChanges();
  }

  /**
   * Resetea los campos relacionados con el tipo de staff
   */
  resetStaffTypeFields(): void {
    this.isEmployee = false;
    this.isBoardMember = false;

    this.headerConfig.formGroup.patchValue({
      contractStartDate: null,
      contractEndDate: null
    });
  }

  private checkAdminPermissions(): void {
    const userRole = this._authService.getUserRole();
    // En el portal admin, siempre mostrar campos de revisión
    this.canViewReviewFields = true;
  }
}
