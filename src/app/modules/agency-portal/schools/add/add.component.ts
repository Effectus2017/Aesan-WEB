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
import { OptionSelection } from 'app/shared/models/OptionSelection';
import { GenericTableConfig } from 'app/shared/components/generic-table/generic-table.interface';
import { MatTableDataSource } from '@angular/material/table';
import { SATELLITE_SCHOOLS_COLUMNS_SCHEMA } from './columns-schema';
import { GroupTypeService } from 'app/shared/services/group-type.service';
import { SponsorTypeService } from 'app/shared/services/sponsor-type.service';
import { compare, comparePostal, isNullOrUndefinedEmptyStringNullArray, showErrorDialog, showSuccessDialog } from 'app/shared/utils';
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
import {MatTimepickerModule} from '@angular/material/timepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { CenterType } from 'app/shared/models/CenterType';
import { CenterTypeService } from 'app/shared/services/center-type.service';
import { OrganizationType } from 'app/shared/models/OrganizationType';
import { SponsorType } from 'app/shared/models/SponsorType';

@Component({
    selector: 'app-schools-add',
    templateUrl: './add.component.html',
    providers: [provideNativeDateAdapter()],
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
        MatTimepickerModule,
        MatIconModule,
    ]
})
export class AddSchoolComponent implements OnInit, OnGenericHeaderHandlers {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _formBuilder = inject(UntypedFormBuilder);
  private _schoolService = inject(SchoolService);
  private _geoService = inject(GeoService);
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
  private _centerTypeService = inject(CenterTypeService);
  private _organizationTypeService = inject(OrganizationTypeService);

  // catálogos
  listCities: City[] = [];
  listRegions: Region[] = [];
  listPostalRegions: Region[] = [];

  // Yes No Options (1, 2)
  // Si (1) y No (2)
  yesNoOptions: OptionSelection[] = [];

  // catálogos
  // Tipo de Organización Escuela (1), Satélite (2), Institución Residencial (3), Otros (4)
  // Organization type - Required field for school classification
  organizationTypes: OrganizationType[] = [];

  // Nivel educativo - Campo requerido para tipo de escuela
  // Education level - Required field for school type
  educationLevels = [
    {id: 1, name: 'Kinder'},
    {id: 2, name: 'Elemental'},
    {id: 3, name: 'Intermedio'},
    {id: 4, name: 'Superior'},
  ];

  // Centro - Campo requerido para clasificación de la escuela
  // Center - Required field for school classification
  centerTypes: CenterType[] = [];

  // Tipo de entrega
  // Delivery type
  deliveryTypes: DeliveryType[] = [];

  // Tipo de auspiciador
  // Sponsor type
  sponsorType: SponsorType[] = [];

  // Tipo de solicitante
  // Type of applicant
  typeOfApplicant: OptionSelection[] = [];

  // Tipo de Institución Infantil Residencial (RCCI)= Pernoctan o No Pernoctan=Requerido
  // Type of residential
  // Pernoctan (17), No Pernoctan (18)
  typeOfResidential: OptionSelection[] = [];

  // Política de funcionamiento
  // Operating policies
  operatingPolicies: OptionSelection[] = [];

  // Tipo de cocina
  // Type of kitchen
  kitchenTypes: OptionSelection[] = [];

  // Tipo de grupo
  // Type of group
  groupTypes: OptionSelection[] = [];

  // Lenguaje actual
  currentLang: string = 'es';

  // Header config
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
      // (tipo text-SOLO DISABLED)
      baseYear: [{value: null, disabled: true}, [Validators.pattern(/^\d{4}$/)]],
      // Año de renovación - Año de renovación del contrato
      // Renewal year - Year of contract renewal
      // (tipo text-SOLO DISABLED)
      renewalYear: [{value: null, disabled: true}, [Validators.pattern(/^\d{4}$/)]],
      // Tipo de organización - Campo requerido para clasificación de la escuela
      // Organization type - Required field for school classification
      organizationType: [null, Validators.required],
      // Centro - Campo requerido para clasificación de la escuela
      // Center - Required field for school classification
      centerType: [null, Validators.required],
      // Nivel educativo - Campo requerido para tipo de escuela
      // Education level - Required field for school type
      educationLevel: [null, Validators.required],
      // Días de operación - Días cuando la escuela opera
      // Operating days - Days when the school operates
      operatingDays: [''],
      // Datos Operativos / Operational Data
      // Tipo de cocina - Tipo de instalación de cocina
      // Kitchen type - Type of kitchen facility
      kitchenType: [null],
      // Tipo de grupo - Clasificación de grupos de estudiantes
      // Group type - Classification of student groups
      groupType: [null],
      // Tipo de entrega - Método de entrega de servicio
      // Delivery type - Method of service delivery
      deliveryType: [null],
      // Tipo de auspiciador - Tipo de patrocinio de la escuela
      // Sponsor type - Type of school sponsorship
      sponsorType: [null],
      // Tipo de solicitante - Tipo de solicitante de la escuela
      // Type of applicant - Type of school applicant
      // Laico (15), Base de fe (16)
      typeOfApplicant: [null],
      // Tipo de residencial - Campo requerido para clasificación RCCI (Pernoctan/No Pernoctan)
      // Residential type - Required field for RCCI classification (Residential/Non-residential)
      // Pernoctan (17), No Pernoctan (18)
      typeOfResidential: [null],
      // Política de operación - Directrices operativas de la escuela
      // Operating policy - School's operational guidelines
      operatingPolicy: [null],
      // Disponibilidad de almacén - Indica si la escuela tiene instalaciones de almacenamiento
      // Warehouse availability - Indicates if school has storage facilities
      hasWarehouse: [false],
      // Disponibilidad de comedor - Indica si la escuela tiene instalaciones de comedor
      // Dining room availability - Indicates if school has dining facilities
      hasDiningRoom: [false],
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
      // Desayuno (si, no)
      // Breakfast (yes, no)
      breakfast: [false],
      // Horario desde para el desayuno
      // Breakfast schedule from
      breakfastFrom: [null],
      // Horario hasta para el desayuno
      // Breakfast schedule to
      breakfastTo: [null],
      // Almuerzo (si, no)
      // Lunch (yes, no)
      lunch: [false],
      // Horario desde para el almuerzo
      // Lunch schedule from
      lunchFrom: [null],
      // Horario hasta para el almuerzo
      // Lunch schedule to
      lunchTo: [null],
      // Merienda (si, no)
      // Snack (yes, no)
      snack: [false],
      // Horario desde para la merienda
      // Snack schedule from
      snackFrom: [null],
      // Horario hasta para la merienda
      // Snack schedule to
      snackTo: [null],
    }),
    saveButtonShow: true,
    saveButtonText: 'schools.add.buttons.save',
    cancelButtonShow: true,
    cancelButtonText: 'schools.add.buttons.cancel',
    // Submit button
    submitButtonShow: true,
    submitButtonText: 'schools.add.buttons.submit',

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

  isLoading = false;

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
        this.typeOfResidential = result.body.data.filter((option: OptionSelection) => option.optionKey === 'typeOfResidential');
        // Tipo de solicitante
        this.typeOfApplicant = result.body.data.filter((option: OptionSelection) => option.optionKey === 'typeOfApplicant');
      }
    });

    // Tipo de centro
    this._centerTypeService.centerTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.centerTypes = result.body.data;
        this._changeDetectorRef.detectChanges();
      }
    });

    // Tipo de organización de Escuelas -- Escuela (1), Satélite (2), Institución Residencial (3), Otros (4)
    this._organizationTypeService.organizationTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.organizationTypes = result.body.data;
        this._changeDetectorRef.detectChanges();
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
        this.sponsorType = result.body.data;
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

    // Nivel educativo
    const educationLevelId: number = formValues.educationLevel?.id;
    // Tipo de organización
    const organizationTypeId: number = formValues.organizationType?.id;
    // Días de operación
    const operatingDays: number = formValues.operatingDays;
    // Tipo de cocina
    const kitchenTypeId: number = formValues.kitchenType?.id;
    // Tipo de grupo
    const groupTypeId: number = formValues.groupType?.id;
    // Tipo de entrega
    const deliveryTypeId: number = formValues.deliveryType?.id;
    // Tipo de auspiciador
    const sponsorTypeId: number = formValues.sponsorType?.id ?? null;
    // Tipo de solicitante
    // Laico (15), Base de fe (16)
    const applicantTypeId: number = formValues.typeOfApplicant?.id;
    // Tipo de centro
    const centerTypeId: number = formValues.centerType?.id;
    // Tipo de residencial - Campo requerido para clasificación RCCI (Pernoctan/No Pernoctan)
    // Type of residential - Required field for RCCI classification (Residential/Non-residential)
    // Pernoctan (17), No Pernoctan (18)
    const residentialTypeId: number = formValues.typeOfResidential?.id;
    // Política de operación
    const operatingPolicyId: number = formValues.operatingPolicy?.id;

    // Obtener los valores del formulario
    const schoolRequest: SchoolRequest = {
      // Información General / General Information
      // Nombre de la escuela - Campo requerido para identificar la escuela
      // School name - Required field for identifying the school
      name: formValues.name,
      // Dirección física - Campo requerido para la ubicación de la escuela
      // Physical address - Required field for school location
      address: formValues.address,
      // Ciudad - Campo requerido para la ubicación de la escuela
      // City - Required field for school location
      cityId: cityId,
      // Región - Campo requerido para la ubicación de la escuela
      // Region - Required field for school location
      regionId: regionId,
      // Código postal - Campo requerido para la ubicación de la escuela
      // ZIP code - Required field for school location
      zipCode: formValues.zipCode,

      // Copia de Dirección Física / Physical Address Copy
      // Alternar para copiar la dirección física a la dirección postal
      // Toggle to copy physical address to postal address
      sameAsPhysicalAddress: formValues.sameAsPhysicalAddress ?? null,

      // Dirección Postal / Postal Address
      // Dirección postal - Dirección alternativa para correspondencia
      // Postal address - Alternative mailing address
      postalAddress: formValues.postalAddress || null,
      // Ciudad postal - Requerido para correspondencia
      // Postal city - Required for mailing purposes
      postalCityId: postalCityId || null,
      // Región postal - Requerido para correspondencia
      // Postal region - Required for mailing purposes
      postalRegionId: postalRegionId || null,
      // Código postal postal - Requerido para correspondencia
      // Postal ZIP code - Required for mailing purposes
      postalZipCode: formValues.postalZipCode || null,

      // Coordenadas Geográficas / Geographical Coordinates
      // Latitud - Campo requerido para ubicación
      // Latitude - Required field for location
      latitude: formValues.latitude ?? null,
      // Longitud - Campo requerido para ubicación
      // Longitude - Required field for location
      longitude: formValues.longitude ?? null,

      // Información Administrativa / Administrative Information
      // Nivel educativo - Campo requerido para tipo de escuela
      // Education level - Required field for school type
      educationLevelId: educationLevelId,
      // Tipo de organización - Campo requerido para clasificación de la escuela
      // Organization type - Required field for school classification
      organizationTypeId: organizationTypeId,
      // Tipo de centro - Campo requerido para clasificación de la escuela (Orfanato/Centro de tratamiento residencial para salud mental/Centro Correccional Juvenil)
      // Center type - Required field for school classification
      centerTypeId: centerTypeId,
      // Días de operación - Campo requerido para horario de la escuela
      // Operating days - Required field for school schedule
      operatingDays: Number(operatingDays),

      // Información Operacional / Operational Information
      // Tipo de cocina - Campo requerido para servicio de alimentos
      // Kitchen type - Required field for food service
      kitchenTypeId: kitchenTypeId,
      // Tipo de grupo - Campo requerido para clasificación
      // Group type - Required field for classification
      groupTypeId: groupTypeId,
      // Tipo de entrega - Campo requerido para servicio de alimentos
      // Delivery type - Required field for food service
      deliveryTypeId: deliveryTypeId,
      // Tipo de auspiciador - Campo requerido para clasificación
      // Sponsor type - Required field for classification
      sponsorTypeId: sponsorTypeId,
      // Tipo de solicitante - Campo requerido para clasificación
      // Applicant type - Required field for classification
      applicantTypeId: applicantTypeId,
      // Política de operación - Campo requerido para operación
      // Operating policy - Required field for operation
      operatingPolicyId: operatingPolicyId,

      // Tipo de Institución Infantil Residencial (RCCI) - Campo requerido para clasificación RCCI (Pernoctan/No Pernoctan)
      // Type of Residential Institution (RCCI) - Required field for RCCI classification (Residential/Non-residential)
      residentialTypeId: residentialTypeId,
      // Información Adicional / Additional Information
      // Sin fines de lucro - Indicador de organización
      // Non-profit - Organization indicator
      nonProfit: formValues.nonProfit ?? null,
      // Fecha de inicio - Campo para registro histórico
      // Start date - Field for historical record
      startDate: formValues.startDate ?? null,
      // Año base - Campo para registro histórico
      // Base year - Field for historical record
      baseYear: formValues.baseYear ?? null,
      // Año de renovación - Campo para registro histórico
      // Renewal year - Field for historical record
      renewalYear: formValues.renewalYear ?? null,
      // Tiene almacén - Indicador de infraestructura
      // Has warehouse - Infrastructure indicator
      hasWarehouse: formValues.hasWarehouse ?? null,
      // Tiene comedor - Indicador de infraestructura
      // Has dining room - Infrastructure indicator
      hasDiningRoom: formValues.hasDiningRoom ?? null,

      // Información de Contacto / Contact Information
      // Nombre del administrador autorizado - Campo para contacto
      // Authorized administrator name - Contact field
      administratorAuthorizedName: formValues.administratorAuthorizedName ?? null,
      // Teléfono del sitio - Campo para contacto
      // Site phone - Contact field
      sitePhone: formValues.sitePhone ?? null,
      // Extensión - Campo para contacto
      // Extension - Contact field
      extension: formValues.extension ?? null,
      // Teléfono móvil - Campo para contacto
      // Mobile phone - Contact field
      mobilePhone: formValues.mobilePhone ?? null,

      // Servicios y Horarios / Services and Schedules
      // Desayuno - Indicador de servicio
      // Breakfast - Service indicator
      breakfast: formValues.breakfast ?? null,
      // Horario desde para el desayuno
      // Breakfast schedule from
      breakfastFrom: formValues.breakfastFrom ?? null,
      // Horario hasta para el desayuno
      // Breakfast schedule to
      breakfastTo: formValues.breakfastTo ?? null,
      // Almuerzo - Indicador de servicio
      // Lunch - Service indicator
      lunch: formValues.lunch ?? null,
      // Horario desde para el almuerzo
      // Lunch schedule from
      lunchFrom: formValues.lunchFrom ?? null,
      // Horario hasta para el almuerzo
      // Lunch schedule to
      lunchTo: formValues.lunchTo ?? null,
      // Merienda - Indicador de servicio
      // Snack - Service indicator
      snack: formValues.snack ?? null,
      // Horario desde para la merienda
      // Snack schedule from
      snackFrom: formValues.snackFrom ?? null,
      // Horario hasta para la merienda
      // Snack schedule to
      snackTo: formValues.snackTo ?? null,

      // Si la escuela es la principal
      // If the school is the main school
      isMainSchool: true,
    };

    this.isLoading = true;
    this._schoolService.insertSchool(schoolRequest, {}).subscribe({
      next: (result: any) => {
        switch (result.body) {
          case true:
            showSuccessDialog();
            break;
          default:
            showErrorDialog();
            break;
        }
      },
      error: (err) => {
        showErrorDialog();
      },
      complete: () => {
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
