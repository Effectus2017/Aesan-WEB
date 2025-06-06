import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { SchoolService } from 'app/shared/services/school.service';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GeoService } from 'app/shared/services/geo.service';
import { OrganizationTypeService } from 'app/shared/services/organization-type.service';
import { EducationLevelService } from 'app/shared/services/education-level.service';
import { OperatingPeriodService } from 'app/shared/services/operating-period.service';
import { FacilityService } from 'app/shared/services/facility.service';
import { OperatingPolicyService } from 'app/shared/services/operating-policy.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { NgForOf, NgIf } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { optionSelectionData } from 'app/shared/common-data';
import { OptionSelection } from 'app/shared/models/OptionSelection';
import { GenericTableConfig } from 'app/shared/components/generic-table/generic-table.interface';
import { MatTableDataSource } from '@angular/material/table';
import { SATELLITE_SCHOOLS_COLUMNS_SCHEMA } from './columns-schema';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { GroupTypeService } from 'app/shared/services/group-type.service';
import { SponsorTypeService } from 'app/shared/services/sponsor-type.service';
import { compare, comparePostal, isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { City } from 'app/shared/models/City';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { Region } from 'app/shared/models/Region';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { SchoolRequest } from 'app/shared/models/Request/SchoolRequest';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
import { KitchenTypeService } from 'app/shared/services/kitchen-type.service';
import { DeliveryTypeService } from 'app/shared/services/delivery-type.service';
import { DeliveryType } from 'app/shared/models/DeliveryType';

@Component({
  selector: 'app-schools-add',
  templateUrl: './add.component.html',
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
    MatDatepickerModule,
  ],
})
export class AddSchoolComponent implements OnInit, OnGenericHeaderHandlers {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _formBuilder = inject(UntypedFormBuilder);
  private _schoolService = inject(SchoolService);
  private _geoService = inject(GeoService);
  private _organizationTypeService = inject(OrganizationTypeService);
  private _educationLevelService = inject(EducationLevelService);
  private _operatingPeriodService = inject(OperatingPeriodService);
  private _facilityService = inject(FacilityService);
  private _operatingPolicyService = inject(OperatingPolicyService);
  private _snackBar = inject(MatSnackBar);
  private _customRouter = inject(CustomRouterService);
  private _translocoService = inject(TranslocoService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _groupTypeService = inject(GroupTypeService);
  private _sponsorTypeService = inject(SponsorTypeService);
  private _optionSelectionService = inject(OptionSelectionService);
  private _kitchenTypeService = inject(KitchenTypeService);
  private _deliveryTypeService = inject(DeliveryTypeService);
  // catálogos
  listCities: City[] = [];
  listRegions: Region[] = [];
  listPostalRegions: Region[] = [];

  // Yes No Options (1, 2)
  // Si (1) y No (2)
  yesNoOptions: OptionSelection[] = [];

  // catálogos
  organizationTypes = [];
  educationLevels = [];
  operatingPeriods = [];


  // Tipo de entrega
  // Delivery type
  deliveryTypes: DeliveryType[] = [];

  // Tipo de auspiciador
  // Sponsor type
  sponsorTypes: OptionSelection[] = [];

  // Tipo de solicitante
  // Applicant type
  applicantTypes: OptionSelection[] = [];

  // Tipo de Institución Infantil Residencial (RCCI)= Pernoctan o No Pernoctan=Requerido
  // Residential type
  residentialTypes: OptionSelection[] = [];

  // Política de funcionamiento
  // Operating policies
  operatingPolicies: OptionSelection[] = [];
  facilities = [];
  schools = [];
  isLoading = false;

  // Tipo de cocina
  // Type of kitchen
  kitchenTypes: OptionSelection[] = [];

  // Tipo de grupo
  // Type of group
  groupTypes: OptionSelection[] = [];

  // Lenguaje actual
  currentLang: string = 'es';

  headerConfig: GenericHeaderConfig = {
    title: 'schools.add.title',
    formGroup: this._formBuilder.group({
      // Información General / General Information
      // Nombre de la escuela - Campo requerido para identificar la escuela
      // School name - Required field for identifying the school
      name: ['', Validators.required],
      // Dirección física - Campo requerido para la ubicación de la escuela
      // Physical address - Required field for school location
      address: ['', Validators.required],
      // Ciudad - Campo requerido para la ubicación de la escuela
      // City - Required field for school location
      city: [null, Validators.required],
      // Región - Campo requerido para la ubicación de la escuela
      // Region - Required field for school location
      region: [null, Validators.required],
      // Código postal - Campo requerido para la ubicación de la escuela
      // ZIP code - Required field for school location
      zipCode: ['', Validators.required],
      // Latitud - Campo requerido para coordenadas geográficas
      // Latitude - Required field for geographical coordinates
      latitude: [null, Validators.required],
      // Longitud - Campo requerido para coordenadas geográficas
      // Longitude - Required field for geographical coordinates
      longitude: [null, Validators.required],

      // Copia de Dirección Física / Physical Address Copy
      // Alternar para copiar la dirección física a la dirección postal
      // Toggle to copy physical address to postal address
      sameAsPhysicalAddress: [false],

      // Dirección Postal / Postal Address
      // Dirección postal - Dirección alternativa para correspondencia
      // Postal address - Alternative mailing address
      postalAddress: [''],
      // Ciudad postal - Requerido para correspondencia
      // Postal city - Required for mailing purposes
      postalCity: [null, Validators.required],
      // Región postal - Requerido para correspondencia
      // Postal region - Required for mailing purposes
      postalRegion: [null, Validators.required],
      // Código postal - Para correspondencia
      // Postal ZIP code - For mailing purposes
      postalZipCode: [''],

      // Información Administrativa / Administrative Information
      // Estado sin fines de lucro - Campo requerido que indica si la escuela es sin fines de lucro
      // Non-profit status - Required field indicating if the school is non-profit
      nonProfit: [null, Validators.required],
      // Fecha de inicio - Cuando la escuela comenzó operaciones
      // School start date - When the school began operations
      startDate: [null],
      // Año base - Año de referencia para operaciones de la escuela
      // Base year - Reference year for school operations
      baseYear: [null],
      // Año de renovación - Año de renovación del contrato
      // Renewal year - Year of contract renewal
      renewalYear: [null],
      // Tipo de organización - Campo requerido para clasificación de la escuela
      // Organization type - Required field for school classification
      organizationType: [null, Validators.required],
      // Nivel educativo - Campo requerido para tipo de escuela
      // Education level - Required field for school type
      educationLevelId: [null, Validators.required],
      // Días de operación - Días cuando la escuela opera
      // Operating days - Days when the school operates
      operatingDays: [''],

      // Datos Operativos / Operational Data
      // Tipo de cocina - Tipo de instalación de cocina
      // Kitchen type - Type of kitchen facility
      kitchenTypeId: [null],
      // Tipo de grupo - Clasificación de grupos de estudiantes
      // Group type - Classification of student groups
      groupTypeId: [null],
      // Tipo de entrega - Método de entrega de servicio
      // Delivery type - Method of service delivery
      deliveryTypeId: [null],
      // Tipo de auspiciador - Tipo de patrocinio de la escuela
      // Sponsor type - Type of school sponsorship
      sponsorTypeId: [null],
      // Tipo de solicitante - Tipo de solicitante de la escuela
      // Applicant type - Type of school applicant
      applicantTypeId: [null],
      // Tipo de residencial - Campo requerido para clasificación RCCI (Residencial/No Residencial)
      // Residential type - Required field for RCCI classification (Residential/Non-residential)
      residentialTypeId: [null],
      // Política de operación - Directrices operativas de la escuela
      // Operating policy - School's operational guidelines
      operatingPolicyId: [null],
      // Disponibilidad de almacén - Indica si la escuela tiene instalaciones de almacenamiento
      // Warehouse availability - Indicates if school has storage facilities
      hasWarehouse: [null],
      // Disponibilidad de comedor - Indica si la escuela tiene instalaciones de comedor
      // Dining room availability - Indicates if school has dining facilities
      hasDiningRoom: [null],

      // Administrador/Representante Autorizado
      // Administrator/Authorized Representative
      // Nombre Completo del Administrador o Representante
      // Full name of the administrator or representative
      administratorAuthorizedName: [''],
      // Teléfono del Sitio
      // Site phone
      sitePhone: [''],
      // Extensión
      // Extension
      extension: [''],
      // Teléfono Móvil
      // Mobile phone
      mobilePhone: [''],
    }),
    saveButtonShow: true,
    saveButtonText: 'schools.add.buttons.save',
    cancelButtonShow: true,
    cancelButtonText: 'schools.add.buttons.cancel',
  };

  satelliteSchoolsConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<any>(),
    columnsSchema: SATELLITE_SCHOOLS_COLUMNS_SCHEMA,
    displayedColumns: SATELLITE_SCHOOLS_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    addButtonShow: true,
    addButtonLabel: 'schools.add.buttons.addSatelliteSchool',
    addButtonTooltip: 'schools.add.buttons.addSatelliteSchoolTooltip',
    addButtonTooltipPosition: 'above',
    addButtonIcon: 'add',
    tableId: 'satelliteSchoolsTable',
    onAddButtonClick: (event: Event) => this.onTableAddSatelliteSchool(event, null),
  };

  // Agregar esta propiedad
  protected readonly window = window;

  // Compare methods
  compare = compare;
  comparePostal = comparePostal;

  constructor() {}

  ngOnInit(): void {
    this.isLoading = true;

    // Transloco
    this._translocoService.langChanges$.pipe(takeUntil(this._unsubscribeAll)).subscribe((lang: string) => {
      this.currentLang = lang;
    });

    // Cargar opciones
    this._optionSelectionService.options$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        // Yes No
        this.yesNoOptions = result.body.data.filter((option: OptionSelection) => option.optionKey === 'yesNo');
        // Tipo de residencial
        this.residentialTypes = result.body.data.filter((option: OptionSelection) => option.optionKey === 'typeOfResidential');
        // Tipo de solicitante
        this.applicantTypes = result.body.data.filter((option: OptionSelection) => option.optionKey === 'typeOfApplicant');
      }
    });

    // Cities
    this._geoService.cities$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.listCities = result.body.data;
        this._changeDetectorRef.detectChanges();
      }
    });

    // Regions
    this._geoService.regions$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.listRegions = result.body.data;
        this._changeDetectorRef.detectChanges();
      }
    });

    // Types of kitchen
    // Tipo de cocina
    this._kitchenTypeService.kitchenTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.kitchenTypes = result.body.data;
        this._changeDetectorRef.detectChanges();
      }
    });

    // Types of group
    // Tipo de grupo
    this._groupTypeService.groupTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.groupTypes = result.body.data;
        this._changeDetectorRef.detectChanges();
      }
    });

    // Types of sponsor
    // Tipo de auspiciador
    this._sponsorTypeService.sponsorTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.sponsorTypes = result.body.data;
        this._changeDetectorRef.detectChanges();
      }
    });

    // Operating policies
    this._operatingPolicyService.operatingPolicies$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.operatingPolicies = result.body.data;
        this._changeDetectorRef.detectChanges();
      }
    });

    // Tipos de entrega
    // Types of delivery
    this._deliveryTypeService.deliveryTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.deliveryTypes = result.body.data;
        this._changeDetectorRef.detectChanges();
      }
    });

    this.isLoading = false;
  }

  onSubmit() {
    if (this.headerConfig.formGroup.invalid) {
        this._snackBar.open('Por favor, complete todos los campos requeridos', 'Cerrar', { duration: 3000 });
        this.headerConfig.formGroup.markAllAsTouched();
        return;
    }

    const formValues = this.headerConfig.formGroup.value;
    const cityId: number = formValues.city?.id;
    const regionId: number = formValues.region?.id;
    const postalCityId: number = formValues.postalCity?.id;
    const postalRegionId: number = formValues.postalRegion?.id;

    // Obtener los valores del formulario
    const schoolRequest: SchoolRequest = {
      name: formValues.name,
      address: formValues.address,
      zipCode: formValues.zipCode,
      cityId: cityId,
      regionId: regionId,
      postalAddress: formValues.postalAddress || null,
      postalZipCode: formValues.postalZipCode || null,
      postalCityId: postalCityId || null,
      postalRegionId: postalRegionId || null,
      educationLevelId: formValues.educationLevelId,
      organizationTypeId: formValues.organizationTypeId,
      operatingPeriodId: formValues.operatingPeriodId,
      kitchenTypeId: formValues.kitchenTypeId,
      groupTypeId: formValues.groupTypeId,
      deliveryTypeId: formValues.deliveryTypeId,
      sponsorTypeId: formValues.sponsorTypeId,
      applicantTypeId: formValues.applicantTypeId,
      operatingPolicyId: formValues.operatingPolicyId,
      latitude: formValues.latitude,
      longitude: formValues.longitude,
    };

    this.isLoading = true;
    this._schoolService.insertSchool(this.headerConfig.formGroup.value, {}).subscribe({
      next: () => {
        this._snackBar.open('Escuela creada correctamente', 'Cerrar', { duration: 3000 });
        this._customRouter.navigate(['schools/list']);
      },
      error: (err) => {
        this._snackBar.open('Error al crear la escuela: ' + (err?.error?.message || err), 'Cerrar', { duration: 5000 });
        this.isLoading = false;
      },
    });
  }

  onCancel() {
    this._customRouter.navigate(['schools/list']);
  }

  onTableAddSatelliteSchool(event: Event, element: any) {
    console.log('onTableAddSatelliteSchool', event, element);
  }

  // Método para obtener todas las regiones según el ID de la ciudad
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
          } else if (target === 'postalRegion') {
            this.listPostalRegions = response.body.data;
            const regionControl = this.headerConfig.formGroup.get('postalRegion');
            if (regionControl) {
              if (this.listPostalRegions.length === 1) {
                // Asignar automáticamente la única región encontrada para Dirección Postal
                this.headerConfig.formGroup.patchValue({ postalRegion: this.listPostalRegions[0] });
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

  // Copiar Dirección Física
  // Si el checkbox está marcado, copiar los valores de la dirección física a la postal
  // Si el checkbox no está marcado, limpiar los campos de la dirección postal
  onCheckboxChange(event: any): void {
    if (event.checked) {
      // Primero asignamos los valores básicos
      this.headerConfig.formGroup.patchValue({
        postalAddress: this.headerConfig.formGroup.value.address,
        postalCity: this.headerConfig.formGroup.value.city,
        postalZipCode: this.headerConfig.formGroup.value.zipCode,
      });

      // Si hay una ciudad seleccionada, obtenemos sus regiones
      if (this.headerConfig.formGroup.value.city) {
        this.getRegionsByCityId(this.headerConfig.formGroup.value.city, 'postalRegion');
      }

      this.headerConfig.formGroup.updateValueAndValidity();
    } else {
      this.headerConfig.formGroup.patchValue({
        postalAddress: '',
        postalCity: '',
        postalRegion: '',
        postalZipCode: '',
      });
    }
  }
}
