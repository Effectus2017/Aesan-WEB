import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Validators, ReactiveFormsModule, UntypedFormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { SiteService } from 'app/shared/services/site.service';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GeoService } from 'app/shared/services/geo.service';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericTableConfig, OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { MatTableDataSource } from '@angular/material/table';
import { SiteChildGroupRequest } from 'app/shared/models/request/SiteChildGroupRequest';
import {
  AddServiceByGroupModalComponent,
  ServiceByGroupDialogData,
  ServiceByGroupDialogResult,
} from 'app/shared/components/add-service-by-group-modal/add-service-by-group-modal.component';
import { SERVICES_COLUMNS_SCHEMA } from 'app/shared/components/add-service-by-group-modal/services-columns-schema';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { NgForOf, NgIf } from '@angular/common';
import { merge, Subject, takeUntil } from 'rxjs';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { AgencyResponse } from 'app/shared/models/agency/AgencyResponse';
import { OptionSelection } from 'app/shared/models/common/OptionSelection';
import { OperatingPolicy } from 'app/shared/models/household/OperatingPolicy';
import {
  compare,
  compareById,
  comparePostal,
  toTimeString,
  logFormValidationErrors,
  generateTimeOptions,
  filterStartTimeOptions,
  getEndTimeOptions,
  isTimeWithinOperatingRange,
  timeStringToDate,
  dateToMinutes,
  compareByTime,
  getApiErrorMessage,
  TimeOption,
} from 'app/shared/utils';
import { City } from 'app/shared/models/location/City';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { Region } from 'app/shared/models/location/Region';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { SiteRequest } from 'app/shared/models/request/SiteRequest';
import { SiteServiceRequest } from 'app/shared/models/request/SiteServiceRequest';
import { SiteEducationLevelRequest } from 'app/shared/models/request/SiteEducationLevelRequest';
import { GroupTypeService } from 'app/shared/services/group-type.service';
import { KitchenTypeService } from 'app/shared/services/kitchen-type.service';
import { DeliveryTypeService } from 'app/shared/services/delivery-type.service';
import { DeliveryType } from 'app/shared/models/catalog/DeliveryType';
import { BaseApiException } from 'app/shared/models/errors/BaseApiException';
import { ErrorCode } from 'app/shared/models/errors/ErrorCode';
import { SiteChildGroupServiceSlotResponse } from 'app/shared/models/response/SiteChildGroupServiceSlotResponse';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { CenterType } from 'app/shared/models/catalog/CenterType';
import { OrganizationType } from 'app/shared/models/catalog/OrganizationType';
import { SponsorType } from 'app/shared/models/catalog/SponsorType';
import { EducationLevelResponse } from 'app/shared/models/response/EducationLevelResponse';
import { AuthService } from 'app/core/auth/auth.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { AreaTypeService } from 'app/shared/services/area-type.service';
import { AreaType } from 'app/shared/models/catalog/AreaType';
import { DayOfWeekResponse } from 'app/shared/models/calendar/DayOfWeekResponse';
import { PROGRAM_IDS } from 'app/shared/const';
import { PermissionRequestDialogComponent } from '../../../../shared/components/permission-request-dialog/permission-request-dialog.component';
import { CfrInfoDialogComponent } from 'app/shared/components/cfr-info-dialog/cfr-info-dialog.component';
import { PermissionRequestFormDialogComponent } from '../../../../shared/components/permission-request-form-dialog/permission-request-form-dialog.component';

import { NumericOnlyDirective } from 'app/shared/directives/numeric-only.directive';
import { PhoneFormatDirective } from 'app/shared/directives/phone-format.directive';
import { DynamicGridDirective } from 'app/shared/directives/dynamic-grid.directive';
import { puertoRicoPhoneValidator } from 'app/shared/validators/puerto-rico-phone.validator';
import { puertoRicoZipCodeValidator } from 'app/shared/validators/puerto-rico-zip-code.validator';
import { PuertoRicoZipCodeDirective } from 'app/shared/directives/puerto-rico-zip-code.directive';
import { LatitudeDirective } from 'app/shared/directives/latitude.directive';
import { LongitudeDirective } from 'app/shared/directives/longitude.directive';
import { validateAndCleanSiteService } from 'app/shared/utils/site-service-validator';
import { DateCalculationsUtil } from 'app/shared/utils/date-calculations.util';
import { TimeValidationUtil, ServiceConfig } from 'app/shared/utils/time-validation.util';
import { FieldVisibilityUtil } from 'app/shared/utils/field-visibility.util';
import { SiteStatusModalComponent, SiteStatusModalData } from 'app/shared/components/site-status-modal/site-status-modal.component';
import { ServiceTypeByProgram } from 'app/shared/models/program/ServiceTypeByProgram';

@Component({
  selector: 'app-sites-add',
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
    MatTimepickerModule,
    MatIconModule,
    NumericOnlyDirective,
    PhoneFormatDirective,
    DynamicGridDirective,
    PuertoRicoZipCodeDirective,
    LatitudeDirective,
    LongitudeDirective,
    GenericTableComponent,
  ],
})
export class AddSitePdamComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers, OnGenericTableHandler {
  // -----------------------------------------------------------------------------------------------------
  // @ Subject de desuscripción
  // -----------------------------------------------------------------------------------------------------
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // -----------------------------------------------------------------------------------------------------
  // @ Inyecciones privadas
  // -----------------------------------------------------------------------------------------------------
  private _formBuilder = inject(UntypedFormBuilder);
  private _siteService = inject(SiteService);
  private _geoService = inject(GeoService);
  private _notificationService = inject(NotificationService);
  private _translocoService = inject(TranslocoService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _authService = inject(AuthService);
  private _groupTypeService = inject(GroupTypeService);
  private _kitchenTypeService = inject(KitchenTypeService);
  private _deliveryTypeService = inject(DeliveryTypeService);
  private _areaTypeService = inject(AreaTypeService);
  private _route = inject(ActivatedRoute);
  private _dialog = inject(MatDialog);
  private _customRouterService = inject(CustomRouterService);

  // -----------------------------------------------------------------------------------------------------
  // @ Variables
  // -----------------------------------------------------------------------------------------------------
  /** Evita que valueChanges dispare recálculo de días al hacer reset() tras guardar exitoso. */
  private _isResettingForm = false;

  // catálogos
  listCities: City[] = [];
  listRegions: Region[] = [];
  listPostalRegions: Region[] = [];

  // Yes No Options (1, 2)
  // Si (1) y No (2)
  yesNoOptions: OptionSelection[] = [];

  // Estatus Options
  // Opciones de estatus (Activo/Inactivo)
  isActiveOptions: OptionSelection[] = [];

  // Tipo de OrganizaciÓn Sitio (1), Satélite (2), Institución Residencial (3), Otros (4)
  // Organization type - Required field for site classification
  organizationTypes: OrganizationType[] = [];

  // Nivel educativo - Campo requerido para tipo de sitio (MÚLTIPLE SELECCIÓN)
  // Education level - Required field for site type (MULTIPLE SELECTION)
  educationLevels: EducationLevelResponse[] = [];

  // Centro - Campo requerido para clasificación del sitio
  // Center - Required field for site classification
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
  operatingPolicies: OperatingPolicy[] = [];

  // Tipo de cocina
  // Type of kitchen
  kitchenTypes: OptionSelection[] = [];

  // Site Location
  // Site location - Determined by group type
  siteLocations: OptionSelection[] = [];

  // Tipo de área
  // Type of area
  areaTypes: AreaType[] = [];

  // Tipo de localización
  // Type of location
  locationTypes: AreaType[] = [];

  // Tipo de grupo
  // Type of group
  groupTypes: OptionSelection[] = [];

  // Tipo de distribución / Distribution type
  // Distribution type
  distributionType: OptionSelection[] = [];

  // Lenguaje actual
  currentLang: string = 'es';

  // Propiedades para manejar grupos de niños específicos
  childGroups: SiteChildGroupRequest[] = [];

  // Tabla de servicios por grupos
  servicesTableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<any>([]),
    columnsSchema: SERVICES_COLUMNS_SCHEMA,
    displayedColumns: SERVICES_COLUMNS_SCHEMA.map((col) => col.key as string),
    addMenuShow: true,
    addMenuItems: [
      {
        id: 'add',
        label: 'sites.add.services.add-service',
        icon: 'mat_outline:add',
      },
    ],
    handler: this,
    showPaginator: true,
    pageSizeOptions: [25, 50, 100],
    pageSize: 25,
    fullScreen: false,
    viewMode: 'cards',
    operatingDaysOfWeek: [],
  };

  // Lista de grupos con sus slots de servicio (en memoria hasta el envío)
  servicesByGroups: ServiceByGroupDialogResult[] = [];

  // Configuración de tabla requerida por OnGenericTableHandler
  tableConfig: GenericTableConfig = this.servicesTableConfig;

  // Header config and reactive form
  // Configuración del header y formulario reactivo
  // Header config and reactive form
  headerConfig: GenericHeaderConfig = {
    title: 'sites.add.title',
    formGroup: this._formBuilder.group({
      // Información General / General Information
      // Nombre del sitio - Campo requerido para identificar el sitio
      // Site name - Required field for identifying the site
      name: ['', Validators.required],
      // Dirección física - Campo requerido para la ubicación del sitio
      // Physical address - Required field for site location
      address: ['', Validators.required],
      // Ciudad - Campo requerido para la ubicación del sitio
      // City - Required field for site location
      city: [null, Validators.required],
      // Región - Campo requerido para la ubicación del sitio
      // Region - Required field for site location
      region: [null, Validators.required],
      // Código postal - Campo requerido para la ubicación del sitio
      // ZIP code - Required field for site location
      zipCode: ['', [Validators.required, puertoRicoZipCodeValidator()]],
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
      postalZipCode: ['', puertoRicoZipCodeValidator()],
      // Información Administrativa / Administrative Information
      // Estado sin fines de lucro - Campo requerido que indica si el sitio es sin fines de lucro
      // Non-profit status - Required field indicating if the site is non-profit
      nonProfit: [null, Validators.required],
      // Fecha de inicio - Cuando el sitio comenzó operaciones
      // Site start date - When the site began operations
      startDate: [null],
      // Año base - Año de referencia para operaciones del sitio
      // Base year - Reference year for site operations
      // (tipo text-SOLO DISABLED)
      baseYear: [{ value: null, disabled: true }, [Validators.pattern(/^\d{4}$/)]],
      // Año de renovación - Año de renovación del contrato
      // Renewal year - Year of contract renewal
      // (tipo text-SOLO DISABLED)
      renewalYear: [{ value: null, disabled: true }, [Validators.pattern(/^\d{4}$/)]],
      // Tipo de organización - Campo requerido para clasificación del sitio
      // Organization type - Required field for site classification
      organizationType: [null, Validators.required],
      // Centro - Campo requerido para clasificación del sitio
      // Center - Required field for site classification
      centerType: [null, Validators.required],
      // Nivel educativo - Campo requerido para tipo de sitio (MÚLTIPLE SELECCIÓN)
      // Education level - Required field for site type (MULTIPLE SELECTION)
      educationLevels: [[], Validators.required],
      // Fechas de funcionamiento - Fechas desde y hasta cuando opera el sitio
      // Operating dates - Dates from and to when the site operates
      operatingFromDate: [null, Validators.required],
      operatingToDate: [null, Validators.required],
      operatingDaysCalculated: [{ value: null, disabled: true }],
      // Horas de funcionamiento - Horas de inicio y fin para los días de funcionamiento
      // Operating hours - Start and end times for operating days
      operatingStartTime: [null, Validators.required],
      operatingEndTime: [null, Validators.required],
      // Horario Académico PDAM (requerido)
      firstAcademicClassStartTime: [null, Validators.required],
      lastAcademicClassEndTime: [null, Validators.required],
      // Días de la semana en que opera el sitio (selección múltiple)
      // Days of the week the site operates (multiple selection)
      operatingDaysOfWeek: [[], Validators.required],

      // ¿Cuánto tiempo lleva el sitio ofreciendo servicios con una matrícula establecida?
      // How long has the site been providing services with an established enrollment?
      serviceTime: [null],
      // Datos Operativos / Operational Data
      // Tipo de cocina - Tipo de instalación de cocina
      // Kitchen type - Type of kitchen facility (required when group type is Dining Room)
      kitchenType: [null],
      // Site Location - Determined by Group Type
      // Site location - Determined by group type
      siteLocation: [null],
      // Tipo de grupo - Clasificación de grupos de estudiantes
      // Group type - Classification of student groups
      groupType: [null, Validators.required],
      // Tipo de distribución - Método de distribución para sitios no congregados
      // Distribution type - Distribution method for non-congregate sites
      distributionType: [{ value: null, disabled: true }],
      // Tipo de entrega - Método de entrega de servicio
      // Delivery type - Method of service delivery
      deliveryType: [null, Validators.required],
      // Tipo de auspiciador - Tipo de patrocinio del sitio
      // Sponsor type - Type of site sponsorship
      sponsorType: [null],
      // Tipo de solicitante - Tipo de solicitante del sitio
      // Type of applicant - Type of site applicant
      // Laico (15), Base de fe (16)
      typeOfApplicant: [null, Validators.required],
      // Tipo de área - Campo requerido para clasificación del sitio
      // Type of area - Required field for site classification
      // Rural (23), Urbana (24)
      // (tipo select-SOLO DISABLED - se auto-selecciona según ciudad)
      areaType: [{ value: null, disabled: true }],
      // Localización - Campo requerido para clasificación del sitio
      // Location - Required field for site classification
      // Rural (23), Urbana (24)
      // (tipo select - selección manual)
      locationType: [null, Validators.required],
      // Tipo de residencial - Campo requerido para clasificación RCCI (Pernoctan/No Pernoctan)
      // Residential type - Required field for RCCI classification (Residential/Non-residential)
      // Pernoctan (17), No Pernoctan (18)
      typeOfResidential: [null],
      // Política de operación - Directrices operativas del sitio
      // Operating policy - Site's operational guidelines
      operatingPolicy: [null],
      // Disponibilidad de almacén - Indica si el sitio tiene instalaciones de almacenamiento
      // Warehouse availability - Indicates if site has storage facilities
      hasWarehouse: [null, Validators.required],
      // Disponibilidad de comedor - Indica si el sitio tiene instalaciones de comedor
      // Dining room availability - Indicates if site has dining facilities
      hasDiningRoom: [null, Validators.required],
      // Capacidad de Salón Comedor - Solo visible cuando hasDiningRoom es true
      // Dining room capacity - Only visible when hasDiningRoom is true
      diningRoomCapacity: [null, [Validators.min(1)]],
      // Persona a Cargo (solo para PDAM)
      // Person in Charge (only for PDAM)
      personInCharge: this._formBuilder.group({
        firstName: ['', Validators.required],
        middleName: [''],
        fatherLastName: ['', Validators.required],
        motherLastName: [''],
        sitePhone: ['', [Validators.required, puertoRicoPhoneValidator()]],
        extension: [''],
        mobilePhone: ['', puertoRicoPhoneValidator()],
      }),
      // Matrícula General - Campo requerido con valor numérico
      // General Enrollment - Required numeric field
      generalEnrollment: [null, [Validators.required, Validators.pattern(/^\d+$/)]],

      // Estado activo del sitio
      // Site active status
      isActive: [true],
      // Fecha de inactivación
      // Inactivation date
      inactiveDate: [null],
      // Justificación de inactivación
      // Inactivation justification
      inactiveJustification: [''],
    }),
    // Cancel button
    cancelButtonShow: true,
    cancelButtonText: 'sites.add.buttons.cancel',
    // Settings button - Solo visible en edición
    settingsButtonShow: false,
    // Submit button
    submitButtonShow: true,
    submitButtonText: 'sites.add.buttons.save',
    submitDisabled: true, // Inicialmente deshabilitado hasta que todos los campos requeridos estén válidos
  };

  // Agregar esta propiedad
  protected readonly window = window;

  // Compare methods
  compare = compare;
  comparePostal = comparePostal;
  compareById = compareById;

  /**
   * Compara dos objetos Date por su hora (wrapper para usar en template)
   */
  compareByTimeWrapper = compareByTime;

  isLoading = false;

  // Agencia Id
  agencyId: number = 0;
  agency: AgencyResponse | null = null;

  // Propiedad para controlar visibilidad del campo Tipo de Centro
  showCenterTypeField: boolean = false;

  // Opciones de hora para los campos "hasta" - se filtran dinámicamente
  timeOptions: TimeOption[] = [];

  // Días de la semana disponibles para selección (filtrados según programa)
  // Available days of the week for selection (filtered by program)
  // Se cargan desde el backend, no hardcodeados
  availableDaysOfWeek: DayOfWeekResponse[] = [];

  // School-related properties
  schoolId: number | null = null;
  schoolName: string | null = null;

  // -----------------------------------------------------------------------------------------------------
  // @ Constructor
  // -----------------------------------------------------------------------------------------------------
  constructor() {}

  // -----------------------------------------------------------------------------------------------------
  // @ Getters
  // -----------------------------------------------------------------------------------------------------
  /** Indica si debe mostrarse el campo Tipo de cocina (cuando el tipo de grupo es Comedor). */
  get shouldShowKitchenTypeField(): boolean {
    const groupType = this.headerConfig.formGroup.get('groupType')?.value;
    if (groupType) {
      return groupType.code === 'DINING_ROOM';
    }
    return false;
  }

  /** Indica si se deben mostrar los campos de provisión (política 3, 4 o 5). */
  get shouldShowProvisionFields(): boolean {
    const operatingPolicy = this.headerConfig.formGroup.get('operatingPolicy')?.value;
    if (operatingPolicy?.id) {
      return operatingPolicy.id === 3 || operatingPolicy.id === 4 || operatingPolicy.id === 5;
    }
    return false;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ ngOnInit / ngOnDestroy
  // -----------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.currentLang = this._translocoService.getActiveLang();

    // Generar opciones de hora
    this.initializeTimeOptions();

    // Obtener Agencia desde local storage desde AuthService
    this.agencyId = this._authService.getAgencyId();

    // Agencia desde el resolver general del portal (initialDataAgencyPortalResolver)
    const initialData = this._route.snapshot.data['initialData'];
    // schoolId y schoolName desde el resolver (schoolData)
    const schoolData = this._route.snapshot.data['schoolData'];
    // Common data from the resolver (commonData)
    const commonData = this._route.snapshot.data['commonData'];
    // Program data from the resolver (programData)
    const programData = this._route.snapshot.data['programData'];

    this.schoolId = schoolData.schoolId;
    this.schoolName = schoolData.schoolName;
    this.agency = initialData?.agency;

    // Yes No Options (commonData)
    this.yesNoOptions = commonData.options.filter((option: OptionSelection) => option.optionKey === 'yesNo');
    this.isActiveOptions = commonData.options.filter((option: OptionSelection) => option.optionKey === 'isActive');
    this.typeOfResidential = commonData.options.filter((option: OptionSelection) => option.optionKey === 'typeOfResidential');
    this.typeOfApplicant = commonData.options.filter((option: OptionSelection) => option.optionKey === 'typeOfApplicant');
    this.distributionType = commonData.options.filter((option: OptionSelection) => option.optionKey === 'distributionType');
    this.siteLocations = commonData.siteLocations || [];

    // Catálogos: commonData
    this.educationLevels = commonData.educationLevels;
    this.listCities = commonData.cities;
    this.listRegions = commonData.regions;
    this.areaTypes = commonData.areaTypes;
    this.locationTypes = commonData.areaTypes;
    this.operatingPolicies = this.filterOperatingPolicies(commonData.operatingPolicies, this.agency?.isRecurrent || false);

    // Catálogos: programData (PDAM)
    this.centerTypes = programData.centerTypes;
    this.organizationTypes = programData.organizationTypes;
    this.groupTypes = programData.groupTypes;
    this.sponsorType = programData.sponsorTypes;
    this.deliveryTypes = programData.deliveryTypes;
    this.availableDaysOfWeek = programData.allowedOperatingDays;
    this.servicesTableConfig.serviceTypes = programData.serviceTypes ?? [];

    this._changeDetectorRef.markForCheck();

    // Configurar listeners y validaciones con la agencia ya cargada desde initialData
    if (this.agency) {
      this.updateValidations();
      this.setupGroupTypeListener();
    }

    // Transloco
    this._translocoService.langChanges$.pipe(takeUntil(this._unsubscribeAll)).subscribe((lang: string) => {
      this.currentLang = lang;
    });

    this.setupFormListeners();

    this.servicesTableConfig.operatingDaysOfWeek = this.headerConfig.formGroup.get('operatingDaysOfWeek')?.value ?? [];

    // Suscribirse a cambios de validación del formulario para actualizar el estado del botón de guardar
    this.headerConfig.formGroup.statusChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
      this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;
      this._changeDetectorRef.detectChanges();
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Funciones privadas
  // -----------------------------------------------------------------------------------------------------
  private setupFormListeners(): void {
    // Escuchar cambios en las fechas para calcular automáticamente los días
    this.headerConfig.formGroup.get('operatingFromDate')?.valueChanges.subscribe(() => {
      if (this._isResettingForm) return;
      DateCalculationsUtil.calculateOperatingDays(this.headerConfig.formGroup);
    });

    this.headerConfig.formGroup.get('operatingToDate')?.valueChanges.subscribe(() => {
      if (this._isResettingForm) return;
      DateCalculationsUtil.calculateOperatingDays(this.headerConfig.formGroup);
    });

    // Escuchar cambios en los días seleccionados para recalcular los días operativos y actualizar tarjetas Servicios Activos
    this.headerConfig.formGroup
      .get('operatingDaysOfWeek')
      ?.valueChanges.pipe(takeUntil(this._unsubscribeAll))
      .subscribe((value: DayOfWeekResponse[] | null) => {
        if (this._isResettingForm) return;
        DateCalculationsUtil.calculateOperatingDays(this.headerConfig.formGroup);
        this.servicesTableConfig.operatingDaysOfWeek = value ?? [];
        this._changeDetectorRef.markForCheck();
      });

    // Listener para cambios en organizationType que afectan la visibilidad del campo centerType
    this.headerConfig.formGroup.get('organizationType')?.valueChanges.subscribe((organizationType: OrganizationType) => {
      const result = FieldVisibilityUtil.updateCenterTypeFieldVisibility(this.headerConfig.formGroup, organizationType, 'centerType', this._changeDetectorRef, (disabled) => {
        this.headerConfig.submitDisabled = disabled;
      });
      this.showCenterTypeField = result.showCenterTypeField;
      this._changeDetectorRef.detectChanges();
    });

    // Listener para cambios en operatingPolicy que afectan la visibilidad de campos de provisión
    this.headerConfig.formGroup
      .get('operatingPolicy')
      ?.valueChanges.pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this._changeDetectorRef.detectChanges();
      });

    // Listener para cambios en hasDiningRoom
    this.headerConfig.formGroup
      .get('hasDiningRoom')
      ?.valueChanges.pipe(takeUntil(this._unsubscribeAll))
      .subscribe((hasDiningRoom: boolean) => {
        const capacityControl = this.headerConfig.formGroup.get('diningRoomCapacity');
        if (hasDiningRoom === false) {
          // Si cambia a false, limpiar el campo de capacidad y deshabilitar
          capacityControl?.setValue(null, { emitEvent: false });
          capacityControl?.clearValidators();
          capacityControl?.disable();
          capacityControl?.updateValueAndValidity({ emitEvent: false });
        } else if (hasDiningRoom === true) {
          capacityControl?.enable();
          // Si cambia a true, capacidad es obligatoria y mínimo 1
          capacityControl?.setValidators([Validators.required, Validators.min(1)]);
          capacityControl?.updateValueAndValidity({ emitEvent: false });
        }
        this._changeDetectorRef.detectChanges();
      });

    // Listener para cambios en diningRoomCapacity y generalEnrollment para validar
    this.headerConfig.formGroup
      .get('diningRoomCapacity')
      ?.valueChanges.pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.validateDiningRoomCapacity();
        this._changeDetectorRef.detectChanges();
      });

    this.headerConfig.formGroup
      .get('generalEnrollment')
      ?.valueChanges.pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.validateDiningRoomCapacity();
        this._changeDetectorRef.detectChanges();
      });

    // Estado inicial: deshabilitar capacidad si no tiene salón comedor
    const initialHasDiningRoom = this.headerConfig.formGroup.get('hasDiningRoom')?.value;
    if (initialHasDiningRoom !== true) {
      this.headerConfig.formGroup.get('diningRoomCapacity')?.disable({ emitEvent: false });
    }

    // Validar horas académicas cuando cambien las horas de funcionamiento
    const operatingStartControl = this.headerConfig.formGroup.get('operatingStartTime');
    const operatingEndControl = this.headerConfig.formGroup.get('operatingEndTime');
    merge(operatingStartControl?.valueChanges ?? [], operatingEndControl?.valueChanges ?? [])
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => this.validateAcademicTimesWithinOperatingHours());
  }

  /**
   * Valida que firstAcademicClassStartTime y lastAcademicClassEndTime estén dentro del rango de funcionamiento.
   */
  private validateAcademicTimesWithinOperatingHours(): void {
    const group = this.headerConfig.formGroup;
    const operatingStartTime = group.get('operatingStartTime')?.value;
    const operatingEndTime = group.get('operatingEndTime')?.value;
    const firstControl = group.get('firstAcademicClassStartTime');
    const lastControl = group.get('lastAcademicClassEndTime');

    if (!firstControl || !lastControl) {
      return;
    }

    const firstValid = isTimeWithinOperatingRange(firstControl.value, operatingStartTime, operatingEndTime);

    const lastValid = isTimeWithinOperatingRange(lastControl.value, operatingStartTime, operatingEndTime);

    // First academic class start time
    if (firstValid) {
      const err = firstControl.errors;
      if (err?.['outsideOperatingHours']) {
        const { outsideOperatingHours: _, ...rest } = err;
        firstControl.setErrors(Object.keys(rest).length ? rest : null);
      }
    } else {
      firstControl.setErrors({ ...(firstControl.errors ?? {}), outsideOperatingHours: true });
    }

    // Last academic class end time
    if (lastValid) {
      const err = lastControl.errors;
      if (err?.['outsideOperatingHours']) {
        const { outsideOperatingHours: _, ...rest } = err;
        lastControl.setErrors(Object.keys(rest).length ? rest : null);
      }
    } else {
      lastControl.setErrors({ ...(lastControl.errors ?? {}), outsideOperatingHours: true });
    }

    // Update value and validity
    firstControl.updateValueAndValidity({ emitEvent: false });
    lastControl.updateValueAndValidity({ emitEvent: false });
    this._changeDetectorRef.detectChanges();
  }

  /**
   * Genera todas las opciones de hora (cada 30 minutos)
   */
  private initializeTimeOptions(): void {
    this.timeOptions = generateTimeOptions();
  }

  /**
   * Obtiene las opciones filtradas para un campo "hasta" basado en la hora "desde"
   * NOTA: Este método también se usa para operatingEndTime, por lo que NO se comenta
   */
  getEndTimeOptions(fromField: string): TimeOption[] {
    const fromControl = this.headerConfig.formGroup.get(fromField);
    if (!fromControl) return this.timeOptions;

    const fromTime = fromControl.value;
    const operatingStartTime = this.headerConfig.formGroup.get('operatingStartTime')?.value;
    const operatingEndTime = this.headerConfig.formGroup.get('operatingEndTime')?.value;

    return getEndTimeOptions(this.timeOptions, fromTime, '23:59', operatingStartTime, operatingEndTime);
  }

  /**
   * Opciones para "Inicio de la Primera Clase Académica": solo horas dentro del rango de funcionamiento.
   */
  getAcademicStartTimeOptions(): TimeOption[] {
    const operatingStartTime = this.headerConfig.formGroup.get('operatingStartTime')?.value;
    const operatingEndTime = this.headerConfig.formGroup.get('operatingEndTime')?.value;
    return filterStartTimeOptions(this.timeOptions, operatingStartTime, operatingEndTime);
  }

  /**
   * Opciones para "Finalización de la Última Clase Académica": dentro del rango de funcionamiento;
   * si hay "Inicio" seleccionado, solo horas posteriores.
   */
  getAcademicEndTimeOptions(fromField: string): TimeOption[] {
    const fromControl = this.headerConfig.formGroup.get(fromField);
    const fromTime = fromControl?.value ?? null;
    const operatingStartTime = this.headerConfig.formGroup.get('operatingStartTime')?.value;
    const operatingEndTime = this.headerConfig.formGroup.get('operatingEndTime')?.value;
    return getEndTimeOptions(this.timeOptions, fromTime, '23:59', operatingStartTime, operatingEndTime);
  }

  /**
   * Convierte string HH:mm a objeto Date (wrapper para usar en template)
   */
  timeStringToDateWrapper(timeString: string): Date | null {
    return timeStringToDate(timeString);
  }

  /** Muestra el diálogo de elegibilidad CFR cuando el usuario selecciona "No" en sin fines de lucro. */
  nonProfitChange(event?: any): void {
    const nonProfitValue = event?.value !== undefined ? event.value : this.headerConfig.formGroup.value.nonProfit;

    if (nonProfitValue !== false) {
      return;
    }

    this._dialog.open(CfrInfoDialogComponent, {
      data: {
        title: this._translocoService.translate('sites.add.pdam-not-eligible.title'),
        message: this._translocoService.translate('sites.add.pdam-not-eligible.message'),
        cfrLink: {
          url: 'https://www.ecfr.gov/current/title-7/subtitle-B/chapter-II/subchapter-A/part-210#p-210.9(b)(1)',
          text: this._translocoService.translate('sites.add.pdam-not-eligible.cfr-link-text'),
        },
      },
      disableClose: false,
      panelClass: ['mat-dialog-container', 'dialog-responsive'],
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  private setupGroupTypeListener(): void {
    // Listener para cambios en groupType que afectan siteLocation, kitchenType y deliveryTypes
    this.headerConfig.formGroup.get('groupType')?.valueChanges.subscribe((groupType) => {
      this.getSiteLocationByGroupType(groupType);
      this.loadDeliveryTypesByGroupType(groupType);

      const kitchenTypeControl = this.headerConfig.formGroup.get('kitchenType');

      if (groupType) {
        const isComedor = groupType.code === 'DINING_ROOM';
        if (!isComedor) {
          // Si no es "Comedor", limpiar el valor, opciones y validaciones de tipo de cocina
          this.headerConfig.formGroup.patchValue({ kitchenType: null });
          this.kitchenTypes = [];
          kitchenTypeControl?.clearValidators();
          kitchenTypeControl?.updateValueAndValidity({ emitEvent: false });
        } else {
          // Para "Comedor", tipo de cocina es obligatorio
          kitchenTypeControl?.setValidators([Validators.required]);
          kitchenTypeControl?.updateValueAndValidity({ emitEvent: false });
        }
      } else {
        // Sin tipo de grupo seleccionado, limpiar también cocina
        this.headerConfig.formGroup.patchValue({ kitchenType: null });
        this.kitchenTypes = [];
        kitchenTypeControl?.clearValidators();
        kitchenTypeControl?.updateValueAndValidity({ emitEvent: false });
      }

      this._changeDetectorRef.detectChanges();
    });
  }

  private updateValidations(): void {
    // Restaurar validaciones requeridas
    this.restoreRequiredValidations();
  }

  private restoreRequiredValidations(): void {
    // Restaurar validaciones requeridas para campos básicos
    const requiredFields = {
      name: [Validators.required],
      address: [Validators.required],
      city: [Validators.required],
      region: [Validators.required],
      zipCode: [Validators.required, puertoRicoZipCodeValidator()], // Incluir validador personalizado
      latitude: [Validators.required],
      longitude: [Validators.required],
      postalCity: [Validators.required],
      nonProfit: [Validators.required],
      organizationType: [Validators.required],
      locationType: [Validators.required],
    };

    Object.keys(requiredFields).forEach((fieldName) => {
      const control = this.headerConfig.formGroup.get(fieldName);
      if (control) {
        control.setValidators(requiredFields[fieldName]);
        control.updateValueAndValidity();
      }
    });

    // educationLevels es requerido
    const educationLevelsControl = this.headerConfig.formGroup.get('educationLevels');
    if (educationLevelsControl) {
      educationLevelsControl.setValidators([Validators.required]);
      educationLevelsControl.updateValueAndValidity();
    }

    // personInCharge es requerido
    this.updatePersonInChargeValidations();

    // Actualizar el estado del botón después de restaurar las validaciones
    this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;
    this._changeDetectorRef.detectChanges();
  }

  /**
   * Actualiza las validaciones requeridas del grupo personInCharge.
   */
  private updatePersonInChargeValidations(): void {
    const personInChargeGroup = this.headerConfig.formGroup.get('personInCharge') as FormGroup;

    if (!personInChargeGroup) {
      return;
    }

    // Restaurar validaciones requeridas
    const firstNameControl = personInChargeGroup.get('firstName');
    const fatherLastNameControl = personInChargeGroup.get('fatherLastName');
    const sitePhoneControl = personInChargeGroup.get('sitePhone');

    if (firstNameControl) {
      firstNameControl.setValidators([Validators.required]);
      firstNameControl.updateValueAndValidity();
    }

    if (fatherLastNameControl) {
      fatherLastNameControl.setValidators([Validators.required]);
      fatherLastNameControl.updateValueAndValidity();
    }

    if (sitePhoneControl) {
      sitePhoneControl.setValidators([Validators.required, puertoRicoPhoneValidator()]);
      sitePhoneControl.updateValueAndValidity();
    }

    // mobilePhone solo tiene validación de formato, no requerido
    const mobilePhoneControl = personInChargeGroup.get('mobilePhone');
    if (mobilePhoneControl) {
      mobilePhoneControl.setValidators([puertoRicoPhoneValidator()]);
      mobilePhoneControl.updateValueAndValidity();
    }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Funciones On (componentes genéricos)
  // -----------------------------------------------------------------------------------------------------
  /** Envía el formulario de alta de sitio. */
  onSubmit() {
    // Protección contra doble clic: si ya está cargando, ignorar
    if (this.isLoading) return;

    // Validar formulario
    if (this.headerConfig.formGroup.invalid) {
      // Log detallado de campos inválidos usando función utilitaria
      logFormValidationErrors(this.headerConfig.formGroup, 'Formulario de Sitio');

      this._notificationService.showError(this._translocoService.translate('sites.validation.incompleteFields'));
      this.headerConfig.formGroup.markAllAsTouched();
      return;
    }

    // Recalcular Total de Días de Funcionamiento antes de guardar (deshabilitado: no recalcular en submit)
    // DateCalculationsUtil.calculateOperatingDays(this.headerConfig.formGroup);

    // Usar getRawValue() para obtener todos los valores, incluyendo campos deshabilitados
    const formValues = this.headerConfig.formGroup.getRawValue();
    // Ciudad
    const cityId: number = formValues.city?.id;
    // Región
    const regionId: number = formValues.region?.id;
    // Ciudad postal
    const postalCityId: number = formValues.postalCity?.id;
    // Región postal
    const postalRegionId: number = formValues.postalRegion?.id;
    // Niveles educativos (MÚLTIPLE SELECCIÓN)
    const educationLevelIds: number[] = formValues.educationLevels?.map((level: any) => level.id) || [];
    // Tipo de organización
    const organizationTypeId: number = formValues.organizationType?.id;
    // Días de operación
    // Tipo de cocina
    const kitchenTypeId: number = formValues.kitchenType?.id;
    // Site Location
    const siteLocationId: number = formValues.siteLocation?.id;
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

    // Tipo de área
    const areaTypeId: number = formValues.areaType?.id;

    // Tipo de localización
    const locationTypeId: number = formValues.locationType?.id;

    // Fechas de operación
    const operatingFromDate: string = formValues.operatingFromDate;
    const operatingToDate: string = formValues.operatingToDate;
    // Días de operación
    const operatingDaysCalculated: number = formValues.operatingDaysCalculated;
    // Horas de funcionamiento
    const operatingStartTime: string = toTimeString(formValues.operatingStartTime);
    const operatingEndTime: string = toTimeString(formValues.operatingEndTime);
    const firstAcademicClassStartTime: string | null = formValues.firstAcademicClassStartTime ? toTimeString(formValues.firstAcademicClassStartTime) : null;
    const lastAcademicClassEndTime: string | null = formValues.lastAcademicClassEndTime ? toTimeString(formValues.lastAcademicClassEndTime) : null;

    // Obtener los días permitidos de la agencia
    const operatingDaysOfWeekIds: number[] = formValues.operatingDaysOfWeek.map((day: DayOfWeekResponse) => day.id);

    // Obtener los valores del formulario
    const siteRequest: SiteRequest = {
      // School Id - ID de la escuela asociada (si viene del modal)
      schoolId: this.schoolId,
      // Agencia Id
      agencyId: this.agencyId,
      // Información General / General Information
      // Nombre del sitio - Campo requerido para identificar el sitio
      // Site name - Required field for identifying the site
      name: formValues.name,
      // Dirección física - Campo requerido para la ubicación del sitio
      // Physical address - Required field for site location
      address: formValues.address,
      // Ciudad - Campo requerido para la ubicación del sitio
      // City - Required field for site location
      cityId: cityId,
      // Región - Campo requerido para la ubicación del sitio
      // Region - Required field for site location
      regionId: regionId,
      // Código postal - Campo requerido para la ubicación del sitio
      // ZIP code - Required field for site location
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
      // Tipo de organización - Campo requerido para clasificación del sitio
      // Organization type - Required field for site classification
      organizationTypeId: organizationTypeId,
      // Tipo de centro - Campo requerido para clasificación del sitio (Orfanato/Centro de tratamiento residencial para salud mental/Centro Correccional Juvenil)
      // Center type - Required field for site classification
      centerTypeId: centerTypeId,
      // Fechas de funcionamiento - Fechas desde y hasta cuando opera el sitio
      // Operating dates - Dates from and to when the site operates
      operatingFromDate: operatingFromDate ?? null,
      operatingToDate: operatingToDate ?? null,
      operatingDaysCalculated: operatingDaysCalculated ?? null,
      // Días de la semana en que opera el sitio
      // Days of the week the site operates
      operatingDaysOfWeek: operatingDaysOfWeekIds,
      // Horas de funcionamiento
      operatingStartTime: operatingStartTime ?? null,
      operatingEndTime: operatingEndTime ?? null,
      firstAcademicClassStartTime: firstAcademicClassStartTime ?? undefined,
      lastAcademicClassEndTime: lastAcademicClassEndTime ?? undefined,
      // ¿Cuánto tiempo lleva el sitio ofreciendo servicios con una matrícula establecida?
      // How long has the site been providing services with an established enrollment?
      serviceTime: formValues.serviceTime ?? null,
      // Información Operacional / Operational Information
      // Tipo de cocina - Campo requerido para servicio de alimentos
      // Kitchen type - Required field for food service
      kitchenTypeId: kitchenTypeId,
      // Site Location - Campo requerido determinado por Group Type
      // Site location - Required field determined by Group Type
      siteLocationId: siteLocationId,
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
      // Tipo de área - Campo requerido para clasificación
      // Type of area - Required field for classification
      areaTypeId: areaTypeId,
      // Tipo de localización - Campo requerido para clasificación
      // Location type - Required field for classification
      locationTypeId: locationTypeId,
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
      diningRoomCapacity: formValues.diningRoomCapacity ?? null,
      // Persona a Cargo (solo para PDAM)
      // Person in Charge (only for PDAM)
      personInCharge: formValues.personInCharge
        ? {
            firstName: formValues.personInCharge.firstName ?? null,
            middleName: formValues.personInCharge.middleName ?? null,
            fatherLastName: formValues.personInCharge.fatherLastName ?? null,
            motherLastName: formValues.personInCharge.motherLastName ?? null,
            sitePhone: formValues.personInCharge.sitePhone ?? null,
            extension: formValues.personInCharge.extension ?? null,
            mobilePhone: formValues.personInCharge.mobilePhone ?? null,
          }
        : null,
      // Matrícula General
      // General Enrollment
      generalEnrollment: formValues.generalEnrollment ?? null,

      // IDs de programas de la agencia para determinar lógica de días de funcionamiento
      // Agency program IDs to determine operating days logic
      programIds: this.agency?.programs?.map((p: any) => p.id) || [],
    };

    // ===== CREAR SITE EDUCATION LEVEL REQUEST =====
    // Crear SiteEducationLevelRequest para cada nivel educativo seleccionado
    if (educationLevelIds.length > 0) {
      siteRequest.educationLevels = educationLevelIds.map((id) => {
        const educationLevelRequest: SiteEducationLevelRequest = {
          siteId: 0, // Se asignará cuando se cree el sitio
          educationLevelId: id,
          isActive: true,
        };
        return educationLevelRequest;
      });
    }

    // Validar y sincronizar grupos si hay servicios por grupos
    if (this.servicesByGroups.length > 0) {
      // Validar que todos los servicios tengan groupName
      const servicesWithoutGroup = this.servicesByGroups.filter((s) => !s.groupName || s.groupName.trim() === '');
      if (servicesWithoutGroup.length > 0) {
        this._notificationService.showError(this._translocoService.translate('sites.validation.services-require-group-name'));
        return;
      }

      // Sincronizar grupos desde servicios antes de enviar
      this.syncChildGroupsFromServices();

      // Validar que haya grupos si hay servicios
      if (this.childGroups.length === 0) {
        this._notificationService.showError(this._translocoService.translate('sites.validation.require-at-least-one-group'));
        return;
      }

      if (!this.validateGroupsEnrollmentAndCapacity()) {
        return;
      }
    }

    // Agregar grupos de niños con serviceSlots (los servicios van dentro de cada grupo)
    if (this.childGroups.length > 0) {
      siteRequest.childGroups = this.childGroups;
    }

    this.isLoading = true;

    // Disable the form
    this.headerConfig.formGroup.disable();

    this._siteService.insertSite(siteRequest, null).subscribe({
      next: (result: any) => {
        switch (result.body) {
          case true:
            this.isLoading = false;
            this._isResettingForm = true;
            this.headerConfig.formGroup.reset();
            this._isResettingForm = false;

            const baseYearControl = this.headerConfig.formGroup.get('baseYear');
            const renewalYearControl = this.headerConfig.formGroup.get('renewalYear');

            if (baseYearControl) {
              baseYearControl.disable();
              baseYearControl.setValue(null);
            }
            if (renewalYearControl) {
              renewalYearControl.disable();
              renewalYearControl.setValue(null);
            }

            this._notificationService.showSuccessDialogWithCallback('sites.add.success', (result) => {
              if (result === 'confirmed') {
                // Navegar a la ruta correcta según el programa
                this._customRouterService.navigate(['schools']);
              }
            });
            break;
          default:
            this.isLoading = false;
            this._notificationService.showErrorDialog();
            break;
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        const body = err?.error as BaseApiException | undefined;
        if (
          err?.status === 400 &&
          (body?.code === ErrorCode.FIRST_SITE_MUST_BE_COMEDOR || body?.code === ErrorCode.SCHOOL_MUST_HAVE_COMEDOR_FIRST || body?.code === ErrorCode.SITE_DATES_OUTSIDE_COMEDOR_RANGE) &&
          body?.message
        ) {
          this._notificationService.showWarningDialogWithRawMessage(body.message);
        } else {
          const message = getApiErrorMessage(err);
          if (message) {
            this._notificationService.showErrorDialogWithRawMessage(message);
          } else {
            this._notificationService.showErrorDialog('dialog.error.no-response');
          }
        }
        this.headerConfig.formGroup.enable({ emitEvent: false });
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  // Método para cancelar la operación
  onCancel(event: Event) {
    // Navegar a la ruta correcta según el programa
    this._customRouterService.navigate(['schools']);
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
    const currentIsActive = this.headerConfig.formGroup.get('isActive')?.value ?? true;
    const currentInactiveDate = this.headerConfig.formGroup.get('inactiveDate')?.value ?? null;
    const currentInactiveJustification = this.headerConfig.formGroup.get('inactiveJustification')?.value ?? null;

    const dialogRef = this._dialog.open(SiteStatusModalComponent, {
      data: {
        isActive: currentIsActive,
        inactiveDate: currentInactiveDate,
        inactiveJustification: currentInactiveJustification,
        isActiveOptions: this.isActiveOptions,
        yesNoOptions: this.yesNoOptions,
      } as SiteStatusModalData,
      disableClose: false,
      width: '600px',
      maxWidth: '90vw',
      panelClass: ['mat-dialog-container', 'dialog-responsive'],
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action === 'submit') {
        // Actualizar el formulario con los valores del modal
        this.headerConfig.formGroup.get('isActive')?.setValue(result.isActive);
        this.headerConfig.formGroup.get('inactiveDate')?.setValue(result.inactiveDate);
        this.headerConfig.formGroup.get('inactiveJustification')?.setValue(result.inactiveJustification);

        // Manejar validaciones condicionales
        if (result.isActive === false) {
          // Si está inactivo, requerir fecha y justificación
          this.headerConfig.formGroup.get('inactiveDate')?.setValidators([Validators.required]);
          this.headerConfig.formGroup.get('inactiveJustification')?.setValidators([Validators.required]);
        } else {
          // Si está activo, limpiar validadores y valores
          this.headerConfig.formGroup.get('inactiveDate')?.clearValidators();
          this.headerConfig.formGroup.get('inactiveJustification')?.clearValidators();
          this.headerConfig.formGroup.get('inactiveDate')?.setValue(null);
          this.headerConfig.formGroup.get('inactiveJustification')?.setValue('');
        }

        this.headerConfig.formGroup.get('inactiveDate')?.updateValueAndValidity();
        this.headerConfig.formGroup.get('inactiveJustification')?.updateValueAndValidity();
      }
    });
  }

  // Método para agregar un sitio satélite
  onTableAddSatelliteSite(event: Event, element: any) {
    console.log('onTableAddSatelliteSite', event, element);
  }

  /** Obtiene los tipos de cocina según el tipo de grupo; el servidor devuelve lista vacía si no aplica. */
  getKitchenTypesByGroupType(groupType: OptionSelection): void {
    const kitchenTypeControl = this.headerConfig.formGroup.get('kitchenType');

    if (!groupType) {
      this.kitchenTypes = [];
      this.headerConfig.formGroup.patchValue({ kitchenType: null });
      kitchenTypeControl?.enable();
      return;
    }

    kitchenTypeControl?.enable();

    const queryParameters: QueryParameters = {
      groupTypeId: groupType.id,
      programId: PROGRAM_IDS.PDAM,
    };

    this._kitchenTypeService.getKitchenTypesByGroupType(queryParameters).subscribe({
      next: (response) => {
        this.kitchenTypes = response?.body ?? [];

        if (this.kitchenTypes.length === 0) {
          this.headerConfig.formGroup.patchValue({ kitchenType: null });
        } else if (this.kitchenTypes.length === 1) {
          this.headerConfig.formGroup.patchValue({ kitchenType: this.kitchenTypes[0] });
        } else {
          this.headerConfig.formGroup.patchValue({ kitchenType: null });
        }

        this._changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar los tipos de cocina:', error);
        this.kitchenTypes = [];
        this.headerConfig.formGroup.patchValue({ kitchenType: null });
        this._changeDetectorRef.detectChanges();
      },
    });
  }

  // Método para obtener el tipo de área según la ciudad seleccionada
  // Get area type by city
  /**
   * Carga los tipos de entrega según el tipo de grupo seleccionado
   */
  private loadDeliveryTypesByGroupType(groupType: any): void {
    if (!groupType || !groupType.id) {
      // Si no hay tipo de grupo, limpiar deliveryTypes
      this.deliveryTypes = [];
      this.headerConfig.formGroup.patchValue({ deliveryType: null });
      this._changeDetectorRef.detectChanges();
      return;
    }

    const queryParameters: QueryParameters = {
      groupTypeId: groupType.id,
      programId: PROGRAM_IDS.PDAM,
    };

    this._deliveryTypeService.getDeliveryTypesByGroupType(queryParameters).subscribe({
      next: (response) => {
        if (response && response.body) {
          this.deliveryTypes = response.body;
          // Solo limpiar si el valor actual ya no es válido para este tipo de grupo (evita borrar por respuesta tardía o tras error al guardar)
          const currentDeliveryType = this.headerConfig.formGroup.get('deliveryType')?.value;
          if (currentDeliveryType) {
            const isValid = this.deliveryTypes.some((dt: DeliveryType) => dt.id === currentDeliveryType.id);
            if (!isValid) {
              this.headerConfig.formGroup.patchValue({ deliveryType: null });
            }
          }
          this._changeDetectorRef.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error al cargar los tipos de entrega:', error);
        this._notificationService.showError(this._translocoService.translate('sites.error.loadDeliveryTypes'));
      },
    });
  }

  getAreaTypeByCity(city: City): void {
    if (!city) {
      return;
    }

    const queryParameters: QueryParameters = {
      cityId: city.id,
    };

    this._areaTypeService.getAreaTypeByCity(queryParameters).subscribe({
      next: (response) => {
        if (response && response.body && response.body.length > 0) {
          // Auto-seleccionar el tipo de área obtenido
          const areaType = response.body[0]; // Debería haber solo un tipo de área por ciudad
          this.headerConfig.formGroup.patchValue({ areaType: areaType });
          this._changeDetectorRef.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error al obtener el tipo de área para la ciudad:', error);
      },
    });
  }

  // Método para obtener tipos de centro según el programa seleccionado
  // Get center types by program

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
          } else if (target === 'postalRegion') {
            this.listPostalRegions = response.body.data;
            const regionControl = this.headerConfig.formGroup.get('postalRegion');
            if (regionControl) {
              // Preservar el valor actual si ya está establecido y es válido
              const currentPostalRegion = regionControl.value;
              const isValidCurrentRegion = currentPostalRegion && this.listPostalRegions.some((r) => r.id === currentPostalRegion.id);

              if (this.listPostalRegions.length === 1) {
                // Asignar automáticamente la única región encontrada para Dirección Postal
                this.headerConfig.formGroup.patchValue({ postalRegion: this.listPostalRegions[0] });
              } else if (isValidCurrentRegion) {
                // Mantener el valor actual si es válido
                // No hacer nada, el valor ya está establecido
              } else {
                // Solo limpiar si no hay un valor válido establecido
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
      // Obtener los valores de la dirección física
      const physicalAddress = this.headerConfig.formGroup.value.address;
      const physicalCity = this.headerConfig.formGroup.value.city;
      const physicalRegion = this.headerConfig.formGroup.value.region;
      const physicalZipCode = this.headerConfig.formGroup.value.zipCode;

      // PRIMERO sincronizar la lista de regiones postales con las regiones físicas
      // Esto debe hacerse ANTES de establecer los valores para que el select funcione
      if (physicalCity && physicalRegion) {
        this.listPostalRegions = [...this.listRegions];

        // Buscar la región en la lista para asegurar que sea la misma referencia
        const matchingRegion = this.listPostalRegions.find((r) => r.id === physicalRegion.id);
        const regionToSet = matchingRegion || physicalRegion;

        // Establecer los valores después de sincronizar la lista
        this.headerConfig.formGroup.patchValue(
          {
            postalAddress: physicalAddress,
            postalCity: physicalCity,
            postalRegion: regionToSet, // Usar la región de la lista para que coincida exactamente
            postalZipCode: physicalZipCode,
          },
          { emitEvent: false },
        ); // emitEvent: false para evitar que se dispare valueChange en postalCity

        // Forzar detección de cambios para actualizar la vista
        this._changeDetectorRef.detectChanges();
      } else {
        // Si no hay ciudad o región, solo copiar lo que hay
        this.headerConfig.formGroup.patchValue(
          {
            postalAddress: physicalAddress,
            postalCity: physicalCity,
            postalZipCode: physicalZipCode,
          },
          { emitEvent: false },
        );
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
   * Maneja la selección de tipo de entrega con notificación de permiso
   */
  onDeliveryTypeChange(selectedDeliveryType: DeliveryType): void {
    if (selectedDeliveryType && selectedDeliveryType.requiresPermission) {
      this.showPermissionRequestDialog(selectedDeliveryType);
    }
  }

  /**
   * Muestra el diálogo de solicitud de permiso
   */
  private showPermissionRequestDialog(deliveryType: DeliveryType): void {
    const dialogRef = this._dialog.open(PermissionRequestDialogComponent, {
      width: '500px',
      data: {
        deliveryTypeName: this.currentLang === 'es' ? deliveryType.name : deliveryType.nameEN,
        deliveryTypeNameEN: deliveryType.nameEN,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'yes') {
        this.showPermissionRequestFormDialog(deliveryType);
      } else if (result === 'no') {
        // Si el usuario dice "No", deseleccionar el tipo de entrega
        this.headerConfig.formGroup.patchValue({
          deliveryType: null,
        });
      }
    });
  }

  /**
   * Muestra el formulario de solicitud de permiso
   */
  private showPermissionRequestFormDialog(deliveryType: DeliveryType): void {
    const dialogRef = this._dialog.open(PermissionRequestFormDialogComponent, {
      width: '600px',
      data: {
        deliveryTypeName: this.currentLang === 'es' ? deliveryType.name : deliveryType.nameEN,
        deliveryTypeNameEN: deliveryType.nameEN,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action === 'submit') {
        // Aquí se implementaría la lógica para enviar la solicitud de permiso
        // Por ahora, solo mostramos un mensaje de confirmación
        this._notificationService.showSuccess(this._translocoService.translate('sites.success.permissionRequestSent'));

        // El usuario puede continuar con el tipo de entrega seleccionado
        // No necesitamos hacer nada más aquí
      } else if (result && result.action === 'cancel') {
        // Si el usuario cancela, deseleccionar el tipo de entrega
        this.headerConfig.formGroup.patchValue({
          deliveryType: null,
        });
      }
    });
  }

  // Método para obtener Site Location según el tipo de grupo seleccionado
  // Get site location by group type
  getSiteLocationByGroupType(groupType: OptionSelection): void {
    const siteLocationControl = this.headerConfig.formGroup.get('siteLocation');

    if (!groupType) {
      this.siteLocations = [];
      siteLocationControl?.enable();
      return;
    }

    // Habilitar el control para todos los tipos de grupo
    siteLocationControl?.enable();

    const queryParameters: QueryParameters = {
      groupTypeId: groupType.id,
    };

    this._groupTypeService.getSiteLocationByGroupType(queryParameters).subscribe({
      next: (response) => {
        if (response) {
          this.siteLocations = response.body;

          // Auto-seleccionar el Site Location obtenido (solo hay uno por Group Type)
          if (this.siteLocations && this.siteLocations.length > 0) {
            this.headerConfig.formGroup.patchValue({ siteLocation: this.siteLocations[0] });
          }

          this._changeDetectorRef.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error al cargar Site Location:', error);
      },
    });
  }

  // ===== MÉTODOS PARA DESARROLLO - CONTROL MANUAL DE PROGRAMAS =====

  /** Determina si se debe mostrar el campo de capacidad de salón comedor. */
  shouldShowDiningRoomCapacity(): boolean {
    return this.headerConfig.formGroup.get('hasDiningRoom')?.value === true;
  }

  /**
   * Determina si se deben mostrar campos adicionales para diferentes grupos
   * Se muestra cuando la capacidad del salón comedor es menor que la matrícula general
   */
  shouldShowDifferentGroupsFields(): boolean {
    return true; // Tabla siempre habilitada
  }

  /**
   * Determina si se deben mostrar servicios por grupos
   * Solo se muestra cuando la capacidad es menor que la matrícula general
   */
  shouldShowServicesByGroups(): boolean {
    const hasDiningRoom = this.headerConfig.formGroup.get('hasDiningRoom')?.value === true;
    const capacity = this.headerConfig.formGroup.get('diningRoomCapacity')?.value;
    const enrollment = this.headerConfig.formGroup.get('generalEnrollment')?.value;
    const capacityNum = Number(capacity);
    const enrollmentNum = Number(enrollment);
    return hasDiningRoom && capacity != null && enrollment != null && !Number.isNaN(capacityNum) && !Number.isNaN(enrollmentNum) && capacityNum < enrollmentNum;
  }

  /**
   * Valida que la capacidad del salón comedor no sea mayor que la matrícula general
   */
  private validateDiningRoomCapacity(): void {
    const capacityControl = this.headerConfig.formGroup.get('diningRoomCapacity');
    if (capacityControl?.hasError('max')) {
      const errors = { ...capacityControl.errors };
      delete errors['max'];
      capacityControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
    }
  }

  /**
   * Valida que la suma de niños en los grupos no supere la matrícula general
   * y que cada grupo no supere la capacidad del salón (cuando hay salón comedor).
   * @returns false si la validación falla (y muestra el mensaje de error)
   */
  private validateGroupsEnrollmentAndCapacity(): boolean {
    const generalEnrollment = this.headerConfig.formGroup.get('generalEnrollment')?.value;
    const hasDiningRoom = this.headerConfig.formGroup.get('hasDiningRoom')?.value === true;
    const diningRoomCapacity = this.headerConfig.formGroup.get('diningRoomCapacity')?.value;
    const totalChildren = this.servicesByGroups.reduce((sum, g) => sum + Number(g.numberOfChildren ?? 0), 0);
    const maxEnrollment = Number(generalEnrollment);
    if (maxEnrollment != null && !Number.isNaN(maxEnrollment) && totalChildren > maxEnrollment) {
      this._notificationService.showErrorDialog('sites.add.groups.total-exceeds-enrollment');
      return false;
    }
    if (hasDiningRoom && diningRoomCapacity != null) {
      const capacityNum = Number(diningRoomCapacity);
      const exceeds = this.servicesByGroups.some((g) => Number(g.numberOfChildren ?? 0) > capacityNum);
      if (exceeds) {
        this._notificationService.showErrorDialog('sites.add.groups.group-exceeds-capacity');
        return false;
      }
    }
    return true;
  }

  // ===== MÉTODOS PARA MANEJO DE TABLA DE SERVICIOS POR GRUPOS =====

  onAddMenuAction(menuItemId: string): void {
    if (menuItemId === 'add') {
      this.onTableAdd();
    }
  }

  onTableAdd(): void {
    const hasDiningRoom = this.headerConfig.formGroup.get('hasDiningRoom')?.value === true;
    if (hasDiningRoom) {
      const diningRoomCapacityVal = this.headerConfig.formGroup.get('diningRoomCapacity')?.value;
      if (diningRoomCapacityVal == null || diningRoomCapacityVal === '' || Number(diningRoomCapacityVal) < 1) {
        this._notificationService.showErrorDialog('sites.add.groups.dining-room-capacity-required');
        return;
      }
    }
    const generalEnrollment = this.headerConfig.formGroup.get('generalEnrollment')?.value;
    const diningRoomCapacity = this.headerConfig.formGroup.get('diningRoomCapacity')?.value;
    const operatingStartTime = this.headerConfig.formGroup.get('operatingStartTime')?.value;
    const operatingEndTime = this.headerConfig.formGroup.get('operatingEndTime')?.value;
    const programData = this._route.snapshot.data['programData'] as { serviceTypes?: unknown[] } | undefined;
    const dialogRef = this._dialog.open(AddServiceByGroupModalComponent, {
      data: {
        isEdit: false,
        yesNoOptions: this.yesNoOptions,
        generalEnrollment: generalEnrollment,
        diningRoomCapacity: diningRoomCapacity,
        existingGroups: this.servicesByGroups.map((s) => ({ id: s.id, numberOfChildren: s.numberOfChildren })),
        isPDAM: true,
        isPACNA: false,
        isPSAV: false,
        operatingStartTime: operatingStartTime,
        operatingEndTime: operatingEndTime,
        serviceTypes: programData?.serviceTypes ?? [],
      } as ServiceByGroupDialogData,
      width: '90vw',
      maxWidth: '1200px',
      height: '90vh',
      maxHeight: '800px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: ServiceByGroupDialogResult) => {
      if (result) {
        const newId = this.servicesByGroups.length > 0 ? Math.max(...this.servicesByGroups.map((s) => s.id || 0)) + 1 : 1;
        this.servicesByGroups.push({ ...result, id: newId });
        this.updateServicesTableDataSource();
        this.syncChildGroupsFromServices();
      }
    });
  }

  onTableEdit(event: Event, id: number): void {
    const serviceToEdit = this.servicesByGroups.find((s) => s.id === id);
    if (!serviceToEdit) {
      this._notificationService.showError('sites.add.services.error.service-not-found');
      return;
    }
    const hasDiningRoom = this.headerConfig.formGroup.get('hasDiningRoom')?.value === true;
    if (hasDiningRoom) {
      const diningRoomCapacityVal = this.headerConfig.formGroup.get('diningRoomCapacity')?.value;
      if (diningRoomCapacityVal == null || diningRoomCapacityVal === '' || Number(diningRoomCapacityVal) < 1) {
        this._notificationService.showErrorDialog('sites.add.groups.dining-room-capacity-required');
        return;
      }
    }
    const generalEnrollment = this.headerConfig.formGroup.get('generalEnrollment')?.value;
    const diningRoomCapacity = this.headerConfig.formGroup.get('diningRoomCapacity')?.value;
    const operatingStartTime = this.headerConfig.formGroup.get('operatingStartTime')?.value;
    const operatingEndTime = this.headerConfig.formGroup.get('operatingEndTime')?.value;
    const programData = this._route.snapshot.data['programData'] as { serviceTypes?: unknown[] } | undefined;
    const dialogRef = this._dialog.open(AddServiceByGroupModalComponent, {
      data: {
        id: serviceToEdit.id,
        groupName: serviceToEdit.groupName,
        numberOfChildren: serviceToEdit.numberOfChildren,
        serviceSlots: serviceToEdit.serviceSlots ?? [],
        isEdit: true,
        yesNoOptions: this.yesNoOptions,
        generalEnrollment: generalEnrollment,
        diningRoomCapacity: diningRoomCapacity,
        existingGroups: this.servicesByGroups.map((s) => ({ id: s.id, numberOfChildren: s.numberOfChildren })),
        isPDAM: true,
        isPACNA: false,
        isPSAV: false,
        operatingStartTime: operatingStartTime,
        operatingEndTime: operatingEndTime,
        serviceTypes: programData?.serviceTypes ?? [],
      } as ServiceByGroupDialogData,
      width: '90vw',
      maxWidth: '1200px',
      height: '90vh',
      maxHeight: '800px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: ServiceByGroupDialogResult) => {
      if (result) {
        const index = this.servicesByGroups.findIndex((s) => s.id === id);
        if (index !== -1) {
          this.servicesByGroups[index] = { ...result, id };
          this.updateServicesTableDataSource();
          this.syncChildGroupsFromServices();
        }
      }
    });
  }

  onTableDelete(event: Event, id: number): void {
    const serviceToDelete = this.servicesByGroups.find((s) => s.id === id);
    if (!serviceToDelete) {
      this._notificationService.showError('sites.add.services.error.service-not-found');
      return;
    }

    const confirmMessage = this._translocoService.translate('sites.add.services.confirm-delete', {
      groupName: serviceToDelete.groupName,
    });

    this._notificationService.showConfirmationDialogWithCallback(
      {
        message: confirmMessage,
        icon: {
          show: true,
          name: 'heroicons_outline:trash',
          color: 'warn',
        },
        actions: {
          confirm: {
            label: 'users.list.actions.delete',
            color: 'warn',
          },
        },
      },
      (result) => {
        if (result === 'confirmed') {
          const index = this.servicesByGroups.findIndex((s) => s.id === id);
          if (index !== -1) {
            this.servicesByGroups.splice(index, 1);
            this.updateServicesTableDataSource();
            this.syncChildGroupsFromServices();
          }
        }
      },
    );
  }

  /** Mapeo serviceTypeId → clave de columna de la tabla, desde programData.serviceTypes (code en camelCase). */
  private getServiceTypeIdToTableKey(): Record<number, string> {
    const serviceTypes = (this._route.snapshot.data['programData'] as { serviceTypes?: ServiceTypeByProgram[] } | undefined)?.serviceTypes;
    const map: Record<number, string> = {};
    if (serviceTypes?.length) {
      serviceTypes.forEach((st) => {
        const key = st.code.charAt(0).toLowerCase() + st.code.slice(1);
        map[st.id] = key;
      });
    }
    return map;
  }

  private updateServicesTableDataSource(): void {
    const idToKey = this.getServiceTypeIdToTableKey();
    const serviceTypes = (this._route.snapshot.data['programData'] as { serviceTypes?: ServiceTypeByProgram[] } | undefined)?.serviceTypes ?? [];
    const currentLang = this._translocoService?.getActiveLang() ?? 'es';
    const displayRows = this.servicesByGroups.map((row) => {
      const slots = row.serviceSlots ?? [];
      const enrichedSlots = slots.map((slot) => {
        const st = serviceTypes.find((s) => Number(s.id) === Number(slot.serviceTypeId));
        const slotWithName = slot as { serviceTypeName?: string };
        const label = slotWithName.serviceTypeName ?? (currentLang === 'es' ? st?.name : st?.nameEN) ?? st?.name ?? st?.code;
        return { ...slot, serviceTypeName: label };
      });
      const booleans: Record<string, boolean> = {};
      const fromTo: Record<string, string | undefined> = {};
      for (const [idStr, key] of Object.entries(idToKey)) {
        const id = Number(idStr);
        const slot = slots.find((s) => s.serviceTypeId === id && s.isOffered);
        booleans[key] = !!slot;
        const s = slot as SiteChildGroupServiceSlotResponse | undefined;
        const fromVal = s?.from ?? s?.fromTime;
        const toVal = s?.to ?? s?.toTime;
        if (fromVal != null) {
          fromTo[key + 'From'] = fromVal;
        }
        if (toVal != null) {
          fromTo[key + 'To'] = toVal;
        }
      }
      return { ...row, serviceSlots: enrichedSlots, ...booleans, ...fromTo };
    });
    this.servicesTableConfig.dataSource.data = displayRows;
    this._changeDetectorRef.detectChanges();
  }

  private syncChildGroupsFromServices(): void {
    this.childGroups = this.servicesByGroups.map((service) => ({
      id: service.id,
      groupName: service.groupName,
      groupNameEN: service.groupName,
      numberOfChildren: service.numberOfChildren,
      serviceSlots: service.serviceSlots ?? [],
    }));
  }

  /**
   * Filtra las Políticas de Funcionamiento según si la agencia es recurrente
   * Para agencias nuevas (isRecurrent = false), excluye Provisión I, II y III
   */
  private filterOperatingPolicies(policies: OperatingPolicy[], isRecurrent: boolean): OperatingPolicy[] {
    if (isRecurrent) {
      return policies; // Mostrar todas las políticas
    }
    // Para agencias nuevas, excluir IDs 3, 4, 5 (Provisión I, II, III)
    return policies.filter((p) => p.id !== 3 && p.id !== 4 && p.id !== 5);
  }
}
