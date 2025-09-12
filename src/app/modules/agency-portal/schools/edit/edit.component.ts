import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Validators, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { SchoolService } from 'app/shared/services/school.service';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GeoService } from 'app/shared/services/geo.service';
import { OrganizationTypeService } from 'app/shared/services/organization-type.service';
import { EducationLevelService } from 'app/shared/services/education-level.service';
import { OperatingPolicyService } from 'app/shared/services/operating-policy.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { NgForOf, NgIf } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { OptionSelection } from 'app/shared/models/OptionSelection';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { City } from 'app/shared/models/City';
import { Region } from 'app/shared/models/Region';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { SchoolRequest } from 'app/shared/models/Request/SchoolRequest';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
import { KitchenTypeService } from 'app/shared/services/kitchen-type.service';
import { DeliveryTypeService } from 'app/shared/services/delivery-type.service';
import { CenterTypeService } from 'app/shared/services/center-type.service';
import { GroupTypeService } from 'app/shared/services/group-type.service';
import { SponsorTypeService } from 'app/shared/services/sponsor-type.service';
import { AuthService } from 'app/core/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { OrganizationType } from 'app/shared/models/OrganizationType';
import { EducationLevel } from 'app/shared/models/EducationLevel';
import { CenterType } from 'app/shared/models/CenterType';
import { DeliveryType } from 'app/shared/models/DeliveryType';
import { SponsorType } from 'app/shared/models/SponsorType';
import { compareById, isNullOrUndefinedEmptyStringNullArray, toTimeDate, toTimeString } from 'app/shared/utils';
import { School, SchoolList } from 'app/shared/models/School';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { NotificationService } from 'app/shared/services/notification.service';
import { GenericTableConfig } from 'app/shared/components/generic-table/generic-table.interface';
import { MatTableDataSource } from '@angular/material/table';
import { SATELLITE_SCHOOLS_COLUMNS_SCHEMA } from './columns-schema';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { AreaType } from 'app/shared/models/AreaType';
import { AreaTypeService } from 'app/shared/services/area-type.service';
import { AgencyService } from 'app/shared/services/agency.service';
import { PROGRAM_IDS } from 'app/shared/const';

@Component({
  selector: 'app-schools-edit',
  templateUrl: './edit.component.html',
  providers: [provideNativeDateAdapter()],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    GenericHeaderComponent,
    NgIf,
    NgForOf,
    TranslocoModule,
    MatDatepickerModule,
    MatTooltipModule,
    MatIconModule,
    MatCheckboxModule,
    MatTimepickerModule,
    GenericTableComponent,
  ],
})
export class EditSchoolComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers {
  // Subject para suscribirse a todos los observables al destruir el componente
  // Subject to unsubscribe from all observables on component destroy
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // Inyección de dependencias y servicios
  // Dependency injection and services
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
  private _educationLevelService = inject(EducationLevelService);
  private _areaTypeService = inject(AreaTypeService);
  private _authService = inject(AuthService);
  private _route = inject(ActivatedRoute);
  private _notificationService = inject(NotificationService);
  private _customRouterService = inject(CustomRouterService);
  private _agencyService = inject(AgencyService);

  // Catálogos
  // Catalogs
  listCities: City[] = [];
  listRegions: Region[] = [];
  listPostalRegions: Region[] = [];

  // Yes No Options (1, 2)
  // Si (1) y No (2)
  yesNoOptions: OptionSelection[] = [];

  // Tipo de Organización Escuela (1), Satélite (2), Institución Residencial (3), Otros (4)
  // Organization type - Required field for school classification
  organizationTypes: OrganizationType[] = [];

  // Nivel educativo - Campo requerido para tipo de escuela
  // Education level - Required field for school type
  educationLevels: EducationLevel[] = [];

  // Centro - Campo requerido para clasificación de la escuela
  // Center - Required field for school classification
  centerTypes: CenterType[] = [];

  // Tipo de entrega
  // Delivery type
  deliveryTypes: DeliveryType[] = [];

  // Tipo de patrocinador
  // Sponsor type
  sponsorType: SponsorType[] = [];

  // Tipo de solicitante
  // Type of applicant
  typeOfApplicant: OptionSelection[] = [];

  // Estatus
  // Status
  isActive: OptionSelection[] = [];

  // Tipo de residencial - Tipo de residencial de la escuela
  // Type of residential - Type of residential of the school
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

  // Comunidad
  // Community
  community: OptionSelection[] = [];

  // Caminantes / Walkers
  // Walkers
  walkers: OptionSelection[] = [];

  // Tipo de distribución / Distribution type
  // Distribution type
  distributionType: OptionSelection[] = [];

  // Tipo de sitio / Site type
  // Site type
  siteType: OptionSelection[] = [];

  // Experiencia / Experience
  // Experience
  experience: OptionSelection[] = [];

  // Resultado de revisión / Review result
  // Review result
  reviewResult: OptionSelection[] = [];

  // Lista de escuelas
  // List of schools
  listSchools: SchoolList[] = [];

  // Si la escuela actual es la principal
  // If the current school is the main school
  isMainSchool: boolean = false;

  // Propiedades para controlar visibilidad según programa
  isPDAM: boolean = false;
  isPSAV: boolean = false;
  isPACNA: boolean = false;
  isPFHF: boolean = false;
  isPDFE: boolean = false;
  isAESAN: boolean = false;

  currentLang: string = 'es';

  // Tipo de área
  // Type of area
  areaTypes: AreaType[] = [];

  // Parámetro de la escuela
  // School parameter
  param: School | null;

  // Configuración del header y formulario reactivo
  // Header config and reactive form
  headerConfig: GenericHeaderConfig = {
    title: 'schools.edit.title',
    formGroup: this._formBuilder.group({
      // Información General / General Information
      // Nombre de la escuela - Campo requerido para identificar la escuela
      // School name - Required field for identifying the school
      name: ['', Validators.required],
      // Escuela principal - Campo requerido para seleccionar la escuela principal (solo si no es escuela principal)
      // Main school - Required field for selecting the main school (only if not main school)
      mainSchool: [null],
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
      // Dirección postal - Campo requerido para la ubicación de la escuela
      // Postal address - Required field for school location
      postalAddress: [''],
      // Ciudad postal - Campo requerido para la ubicación de la escuela
      // Postal city - Required field for school location
      postalCity: [null, Validators.required],
      // Región postal - Campo requerido para la ubicación de la escuela
      // Postal region - Required field for school location
      postalRegion: [null, Validators.required],
      // Código postal - Campo requerido para la ubicación de la escuela
      // Postal ZIP code - Required field for school location
      postalZipCode: [''],
      // Información Administrativa / Administrative Information
      // Estado sin fines de lucro - Campo requerido que indica si la escuela es sin fines de lucro
      // Non-profit - Required field indicating if the school is non-profit
      nonProfit: [null, Validators.required],
      // Fecha de inicio - Campo requerido para la fecha de inicio de la escuela
      // Start date - Required field for the start date of the school
      startDate: [null],
      // Año de base - Campo requerido para el año de base del contrato
      // Base year - Required field for the base year of the contract
      baseYear: [{ value: null, disabled: true }, [Validators.pattern(/^[\d]{4}$/)]],
      // Año de renovación - Campo requerido para el año de renovación del contrato
      // Renewal year - Required field for the renewal year of the contract
      renewalYear: [{ value: null, disabled: true }, [Validators.pattern(/^[\d]{4}$/)]],
      // Tipo de organización - Campo requerido para la clasificación de la escuela
      // Organization type - Required field for school classification
      organizationType: [null, Validators.required],
      // Centro - Campo requerido para la clasificación de la escuela
      // Center - Required field for school classification
      centerType: [null, Validators.required],
      // Niveles educativos - Campo requerido para el tipo de escuela (múltiple selección)
      // Education levels - Required field for school type (multiple selection)
      educationLevels: [[], Validators.required],
      // Fechas de funcionamiento - Fechas desde y hasta cuando opera la escuela
      // Operating dates - Dates from and to when the school operates
      operatingFromDate: [null],
      operatingToDate: [null],
      operatingDaysCalculated: [{value: null, disabled: true}],
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
      // Type of applicant - Type of applicant of the school
      typeOfApplicant: [null],
      // Tipo de residencial - Tipo de residencial de la escuela
      // Type of residential - Type of residential of the school
      typeOfResidential: [null],
      // Tipo de área - Tipo de área de la escuela
      // Type of area - Type of area of the school
      areaType: [null],
      // Política de operación - Política de operación de la escuela
      // Operating policy - Operating policy of the school
      operatingPolicy: [null],
      // Almacén - Campo requerido para indicar si la escuela tiene un almacén
      // Warehouse - Required field indicating if the school has a warehouse
      hasWarehouse: [false],
      // Comedor - Campo requerido para indicar si la escuela tiene un comedor
      // Dining room - Required field indicating if the school has a dining room
      hasDiningRoom: [false],
      // Nombre del autorizado - Campo requerido para indicar el nombre del autorizado de la escuela
      // Administrator authorized name - Required field indicating the name of the authorized of the school
      administratorAuthorizedName: [''],
      // Teléfono del sitio - Campo requerido para indicar el teléfono del sitio de la escuela
      // Site phone - Required field indicating the site phone of the school
      sitePhone: [''],
      // Extensión - Campo requerido para indicar la extensión del teléfono del sitio de la escuela
      // Extension - Required field indicating the extension of the site phone of the school
      extension: [''],
      // Teléfono móvil - Campo requerido para indicar el teléfono móvil de la escuela
      // Mobile phone - Required field indicating the mobile phone of the school
      mobilePhone: [''],
      // Desayuno - Campo requerido para indicar si la escuela tiene desayuno
      // Breakfast - Required field indicating if the school has breakfast
      breakfast: [false],
      // Desayuno desde - Campo requerido para indicar la hora de inicio del desayuno
      // Breakfast from - Required field indicating the start time of breakfast
      breakfastFrom: [null],
      // Desayuno hasta - Campo requerido para indicar la hora de fin del desayuno
      // Breakfast to - Required field indicating the end time of breakfast
      breakfastTo: [null],
      // Almuerzo - Campo requerido para indicar si la escuela tiene almuerzo
      // Lunch - Required field indicating if the school has lunch
      lunch: [false],
      // Almuerzo desde - Campo requerido para indicar la hora de inicio del almuerzo
      // Lunch from - Required field indicating the start time of lunch
      lunchFrom: [null],
      // Almuerzo hasta - Campo requerido para indicar la hora de fin del almuerzo
      // Lunch to - Required field indicating the end time of lunch
      lunchTo: [null],
      // Merienda - Campo requerido para indicar si la escuela tiene merienda
      // Snack - Required field indicating if the school has snack
      snack: [false],
      // Merienda desde - Campo requerido para indicar la hora de inicio de la merienda
      // Snack from - Required field indicating the start time of snack
      snackFrom: [null],
      // Merienda hasta - Campo requerido para indicar la hora de fin de la merienda
      // Snack to - Required field indicating the end time of snack
      snackTo: [null],
      // Cena - Campo requerido para indicar si la escuela tiene cena
      // Dinner - Required field indicating if the school has dinner
      dinner: [false],
      // Cena desde - Campo requerido para indicar la hora de inicio de la cena
      // Dinner from - Required field indicating the start time of dinner
      dinnerFrom: [null],
      // Cena hasta - Campo requerido para indicar la hora de fin de la cena
      // Dinner to - Required field indicating the end time of dinner
      dinnerTo: [null],
      // Merienda nocturna - Campo requerido para indicar si la escuela tiene merienda nocturna
      // Snack night - Required field indicating if the school has snack night
      snackNight: [false],
      // Merienda nocturna desde - Campo requerido para indicar la hora de inicio de la merienda nocturna
      // Snack night from - Required field indicating the start time of snack night
      snackNightFrom: [null],
      // Merienda nocturna hasta - Campo requerido para indicar la hora de fin de la merienda nocturna
      // Snack night to - Required field indicating the end time of snack night
      snackNightTo: [null],
      // Comunidad - Campo requerido para indicar la comunidad de la escuela
      // Community - Required field indicating the community of the school
      community: [null],
      // Caminantes - Campo requerido para indicar los caminantes de la escuela
      // Walkers - Required field indicating the walkers of the school
      walkers: [null],
      // Tipo de sitio - Campo requerido para indicar el tipo de sitio de la escuela
      // Site type - Required field indicating the site type of the school
      siteType: [null],
      // Experiencia - Campo requerido para indicar la experiencia de la escuela
      // Experience - Required field indicating the experience of the school
      experience: [null],
      // Estado activo/inactivo de la escuela
      // Active/inactive status of the school
      isActive: [true],
      // Justificación de inactivación - Requerida cuando isActive es false
      // Inactivation justification - Required when isActive is false
      inactiveJustification: [{ value: '', disabled: true }],
      // Fecha de inactivación - Fecha cuando se inactivó la escuela
      // Inactivation date - Date when the school was inactivated
      inactiveDate: [{ value: null, disabled: true }],
      // Resultado de revisión - Resultado de la revisión de la escuela
      // Review result - Result of the school review
      reviewResult: [null],
      // Fecha de revisión - Fecha cuando se realizó la revisión
      // Review date - Date when the review was conducted
      reviewDate: [null],
      // Justificación de revisión - Justificación de la revisión
      // Review justification - Justification of the review
      reviewJustification: [null],
    }),
    // Cancel button
    cancelButtonShow: true,
    cancelButtonText: 'schools.edit.buttons.cancel',
    // Submit button
    submitButtonShow: true,
    submitButtonText: 'schools.edit.buttons.save',
  };

  satellitesTableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<any>(),
    dataSourceList: [],
    columnsSchema: SATELLITE_SCHOOLS_COLUMNS_SCHEMA,
    displayedColumns: SATELLITE_SCHOOLS_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 25,
    pageSizeOptions: [25, 50, 100],
    length: 0,

  };

  // Agregar esta propiedad
  protected readonly window = window;

  // Compare methods
  compareById = compareById;

  // Estado de carga y variables de contexto
  // Loading state and context variables
  isLoading = false;

  // Agencia Id
  // Agency ID
  agencyId: number = 0;

  // Escuela Id
  // School ID
  schoolId: number = 0;

  constructor() {}

  ngOnInit(): void {
    this.currentLang = this._translocoService.getActiveLang();
    this.loadData();
    this.setupFormListeners();
  }

  private setupFormListeners(): void {
    // Escuchar cambios en las fechas para calcular automáticamente los días
    this.headerConfig.formGroup.get('operatingFromDate')?.valueChanges.subscribe(() => {
      this.calculateOperatingDays();
    });

    this.headerConfig.formGroup.get('operatingToDate')?.valueChanges.subscribe(() => {
      this.calculateOperatingDays();
    });
  }

  private calculateOperatingDays(): void {
    const fromDate = this.headerConfig.formGroup.get('operatingFromDate')?.value;
    const toDate = this.headerConfig.formGroup.get('operatingToDate')?.value;

    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      const diffTime = Math.abs(to.getTime() - from.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir ambos días

      this.headerConfig.formGroup.patchValue({
        operatingDaysCalculated: diffDays
      });
    } else {
      this.headerConfig.formGroup.patchValue({
        operatingDaysCalculated: null
      });
    }
  }

  private loadData(): void {
    this.isLoading = true;

    // Obtener Agencia desde local storage desde AuthService
    this.agencyId = this._authService.getAgencyId();

    // Suscribirse a cambios en el control isActive para manejar campos de inactivación
    this.headerConfig.formGroup.get('isActive').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((isActive: boolean) => {
      const inactiveJustificationControl = this.headerConfig.formGroup.get('inactiveJustification');

      if (isActive === false) {
        // Si la escuela está inactiva, requerir justificación
        inactiveJustificationControl.setValidators([Validators.required]);
      } else {
        // Si la escuela está activa, limpiar validadores y valores
        inactiveJustificationControl.clearValidators();
        inactiveJustificationControl.setValue('');
        this.headerConfig.formGroup.get('inactiveDate').setValue(null);
      }

      inactiveJustificationControl.updateValueAndValidity();
    });

    // Transloco
    this._translocoService.langChanges$.pipe(takeUntil(this._unsubscribeAll)).subscribe((lang: string) => {
      this.currentLang = lang;
    });

    // Verificar si existe una escuela principal
    // Check if there is a main school
    this._schoolService.hasMainSchool$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.isMainSchool = result.body;
        this._changeDetectorRef.detectChanges();
      }
    });

    // Obtener datos de la agencia para determinar campos visibles
    this._agencyService.agency$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        const agency = result.body;
        const programs = agency.programs || [];

        // Determinar qué campos mostrar según los programas
        this.determineVisibleFields(programs);
      }
    });

    // Cargar catálogos
    // Load catalogs
    this._optionSelectionService.options$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        // Yes No
        this.yesNoOptions = result.body.data.filter((option: OptionSelection) => option.optionKey === 'yesNo');
        // Tipo de residencial
        this.typeOfResidential = result.body.data.filter((option: OptionSelection) => option.optionKey === 'typeOfResidential');
        // Tipo de solicitante
        this.typeOfApplicant = result.body.data.filter((option: OptionSelection) => option.optionKey === 'typeOfApplicant');
        // Estatus
        this.isActive = result.body.data.filter((option: OptionSelection) => option.optionKey === 'isActive');
        // Política de operación
        this.operatingPolicies = result.body.data.filter((option: OptionSelection) => option.optionKey === 'operatingPolicy');
        // Tipo de cocina
        this.kitchenTypes = result.body.data.filter((option: OptionSelection) => option.optionKey === 'kitchenType');
        // Tipo de grupo
        this.groupTypes = result.body.data.filter((option: OptionSelection) => option.optionKey === 'groupType');
        // Comunidad
        this.community = result.body.data.filter((option: OptionSelection) => option.optionKey === 'community');
        // Caminantes / Walkers
        this.walkers = result.body.data.filter((option: OptionSelection) => option.optionKey === 'walkers');
        // Tipo de distribución / Distribution type
        this.distributionType = result.body.data.filter((option: OptionSelection) => option.optionKey === 'distributionType');
        // Tipo de sitio / Site type
        this.siteType = result.body.data.filter((option: OptionSelection) => option.optionKey === 'siteType');
        // Experiencia / Experience
        this.experience = result.body.data.filter((option: OptionSelection) => option.optionKey === 'experience');
        // Resultado de revisión / Review result
        this.reviewResult = result.body.data.filter((option: OptionSelection) => option.optionKey === 'reviewResult');
      }
    });

    // Tipo de centro
    this._centerTypeService.centerTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result.body)) {
        this.centerTypes = result.body;
        this._changeDetectorRef.detectChanges();
      }
    });

    // Tipo de organización
    this._organizationTypeService.organizationTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result.body)) {
        this.organizationTypes = result.body;
        this._changeDetectorRef.detectChanges();
      }
    });

    // Ciudad
    this._geoService.cities$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result.body)) {
        this.listCities = result.body;
        this._changeDetectorRef.detectChanges();
      }
    });

    // Región
    this._geoService.regions$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result.body)) {
        this.listRegions = result.body;
        this.listPostalRegions = result.body;
        this._changeDetectorRef.detectChanges();
      }
    });

    // Tipo de cocina
    // Kitchen type
    this._kitchenTypeService.kitchenTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result.body)) {
        this.kitchenTypes = result.body;
        this._changeDetectorRef.detectChanges();
      }
    });

    // Tipo de grupo
    // Group type
    this._groupTypeService.groupTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result.body)) {
        this.groupTypes = result.body;
        this._changeDetectorRef.detectChanges();
      }
    });

    // Tipo de auspiciador
    // Sponsor type
    this._sponsorTypeService.sponsorTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result.body)) {
        this.sponsorType = result.body;
        this._changeDetectorRef.detectChanges();
      }
    });

    // Política de operación
    // Operating policy
    this._operatingPolicyService.operatingPolicies$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result.body)) {
        this.operatingPolicies = result.body;
        this._changeDetectorRef.detectChanges();
      }
    });

    // Tipo de entrega
    // Delivery type
    this._deliveryTypeService.deliveryTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result.body)) {
        this.deliveryTypes = result.body;
        this._changeDetectorRef.detectChanges();
      }
    });

    // Nivel educativo
    // Education level
    this._educationLevelService.educationLevels$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result.body)) {
        this.educationLevels = result.body;
        this._changeDetectorRef.detectChanges();
      }
    });

    // Tipo de Area
    this._areaTypeService.areaTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result.body)) {
        this.areaTypes = result.body;
        this._changeDetectorRef.detectChanges();
      }
    });

    // Lista de escuelas
    // List of schools
    this._schoolService.schools$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.listSchools = result.body;
        this._changeDetectorRef.detectChanges();
      }
    });

    // Escuela
    // School
    this._schoolService.school$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.onSetForm(result.body);
        this._changeDetectorRef.detectChanges();
      }
    });

    this.isLoading = false;
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  private determineVisibleFields(programs: any[]): void {
    this.isPDAM = programs.some(p => p.id === PROGRAM_IDS.PDAM);
    this.isPSAV = programs.some(p => p.id === PROGRAM_IDS.PSAV);
    this.isPACNA = programs.some(p => p.id === PROGRAM_IDS.PACNA);
    this.isPFHF = programs.some(p => p.id === PROGRAM_IDS.PFHF);
    this.isPDFE = programs.some(p => p.id === PROGRAM_IDS.PDFE);
    this.isAESAN = programs.some(p => p.id === PROGRAM_IDS.AESAN);

    this.updateValidations();
    this._changeDetectorRef.detectChanges();
  }

  private updateValidations(): void {
    // Actualizar validaciones según los campos visibles
    // Similar a como se hace en Staff
  }

  onSetForm(param: School): void {
    this.param = param;
    this.isMainSchool = param.isMainSchool || false;

    const mainSchoolControl = this.headerConfig.formGroup.get('mainSchool');

    // Si esta escuela es la principal, no debería poder seleccionar una escuela principal
    if (this.isMainSchool) {
      mainSchoolControl.disable();
      mainSchoolControl.clearValidators();
      mainSchoolControl.setValue(null);
    } else {
      mainSchoolControl.enable();
      //mainSchoolControl.setValidators([Validators.required]);
    }

    mainSchoolControl.updateValueAndValidity();

    // Obtener las ciudades y regiones
    // Get cities and regions
    const city = param.city;
    const region = param.region;
    const postalCity = param.postalCity;
    const postalRegion = param.postalRegion;

    const kitchenType = param.kitchenType;
    const groupType = param.groupType;
    const deliveryType = param.deliveryType;
    const sponsorType = param.sponsorType;
    const applicantType = param.applicantType;
    const residentialType = param.residentialType;
    const operatingPolicy = param.operatingPolicy;
    const educationLevels = param.educationLevels || [];
    const organizationType = param.organizationType;
    const centerType = param.centerType;
    const areaType = param.areaType;

    //const breakfastFrom: Date | null = toTimeDate(param.breakfastFrom);
    //const breakfastTo: Date | null = toTimeDate(param.breakfastTo);
    //const lunchFrom: Date | null = toTimeDate(param.lunchFrom);
    //const lunchTo: Date | null = toTimeDate(param.lunchTo);
    //const snackFrom: Date | null = toTimeDate(param.snackFrom);
    //const snackTo: Date | null = toTimeDate(param.snackTo);

    const mainSchool = param.mainSchool;

    // Campos adicionales
    //const dinnerFrom: Date | null = toTimeDate(param.dinnerFrom);
    //const dinnerTo: Date | null = toTimeDate(param.dinnerTo);
    //const snackNightFrom: Date | null = toTimeDate(param.snackNightFrom);
    //const snackNightTo: Date | null = toTimeDate(param.snackNightTo);

    const communityId = param.communityId;
    const walkersId = param.walkersId;
    const siteTypeId = param.siteTypeId;
    const experienceId = param.experienceId;
    const reviewResultId = param.reviewResultId;
    const reviewDate = param.reviewDate;
    const reviewJustification = param.reviewJustification;

    this.headerConfig.formGroup.patchValue({
      name: param.name,
      mainSchool: mainSchool,
      address: param.address || null,
      city: city,
      region: region,
      zipCode: param.zipCode,
      sameAsPhysicalAddress: param.sameAsPhysicalAddress,
      postalAddress: param.postalAddress,
      postalCity: postalCity,
      postalRegion: postalRegion,
      postalZipCode: param.postalZipCode,
      latitude: param.latitude,
      longitude: param.longitude,
      educationLevels: educationLevels,
      organizationType: organizationType,
      centerType: centerType,
      operatingFromDate: param.operatingFromDate,
      operatingToDate: param.operatingToDate,
      operatingDaysCalculated: param.operatingDaysCalculated,
      //
      nonProfit: param.nonProfit,
      startDate: param.startDate,
      baseYear: param.baseYear,
      renewalYear: param.renewalYear,
      administratorAuthorizedName: param.administratorAuthorizedName,
      sitePhone: param.sitePhone,
      extension: param.extension,
      mobilePhone: param.mobilePhone,
      //breakfast: param.breakfast,
      //breakfastFrom: breakfastFrom,
      //breakfastTo: breakfastTo,
      //lunch: param.lunch,
      //lunchFrom: lunchFrom,
      //lunchTo: lunchTo,
      //snack: param.snack,
      //snackFrom: snackFrom,
      //snackTo: snackTo,
      //dinner: param.dinner,
      //dinnerFrom: dinnerFrom,
      //dinnerTo: dinnerTo,
      //snackNight: param.snackNight,
      //snackNightFrom: snackNightFrom,
      //snackNightTo: snackNightTo,
      community: this.community.find(o => o.id === communityId),
      walkers: this.walkers.find(o => o.id === walkersId),
      siteType: this.siteType.find(o => o.id === siteTypeId),
      experience: this.experience.find(o => o.id === experienceId),
      reviewResult: this.reviewResult.find(o => o.id === reviewResultId),
      reviewDate: reviewDate,
      reviewJustification: reviewJustification,
      isActive: param.isActive,
      inactiveJustification: param.inactiveJustification || null,
      inactiveDate: param.inactiveDate,
      //
      kitchenType: kitchenType,
      groupType: groupType,
      deliveryType: deliveryType,
      sponsorType: sponsorType,
      applicantType: applicantType,
      residentialType: residentialType,
      operatingPolicy: operatingPolicy,
      areaType: areaType,
    });

    // Satélites
    this.satellitesTableConfig.dataSource.data = param.satellites || [];
    this.satellitesTableConfig.length = param.satellites?.length || 0;
    this._changeDetectorRef.detectChanges();
  }

  /**
   * Envía el formulario de edición de escuela
   * Submits the school edit form
   */
  onSubmit() {
    if (this.headerConfig.formGroup.invalid) {
      this._notificationService.showError('Por favor, complete todos los campos requeridos');
      this.headerConfig.formGroup.markAllAsTouched();
      return;
    }

    if (isNullOrUndefinedEmptyStringNullArray(this.param)) {
      this._notificationService.showError('No se puede editar una escuela que no existe');
      return;
    }

    const formValues = this.headerConfig.formGroup.value;
    // Obtener y mapear los valores del formulario
    // Get and map form values
    const cityId: number = formValues.city?.id;
    const regionId: number = formValues.region?.id;
    const postalCityId: number = formValues.postalCity?.id;
    const postalRegionId: number = formValues.postalRegion?.id;
    const educationLevelIds: number[] = formValues.educationLevels?.map((level: any) => level.id) || [];
    const organizationTypeId: number = formValues.organizationType?.id;
    const operatingDays: number = Number(formValues.operatingDays);
    const kitchenTypeId: number = formValues.kitchenType?.id;
    const groupTypeId: number = formValues.groupType?.id;
    const deliveryTypeId: number = formValues.deliveryType?.id;
    const sponsorTypeId: number = formValues.sponsorType?.id ?? null;
    const applicantTypeId: number = formValues.typeOfApplicant?.id;
    const centerTypeId: number = formValues.centerType?.id;
    const residentialTypeId: number = formValues.typeOfResidential?.id;
    const operatingPolicyId: number = formValues.operatingPolicy?.id;
    const areaTypeId: number = formValues.areaType?.id;

    //const breakfastFrom: string = toTimeString(formValues.breakfastFrom);
    //const breakfastTo: string = toTimeString(formValues.breakfastTo);
    //const lunchFrom: string = toTimeString(formValues.lunchFrom);
    //const lunchTo: string = toTimeString(formValues.lunchTo);
    //const snackFrom: string = toTimeString(formValues.snackFrom);
    //const snackTo: string = toTimeString(formValues.snackTo);

    //const snack = formValues.snack;
    //const lunch = formValues.lunch;
    //const breakfast = formValues.breakfast;

    // Campos adicionales
    //const dinnerFrom: string = toTimeString(formValues.dinnerFrom);
    //const dinnerTo: string = toTimeString(formValues.dinnerTo);
    //const snackNightFrom: string = toTimeString(formValues.snackNightFrom);
    //const snackNightTo: string = toTimeString(formValues.snackNightTo);
    //const dinner = formValues.dinner;
    //const snackNight = formValues.snackNight;

    const communityId = formValues.community?.id;
    const walkersId = formValues.walkers?.id;
    const siteTypeId = formValues.siteType?.id;
    const experienceId = formValues.experience?.id;
    const reviewResultId = formValues.reviewResult?.id;
    const reviewDate = formValues.reviewDate;
    const reviewJustification = formValues.reviewJustification;

    const mainSchoolId = formValues.mainSchool?.id;

    // Construir el objeto de actualización
    // Build the update object
    const schoolRequest: SchoolRequest = {
      id: this.param.id,
      agencyId: this.agencyId,
      mainSchoolId: mainSchoolId,
      name: formValues.name,
      address: formValues.address,
      cityId: cityId,
      regionId: regionId,
      zipCode: formValues.zipCode,
      sameAsPhysicalAddress: formValues.sameAsPhysicalAddress ?? null,
      postalAddress: formValues.postalAddress || null,
      postalCityId: postalCityId || null,
      postalRegionId: postalRegionId || null,
      postalZipCode: formValues.postalZipCode || null,
      latitude: formValues.latitude ?? null,
      longitude: formValues.longitude ?? null,
      //educationLevelIds: educationLevelIds,
      organizationTypeId: organizationTypeId,
      centerTypeId: centerTypeId,
      operatingFromDate: formValues.operatingFromDate ?? null,
      operatingToDate: formValues.operatingToDate ?? null,
      operatingDaysCalculated: formValues.operatingDaysCalculated ?? null,
      kitchenTypeId: kitchenTypeId,
      groupTypeId: groupTypeId,
      deliveryTypeId: deliveryTypeId,
      sponsorTypeId: sponsorTypeId,
      applicantTypeId: applicantTypeId,
      operatingPolicyId: operatingPolicyId,
      residentialTypeId: residentialTypeId,
      areaTypeId: areaTypeId,
      nonProfit: formValues.nonProfit ?? null,
      startDate: formValues.startDate ?? null,
      baseYear: formValues.baseYear ?? null,
      renewalYear: formValues.renewalYear ?? null,
      hasWarehouse: formValues.hasWarehouse ?? null,
      hasDiningRoom: formValues.hasDiningRoom ?? null,
      administratorAuthorizedName: formValues.administratorAuthorizedName ?? null,
      sitePhone: formValues.sitePhone ?? null,
      extension: formValues.extension ?? null,
      mobilePhone: formValues.mobilePhone ?? null,
      //breakfast: breakfast ?? null,
      //breakfastFrom: breakfastFrom ?? null,
      //breakfastTo: breakfastTo ?? null,
      //lunch: lunch ?? null,
      //lunchFrom: lunchFrom ?? null,
      //lunchTo: lunchTo ?? null,
      //snack: snack ?? null,
      //snackFrom: snackFrom ?? null,
      //snackTo: snackTo ?? null,
      //dinner: dinner ?? null,
      //dinnerFrom: dinnerFrom ?? null,
      //dinnerTo: dinnerTo ?? null,
      //snackNight: snackNight ?? null,
      //snackNightFrom: snackNightFrom ?? null,
      //snackNightTo: snackNightTo ?? null,
      communityId: communityId ?? null,
      walkersId: walkersId ?? null,
      siteTypeId: siteTypeId ?? null,
      experienceId: experienceId ?? null,
      reviewResultId: reviewResultId ?? null,
      reviewDate: reviewDate ?? null,
      reviewJustification: reviewJustification ?? null,
      isMainSchool: this.isMainSchool ?? false,
      isActive: formValues.isActive ?? true,
      inactiveJustification: formValues.inactiveJustification ?? null,
      inactiveDate: formValues.inactiveDate ?? null,
    };

    this.isLoading = true;
    this.headerConfig.formGroup.disable();

    this._schoolService.updateSchool(schoolRequest, {}).subscribe({
      next: (result: any) => {
        switch (result.body) {
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

        const baseYearControl = this.headerConfig.formGroup.get('baseYear');
        const renewalYearControl = this.headerConfig.formGroup.get('renewalYear');

        // Disable the base year and renewal year fields
        if (baseYearControl) {
          baseYearControl.disable();
          baseYearControl.setValue(null);
        }
        if (renewalYearControl) {
          renewalYearControl.disable();
          renewalYearControl.setValue(null);
        }
      },
    });
  }

  /**
   * Cancela la edición y navega al listado de escuelas
   * Cancels editing and navigates to the schools list
   */
  onCancel() {
    this._customRouter.navigate(['schools/list']);
  }

  /**
   * Obtiene todas las regiones según el ID de la ciudad
   * Gets all regions by city ID
   */
  getRegionsByCityId(city: City, target: string): void {
    if (!city) return;

    const queryParameters: QueryParameters = {
      cityId: city.id,
      isList: true,
    };

    this._geoService.getRegionsByCityId(queryParameters).subscribe({
      next: (response) => {
        if (!isNullOrUndefinedEmptyStringNullArray(response)) {
          if (target === 'region') {
            this.listRegions = response.body;
            const regionControl = this.headerConfig.formGroup.get('region');
            if (regionControl) {
              if (this.listRegions.length === 1) {
                this.headerConfig.formGroup.patchValue({ region: this.listRegions[0] });
              } else {
                regionControl.setValue(null);
              }
            }
          } else if (target === 'postalRegion') {
            this.listPostalRegions = response.body;
            const regionControl = this.headerConfig.formGroup.get('postalRegion');
            if (regionControl) {
              if (this.listPostalRegions.length === 1) {
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
  // If the checkbox is not checked, clear the postal address fields
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

  /**
   * Limpia el campo de la escuela principal
   * Clears the main school field
   */
  onClearMainSchool() {
    this.headerConfig.formGroup.get('mainSchool').setValue(null);
  }

  /**
   * Edita un elemento de la tabla
   * Edits an element of the table
   */
  onTableEditElement(event: Event, element: any) {
    event.stopPropagation();
    event.preventDefault();
    this._customRouterService.navigate([`schools/edit/${element.satelliteSchoolId}`]);
  }

  /**
   * Maneja el cambio en el campo de estado activo/inactivo
   * Handles the change in the active/inactive status field
   */
  onIsActiveChange(event: any): void {

    const isActive = event;
    const inactiveJustificationControl = this.headerConfig.formGroup.get('inactiveJustification');
    const inactiveDateControl = this.headerConfig.formGroup.get('inactiveDate');

    if (isActive === false) {

      // Limpiar validadores primero
      inactiveJustificationControl.clearValidators();
      inactiveDateControl.clearValidators();

      // Habilitar controles
      inactiveJustificationControl.enable({ emitEvent: false });
      inactiveDateControl.enable({ emitEvent: false });

      // Establecer valores
      inactiveJustificationControl.setValue('');
      inactiveDateControl.setValue(new Date());

      // Establecer validadores
      inactiveJustificationControl.setValidators([Validators.required]);
      inactiveDateControl.setValidators([Validators.required]);

    } else {
      // Limpiar validadores
      inactiveJustificationControl.clearValidators();
      inactiveDateControl.clearValidators();

      // Limpiar valores
      inactiveJustificationControl.setValue('');
      inactiveDateControl.setValue(null);

      // Deshabilitar controles
      inactiveJustificationControl.disable({ emitEvent: false });
      inactiveDateControl.disable({ emitEvent: false });
    }

    // Forzar actualización de validación
    inactiveJustificationControl.updateValueAndValidity({ emitEvent: false });
    inactiveDateControl.updateValueAndValidity({ emitEvent: false });

    // Forzar detección de cambios
    this._changeDetectorRef.detectChanges();
  }
}
