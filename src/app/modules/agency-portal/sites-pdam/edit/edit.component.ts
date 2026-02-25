import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Validators, ReactiveFormsModule, UntypedFormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { SiteService } from 'app/shared/services/site.service';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GeoService } from 'app/shared/services/geo.service';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { NgForOf, NgIf } from '@angular/common';
import { merge, Subject, takeUntil, skip } from 'rxjs';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { OptionSelection } from 'app/shared/models/OptionSelection';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { City } from 'app/shared/models/City';
import { Region } from 'app/shared/models/Region';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { SiteRequest } from 'app/shared/models/Request/SiteRequest';
import { SiteServiceRequest } from 'app/shared/models/Request/SiteServiceRequest';
import { SiteEducationLevelRequest } from 'app/shared/models/Request/SiteEducationLevelRequest';
import { GroupTypeService } from 'app/shared/services/group-type.service';
import { KitchenTypeService } from 'app/shared/services/kitchen-type.service';
import { DeliveryTypeService } from 'app/shared/services/delivery-type.service';
import { AuthService } from 'app/core/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { OrganizationType } from 'app/shared/models/OrganizationType';
import { EducationLevelResponse } from 'app/shared/models/Response/EducationLevelResponse';
import { CenterType } from 'app/shared/models/CenterType';
import { DeliveryType } from 'app/shared/models/DeliveryType';
import { SponsorType } from 'app/shared/models/SponsorType';
import {
  compareById,
  isNullOrUndefinedEmptyStringNullArray,
  toTimeDate,
  toTimeString,
  logFormValidationErrors,
  generateTimeOptions,
  filterStartTimeOptions,
  getEndTimeOptions,
  isTimeWithinOperatingRange,
  timeStringToDate,
  dateToMinutes,
  compareByTime,
  TimeOption,
} from 'app/shared/utils';
import { Site } from 'app/shared/models/Site';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { NotificationService } from 'app/shared/services/notification.service';
import { ApiErrorBody, getApiErrorMessage } from 'app/shared/models/ApiError';
import {
  SiteChildGroupServiceSlotMinimal,
  SiteChildGroupServiceSlotResponse
} from 'app/shared/models/Response/SiteChildGroupServiceSlotResponse';
import { GenericTableConfig, OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { MatTableDataSource } from '@angular/material/table';
import { SATELLITE_SCHOOLS_COLUMNS_SCHEMA } from './columns-schema';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { SiteChildGroupRequest } from 'app/shared/models/Request/SiteChildGroupRequest';
import { SiteChildGroupServiceSlotRequest } from 'app/shared/models/Request/SiteChildGroupServiceSlotRequest';
import { AddServiceByGroupModalComponent, ServiceByGroupDialogData, ServiceByGroupDialogResult } from 'app/shared/components/add-service-by-group-modal/add-service-by-group-modal.component';
import { SERVICES_COLUMNS_SCHEMA } from 'app/shared/components/add-service-by-group-modal/services-columns-schema';
import { AreaType } from 'app/shared/models/AreaType';
import { DayOfWeekResponse } from 'app/shared/models/DayOfWeekResponse';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PermissionRequestDialogComponent } from '../../../../shared/components/permission-request-dialog/permission-request-dialog.component';
import { PermissionRequestFormDialogComponent } from '../../../../shared/components/permission-request-form-dialog/permission-request-form-dialog.component';
import { FieldVisibilityService } from 'app/shared/services/field-visibility.service';
import { AreaTypeService } from 'app/shared/services/area-type.service';
import { AgencyService } from 'app/shared/services/agency.service';
import { Agency } from 'app/shared/models/Agency';
import { OperatingPolicy } from 'app/shared/models/OperatingPolicy';
import { PROGRAM_IDS, isPDAMProgram } from 'app/shared/const';
import { CfrInfoDialogComponent } from 'app/shared/components/cfr-info-dialog/cfr-info-dialog.component';
import { NumericOnlyDirective } from 'app/shared/directives/numeric-only.directive';
import { PhoneFormatDirective } from 'app/shared/directives/phone-format.directive';
import { SiteStatusModalComponent, SiteStatusModalData } from 'app/shared/components/site-status-modal/site-status-modal.component';
import {
  SiteChangesCancellationsModalComponent,
  SiteChangesCancellationsModalData,
} from 'app/shared/components/site-changes-cancellations-modal/site-changes-cancellations-modal.component';
import { ServiceTypeByProgram } from 'app/shared/models/ServiceTypeByProgram';

import { puertoRicoPhoneValidator } from 'app/shared/validators/puerto-rico-phone.validator';
import { puertoRicoZipCodeValidator } from 'app/shared/validators/puerto-rico-zip-code.validator';
import { operatingHoursRangeValidator } from 'app/shared/validators/operating-hours-range.validator';
import { PuertoRicoZipCodeDirective } from 'app/shared/directives/puerto-rico-zip-code.directive';
import { LatitudeDirective } from 'app/shared/directives/latitude.directive';
import { LongitudeDirective } from 'app/shared/directives/longitude.directive';
import { validateAndCleanSiteService } from 'app/shared/utils/site-service-validator';
import { DateCalculationsUtil } from 'app/shared/utils/date-calculations.util';
import { TimeValidationUtil, ServiceConfig } from 'app/shared/utils/time-validation.util';
import { FieldVisibilityUtil } from 'app/shared/utils/field-visibility.util';
import { DynamicGridDirective } from 'app/shared/directives/dynamic-grid.directive';
import { DisableIfAgencyRestrictedDirective } from 'app/shared/directives/disable-if-agency-restricted/disable-if-agency-restricted.directive';
import { DisableIfNoPermissionDirective } from 'app/shared/directives/disable-if-no-permission/disable-if-no-permission.directive';

@Component({
  selector: 'app-sites-edit',
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
    NumericOnlyDirective,
    PhoneFormatDirective,
    PuertoRicoZipCodeDirective,
    LatitudeDirective,
    LongitudeDirective,
    DynamicGridDirective,
    MatProgressSpinnerModule
],
})
export class EditSitePdamComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers, OnGenericTableHandler {
  // Subject para suscribirse a todos los observables al destruir el componente
  // Subject to unsubscribe from all observables on component destroy
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // Inyección de dependencias y servicios
  // Dependency injection and services
  private _formBuilder = inject(UntypedFormBuilder);
  private _siteService = inject(SiteService);
  private _geoService = inject(GeoService);
  private _translocoService = inject(TranslocoService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _groupTypeService = inject(GroupTypeService);
  private _kitchenTypeService = inject(KitchenTypeService);
  private _deliveryTypeService = inject(DeliveryTypeService);
  private _areaTypeService = inject(AreaTypeService);
  private _authService = inject(AuthService);
  private _route = inject(ActivatedRoute);
  private _notificationService = inject(NotificationService);
  private _customRouterService = inject(CustomRouterService);
  private _agencyService = inject(AgencyService);
  private _dialog = inject(MatDialog);
  private _fieldVisibilityService = inject(FieldVisibilityService);

  // Catálogos
  // Catalogs
  listCities: City[] = [];
  listRegions: Region[] = [];
  listPostalRegions: Region[] = [];

  // Yes No Options (1, 2)
  // Si (1) y No (2)
  yesNoOptions: OptionSelection[] = [];

  // Tipo de OrganizaciÓn Sitio (1), Satélite (2), Institución Residencial (3), Otros (4)
  // Organization type - Required field for site classification
  organizationTypes: OrganizationType[] = [];

  // Nivel educativo - Campo requerido para tipo de sitio
  // Education level - Required field for site type
  educationLevels: EducationLevelResponse[] = [];

  // Centro - Campo requerido para clasificación del sitio
  // Center - Required field for site classification
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

  // Tipo de residencial - Tipo de residencial del sitio
  // Type of residential - Type of residential of the site
  typeOfResidential: OptionSelection[] = [];

  // Política de funcionamiento
  // Operating policies
  operatingPolicies: OperatingPolicy[] = [];

  // Tipo de cocina
  // Type of kitchen
  kitchenTypes: OptionSelection[] = [];
  isKitchenTypeDisabled: boolean = false;

  // Site Location
  // Site location - Determined by group type
  siteLocations: OptionSelection[] = [];
  isSiteLocationDisabled: boolean = false;

  // Tipo de grupo
  // Type of group
  groupTypes: OptionSelection[] = [];

  // Tipo de distribución / Distribution type
  // Distribution type
  distributionType: OptionSelection[] = [];

  // Lista de sitios
  // List of sites

  // Propiedad para controlar visibilidad del campo Tipo de Centro
  showCenterTypeField: boolean = false;

  // Opciones de hora para los campos "hasta" - se filtran dinámicamente
  timeOptions: TimeOption[] = [];

  // Días de la semana disponibles para selección (filtrados según programa)
  // Available days of the week for selection (filtered by program)
  // Se cargan desde el backend, no hardcodeados
  availableDaysOfWeek: DayOfWeekResponse[] = [];

  currentLang: string = 'es';

  // Tipo de área
  // Type of area
  areaTypes: AreaType[] = [];

  // Tipo de localización
  // Type of location
  locationTypes: AreaType[] = [];

  // Parámetro del sitio
  // Site parameter
  param: Site | null;

  // Configuración del header y formulario reactivo
  // Header config and reactive form
  headerConfig: GenericHeaderConfig = {
    title: 'sites.edit.title',
    formGroup: this._formBuilder.group({
      // Información General / General Information
      // Código del sitio - Campo de solo lectura para identificar el sitio
      // Site code - Read-only field for identifying the site
      siteCode: [{ value: '', disabled: true }],
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
      // Dirección postal - Campo requerido para la ubicación del sitio
      // Postal address - Required field for site location
      postalAddress: [''],
      // Ciudad postal - Campo requerido para la ubicación del sitio
      // Postal city - Required field for site location
      postalCity: [null, Validators.required],
      // Región postal - Campo requerido para la ubicación del sitio
      // Postal region - Required field for site location
      postalRegion: [null, Validators.required],
      // Código postal - Campo requerido para la ubicación del sitio
      // Postal ZIP code - Required field for site location
      postalZipCode: ['', puertoRicoZipCodeValidator()],
      // Información Administrativa / Administrative Information
      // Estado sin fines de lucro - Campo requerido que indica si el sitio es sin fines de lucro
      // Non-profit - Required field indicating if the site is non-profit
      nonProfit: [null, Validators.required],
      // Fecha de inicio - Campo requerido para la fecha de inicio del sitio
      // Start date - Required field for the start date of the site
      startDate: [null],
      // Año de base - Campo requerido para el año de base del contrato
      // Base year - Required field for the base year of the contract
      baseYear: [{ value: null, disabled: true }, [Validators.pattern(/^[\d]{4}$/)]],
      // Año de renovación - Campo requerido para el año de renovación del contrato
      // Renewal year - Required field for the renewal year of the contract
      renewalYear: [{ value: null, disabled: true }, [Validators.pattern(/^[\d]{4}$/)]],
      // Tipo de organización - Campo requerido para la clasificación del sitio
      // Organization type - Required field for site classification
      organizationType: [null, Validators.required],
      // Centro - Campo requerido para la clasificación del sitio
      // Center - Required field for site classification
      centerType: [null, Validators.required],
      // Niveles educativos - Campo requerido para el tipo de sitio (múltiple selección)
      // Education levels - Required field for site type (multiple selection)
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
      // Horario Académico PDAM (opcional)
      firstAcademicClassStartTime: [null],
      lastAcademicClassEndTime: [null],
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
      // Type of applicant - Type of applicant of the site
      typeOfApplicant: [null, Validators.required],
      // Tipo de residencial - Tipo de residencial del sitio
      // Type of residential - Type of residential of the site
      typeOfResidential: [null],
      // Tipo de área - Tipo de área del sitio
      // Type of area - Type of area of the site
      // (tipo select-SOLO DISABLED - se auto-selecciona según ciudad)
      areaType: [{ value: null, disabled: true }],
      // Localización - Tipo de localización del sitio
      // Location - Type of location of the site
      // (tipo select - selección manual)
      locationType: [null, Validators.required],
      // Política de operación - Política de operación del sitio
      // Operating policy - Operating policy of the site
      operatingPolicy: [null],
      // Almacén - Campo requerido para indicar si el sitio tiene un almacén
      // Warehouse - Required field indicating if the site has a warehouse
      hasWarehouse: [null, Validators.required],
      // Comedor - Campo requerido para indicar si el sitio tiene un comedor
      // Dining room - Required field indicating if the site has a dining room
      hasDiningRoom: [null, Validators.required],
      // Capacidad de Salón Comedor - Solo visible cuando hasDiningRoom es true
      // Dining room capacity - Only visible when hasDiningRoom is true
      diningRoomCapacity: [null, [Validators.min(1)]],
      // Persona a Cargo (solo para PDAM)
      // Person in Charge (only for PDAM)
      personInCharge: this._formBuilder.group({
        firstName: [''],
        middleName: [''],
        fatherLastName: [''],
        motherLastName: [''],
        sitePhone: ['', puertoRicoPhoneValidator()],
        extension: [''],
        mobilePhone: ['', puertoRicoPhoneValidator()],
      }),
      // Estado activo/inactivo del sitio
      // Active/inactive status of the site
      isActive: [true],
      // Justificación de inactivación - Requerida cuando isActive es false
      // Inactivation justification - Required when isActive is false
      inactiveJustification: [{ value: '', disabled: true }],
      // Fecha de inactivación - Fecha cuando se inactivó el sitio
      // Inactivation date - Date when the site was inactivated
      inactiveDate: [{ value: null, disabled: true }],
      // Fecha de revisión - Fecha cuando se realizó la revisión
      // Review date - Date when the review was conducted
      // Justificación de revisión - Justificación de la revisión
      // Review justification - Justification of the review
      // reviewJustification: [null],
      // Matrícula General
      // General Enrollment
      generalEnrollment: [null, [Validators.required, Validators.pattern(/^\d+$/)]],
    }),
    // Cancel button
    cancelButtonShow: true,
    cancelButtonText: 'sites.edit.buttons.cancel',
    // Settings button
    settingsButtonShow: true,
    settingsButtonTooltip: 'sites.edit.settings.tooltip',
    settingsMenuItems: [
      {
        id: 'toggle-active',
        label: 'sites.edit.settings.toggle-active',
        icon: 'mat_outline:check_box',
        iconColor: 'text-green-500',
      },
      {
        id: 'calendar',
        label: 'sites.edit.settings.calendar',
        icon: 'heroicons_outline:calendar',
      },
    ],
    // Submit button
    submitButtonShow: true,
    submitButtonText: 'sites.edit.buttons.save',
    submitDisabled: true, // Inicialmente deshabilitado hasta que el formulario sea válido
  };

  satellitesTableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<any>(),
    dataSourceList: [],
    columnsSchema: SATELLITE_SCHOOLS_COLUMNS_SCHEMA,
    displayedColumns: SATELLITE_SCHOOLS_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 25,
  };

  // Propiedades para manejar grupos de niños específicos
  childGroups: SiteChildGroupRequest[] = [];
  nextGroupNumber: number = 1;

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
    pageSizeOptions: [5, 10, 25, 50],
    pageSize: 10,
    fullScreen: false,
    viewMode: 'cards',
    operatingDaysOfWeek: []
  };

  // Lista de servicios por grupos (en memoria hasta el envío)
  servicesByGroups: ServiceByGroupDialogResult[] = [];

  servicesCardLoading = false;

  // Required by OnGenericTableHandler interface
  get tableConfig(): GenericTableConfig {
    // Retornar el config de servicios (siempre en modo grupos)
    return this.servicesTableConfig;
  }

  // Agregar esta propiedad
  protected readonly window = window;

  // Compare methods
  compareById = compareById;

  /**
   * Compara dos objetos Date por su hora (wrapper para usar en template)
   */
  compareByTimeWrapper = compareByTime;

  // Estado de carga y variables de contexto
  // Loading state and context variables
  isLoading = false;

  // Agencia Id
  // Agency ID
  agencyId: number = 0;
  agency: Agency = null;

  // Sitio Id
  // Site ID
  siteId: number = 0;

  constructor() {}

  ngOnInit(): void {
    this.currentLang = this._translocoService.getActiveLang();

    // Generar opciones de hora
    this.initializeTimeOptions();

    // Configurar FieldVisibilityService SOLO para distributionType
    this._fieldVisibilityService.setActiveConfig('sites');

    // Obtener Agencia desde local storage desde AuthService
    this.agencyId = this._authService.getAgencyId();

    // Combinar datos de resolvers comunes y específicos del programa
    const commonData = this._route.snapshot.data['commonData'];
    const programData = this._route.snapshot.data['programData'];
    const resolvedData = commonData && programData ? { ...commonData, ...programData } : null;

    if (resolvedData) {
      // Yes No Options
      this.yesNoOptions = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'yesNo');
      // Tipo de residencial
      this.typeOfResidential = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'typeOfResidential');
      // Tipo de solicitante
      this.typeOfApplicant = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'typeOfApplicant');
      // Estatus
      this.isActive = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'isActive');
      // Tipo de cocina
      this.kitchenTypes = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'kitchenType');
      // Site Location
      this.siteLocations = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'siteLocation');
      // Tipo de grupo
      this.groupTypes = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'groupType');
      // Tipo de distribución / Distribution type
      this.distributionType = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'distributionType');
      // Catálogos
      this.centerTypes = resolvedData.centerTypes;
      this.organizationTypes = resolvedData.organizationTypes;
      this.educationLevels = resolvedData.educationLevels;
      this.kitchenTypes = resolvedData.kitchenTypes;
      this.groupTypes = resolvedData.groupTypes;
      this.sponsorType = resolvedData.sponsorTypes;

      // Filtrar operating policies según si la agencia es recurrente
      this.operatingPolicies = this.filterOperatingPolicies(resolvedData.operatingPolicies, this.agency?.isRecurrent || false);

      this.deliveryTypes = resolvedData.deliveryTypes;
      this.listCities = resolvedData.cities;
      this.listRegions = resolvedData.regions;
      this.listPostalRegions = resolvedData.regions;
      this.areaTypes = resolvedData.areaTypes;
      this.locationTypes = resolvedData.areaTypes; // Usar los mismos valores que AreaType

      // Cargar días permitidos desde el resolver
      this.availableDaysOfWeek = (resolvedData.allowedOperatingDays as DayOfWeekResponse[]) || null;

      // Usar la sitio del resolver
      // Use site from resolver
      this.onSetForm(resolvedData.site);

      this._changeDetectorRef.markForCheck();
    }

    // Obtener datos de la agencia para determinar campos visibles
    this._agencyService.agency$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.agency = result.body;

        // Configurar validaciones
        this.updateValidations();
        this.updatePersonInChargeValidations();
      }
    });

    // Transloco
    this._translocoService.langChanges$.pipe(takeUntil(this._unsubscribeAll)).subscribe((lang: string) => {
      this.currentLang = lang;
    });

    this.setupFormListeners();

    // Suscribirse a cambios de validación del formulario para actualizar el estado del botón de guardar
    this.headerConfig.formGroup.statusChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
      this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;
      this._changeDetectorRef.detectChanges();
    });
  }

  private setupFormListeners(): void {
    // Escuchar cambios en las fechas para calcular automáticamente los días
    this.headerConfig.formGroup.get('operatingFromDate')?.valueChanges.subscribe(() => {
      DateCalculationsUtil.calculateOperatingDays(this.headerConfig.formGroup);
    });

    this.headerConfig.formGroup.get('operatingToDate')?.valueChanges.subscribe(() => {
      DateCalculationsUtil.calculateOperatingDays(this.headerConfig.formGroup);
    });

    // Escuchar cambios en los días seleccionados para recalcular los días operativos y actualizar tarjetas Servicios Activos
    this.headerConfig.formGroup.get('operatingDaysOfWeek')?.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((value: DayOfWeekResponse[] | null) => {
        DateCalculationsUtil.calculateOperatingDays(this.headerConfig.formGroup);
        this.servicesTableConfig.operatingDaysOfWeek = value ?? [];
        this._changeDetectorRef.markForCheck();
      });

    // Listener para cambios en groupType que afectan distributionType, siteLocation, kitchenType y deliveryTypes
    this.headerConfig.formGroup.get('groupType')?.valueChanges.subscribe((groupType) => {
      this.updateDistributionTypeValidation();
      this.getSiteLocationByGroupType(groupType);
      this.loadDeliveryTypesByGroupType(groupType);

      const kitchenTypeControl = this.headerConfig.formGroup.get('kitchenType');

      if (groupType) {
        const isComedor = groupType.name === 'Comedor' || groupType.nameEN === 'Dining Room';
        if (!isComedor) {
          // Si no es "Comedor", limpiar el valor, opciones y validaciones de tipo de cocina
          this.kitchenTypes = [];
          this.headerConfig.formGroup.patchValue({ kitchenType: null });
          kitchenTypeControl?.clearValidators();
          kitchenTypeControl?.updateValueAndValidity({ emitEvent: false });
        } else {
          // Para "Comedor", tipo de cocina es obligatorio
          kitchenTypeControl?.setValidators([Validators.required]);
          kitchenTypeControl?.updateValueAndValidity({ emitEvent: false });
        }
      } else {
        // Sin tipo de grupo seleccionado, limpiar también cocina
        this.kitchenTypes = [];
        this.headerConfig.formGroup.patchValue({ kitchenType: null });
        kitchenTypeControl?.clearValidators();
        kitchenTypeControl?.updateValueAndValidity({ emitEvent: false });
      }

      this._changeDetectorRef.detectChanges();
    });

    // Listener para cambios en operatingPolicy que afectan la visibilidad de campos de provisión
    this.headerConfig.formGroup
      .get('operatingPolicy')
      ?.valueChanges.pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this._changeDetectorRef.detectChanges();
      });

    // Listener para cambios en organizationType que afectan la visibilidad del campo centerType
    // Usar skip(1) para evitar que se ejecute durante la inicialización con patchValue
    this.headerConfig.formGroup
      .get('organizationType')
      ?.valueChanges.pipe(
        skip(1), // Saltar el primer valor (inicialización)
        takeUntil(this._unsubscribeAll)
      )
      .subscribe((organizationType: OrganizationType) => {
        const result = FieldVisibilityUtil.updateCenterTypeFieldVisibility(this.headerConfig.formGroup, organizationType, 'centerType', this._changeDetectorRef, (disabled) => {
          this.headerConfig.submitDisabled = disabled;
        });
        this.showCenterTypeField = result.showCenterTypeField;
        this._changeDetectorRef.detectChanges();
      });

    // Campos isActive, inactiveDate e inactiveJustification ahora se manejan desde el modal de Settings
    // No se necesita suscripción a cambios de isActive ya que se gestiona desde el modal

    // Listener para cambios en hasDiningRoom
    this.headerConfig.formGroup.get('hasDiningRoom')?.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
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
    this.headerConfig.formGroup.get('diningRoomCapacity')?.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.validateDiningRoomCapacity();
        this._changeDetectorRef.detectChanges();
      });

    this.headerConfig.formGroup.get('generalEnrollment')?.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
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
    merge(
      operatingStartControl?.valueChanges ?? [],
      operatingEndControl?.valueChanges ?? []
    )
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
    if (!firstControl || !lastControl) return;

    const firstValid = isTimeWithinOperatingRange(
      firstControl.value,
      operatingStartTime,
      operatingEndTime
    );
    const lastValid = isTimeWithinOperatingRange(
      lastControl.value,
      operatingStartTime,
      operatingEndTime
    );

    if (firstValid) {
      const err = firstControl.errors;
      if (err?.['outsideOperatingHours']) {
        const { outsideOperatingHours: _, ...rest } = err;
        firstControl.setErrors(Object.keys(rest).length ? rest : null);
      }
    } else {
      firstControl.setErrors({ ...(firstControl.errors ?? {}), outsideOperatingHours: true });
    }
    if (lastValid) {
      const err = lastControl.errors;
      if (err?.['outsideOperatingHours']) {
        const { outsideOperatingHours: _, ...rest } = err;
        lastControl.setErrors(Object.keys(rest).length ? rest : null);
      }
    } else {
      lastControl.setErrors({ ...(lastControl.errors ?? {}), outsideOperatingHours: true });
    }
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

  // Manejar cambio de non-profit para programa PDAM
  nonProfitChange(event?: any): void {
    // Obtener el valor directamente del evento si está disponible
    // El evento contiene el booleanValue (true para "Sí", false para "No")
    const nonProfitValue = event?.value !== undefined ? event.value : this.headerConfig.formGroup.value.nonProfit;

    // Solo mostrar el diálogo cuando se selecciona explícitamente "No" (false)
    // No mostrar si es null, undefined o true
    if (nonProfitValue !== false) {
      return;
    }

    const programs = this.agency?.programs || [];
    const selectedProgram = programs.find((p) => p.id === PROGRAM_IDS.PDAM);

    // Verificar elegibilidad para PDAM cuando no es sin fines de lucro
    if (selectedProgram && isPDAMProgram(selectedProgram)) {
      this._dialog.open(CfrInfoDialogComponent, {
        data: {
          title: this._translocoService.translate('sites.edit.pdam-not-eligible.title'),
          message: this._translocoService.translate('sites.edit.pdam-not-eligible.message'),
          cfrLink: {
            url: 'https://www.ecfr.gov/current/title-7/subtitle-B/chapter-II/subchapter-A/part-210#p-210.9(b)(1)',
            text: this._translocoService.translate('sites.edit.pdam-not-eligible.cfr-link-text'),
          },
        },
        disableClose: false,
        panelClass: ['mat-dialog-container', 'dialog-responsive'],
      });
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  /**
   * Actualiza las validaciones de personInCharge para PDAM
   */
  private updatePersonInChargeValidations(): void {
    const personInChargeGroup = this.headerConfig.formGroup.get('personInCharge') as FormGroup;

    if (!personInChargeGroup) {
      return;
    }

    // Restaurar validaciones requeridas para PDAM
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

  private updateValidations(): void {
    // Restaurar validaciones requeridas para PDAM
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

    // educationLevels es requerido para PDAM
    const educationLevelsControl = this.headerConfig.formGroup.get('educationLevels');
    if (educationLevelsControl) {
      educationLevelsControl.setValidators([Validators.required]);
      educationLevelsControl.updateValueAndValidity();
    }

    // Actualizar el estado del botón después de restaurar las validaciones
    this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;
    this._changeDetectorRef.detectChanges();
  }

  onSetForm(param: Site): void {
    this.param = param;
    this.servicesTableConfig.operatingDaysOfWeek = param.operatingDaysOfWeek ?? [];

    // Obtener las ciudades y regiones
    // Get cities and regions
    const city = param.city;
    const region = param.region;
    const postalCity = param.postalCity;
    const postalRegion = param.postalRegion;

    const kitchenType = param.kitchenType;
    const siteLocation = param.siteLocation;
    const groupType = param.groupType;
    const deliveryType = param.deliveryType;
    const sponsorType = param.sponsorType;
    const applicantType = param.applicantType;
    // Buscar el tipo de residencial en el array para asegurar coincidencia correcta con compareById
    // Find residential type in array to ensure correct matching with compareById
    const residentialType = param.residentialType;
    const operatingPolicy = param.operatingPolicy;
    const educationLevels = param.educationLevels || [];
    // Buscar el tipo de organización en el array para asegurar coincidencia correcta con compareById
    // Find organization type in array to ensure correct matching with compareById and get all properties including requiresCenterType
    let organizationType = param.organizationType;
    if (organizationType) {
      const organizationTypeFromArray = this.organizationTypes.find((option) => option.id === organizationType.id);
      if (organizationTypeFromArray) {
        organizationType = organizationTypeFromArray;
      }
    }
    // Buscar el tipo de centro en el array para asegurar coincidencia correcta con compareById
    // Find center type in array to ensure correct matching with compareById
    let centerType = param.centerType;
    if (centerType) {
      const centerTypeFromArray = this.centerTypes.find((option) => option.id === centerType.id);
      if (centerTypeFromArray) {
        centerType = centerTypeFromArray;
      }
    }
    const areaType = param.areaType;
    const locationType = param.locationType;

    // Obtener los días de operación seleccionados, con fallback a días permitidos
    // operatingDaysOfWeek ya viene como DayOfWeekResponse[] desde el backend
    const operatingDaysOfWeek = param.operatingDaysOfWeek;

    this.headerConfig.formGroup.patchValue({
      siteCode: param.siteCode || param.id?.toString() || '',
      name: param.name,
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
      operatingStartTime: param.operatingStartTime ? toTimeDate(param.operatingStartTime) : null,
      operatingEndTime: param.operatingEndTime ? toTimeDate(param.operatingEndTime) : null,
      firstAcademicClassStartTime: param.firstAcademicClassStartTime ? toTimeDate(param.firstAcademicClassStartTime) : null,
      lastAcademicClassEndTime: param.lastAcademicClassEndTime ? toTimeDate(param.lastAcademicClassEndTime) : null,
      operatingDaysOfWeek: operatingDaysOfWeek,
      serviceTime: param.serviceTime,
      //
      nonProfit: param.nonProfit,
      startDate: param.startDate,
      baseYear: param.baseYear,
      renewalYear: param.renewalYear,
      hasWarehouse: param.hasWarehouse,
      hasDiningRoom: param.hasDiningRoom,
      diningRoomCapacity: param.diningRoomCapacity,
      personInCharge: param.personInCharge
        ? {
            firstName: param.personInCharge.firstName || '',
            middleName: param.personInCharge.middleName || '',
            fatherLastName: param.personInCharge.fatherLastName || '',
            motherLastName: param.personInCharge.motherLastName || '',
            sitePhone: param.personInCharge.sitePhone || '',
            extension: param.personInCharge.extension || '',
            mobilePhone: param.personInCharge.mobilePhone || '',
          }
        : {
            firstName: '',
            middleName: '',
            fatherLastName: '',
            motherLastName: '',
            sitePhone: '',
            extension: '',
            mobilePhone: '',
          },
      isActive: param.isActive,
      inactiveJustification: param.inactiveJustification || null,
      inactiveDate: param.inactiveDate,
      //
      kitchenType: kitchenType,
      siteLocation: siteLocation,
      groupType: groupType,
      deliveryType: deliveryType,
      sponsorType: sponsorType,
      applicantType: applicantType,
      applicantTypeId: applicantType?.id,
      typeOfApplicant: applicantType,
      typeOfResidential: residentialType,
      operatingPolicy: operatingPolicy,
      areaType: areaType,
      locationType: locationType,
      generalEnrollment: param.generalEnrollment,
    });

    // Validar horas académicas tras cargar datos (pueden venir fuera del rango de funcionamiento)
    this.validateAcademicTimesWithinOperatingHours();

    // Auto-seleccionar areaType si es null y hay una ciudad seleccionada
    // Auto-select areaType if it's null and there's a city selected
    if (!areaType && city) {
      this.getAreaTypeByCity(city);
    }

    // Asegurar que el campo areaType permanezca deshabilitado
    // Ensure areaType field remains disabled
    this.headerConfig.formGroup.get('areaType')?.disable();

    // Actualizar validaciones de distributionType basado en groupType
    this.updateDistributionTypeValidation();

    // Inicializar showCenterTypeField basado en el organizationType cargado
    // Esto es necesario porque valueChanges solo se dispara cuando el valor cambia, no cuando se establece con patchValue
    // Usar FieldVisibilityUtil para mantener consistencia con el listener
    // Nota: organizationType ya fue buscado en el array organizationTypes arriba para obtener todas las propiedades incluyendo requiresCenterType
    if (organizationType) {
      const result = FieldVisibilityUtil.updateCenterTypeFieldVisibility(
        this.headerConfig.formGroup,
        organizationType,
        'centerType',
        this._changeDetectorRef,
        (disabled) => {
          this.headerConfig.submitDisabled = disabled;
        }
      );
      this.showCenterTypeField = result.showCenterTypeField;
    }

    // Cargar grupos con serviceSlots desde param.childGroups
    if (param.childGroups && param.childGroups.length > 0) {
      this.childGroups = param.childGroups.map(group => ({
        id: group.id,
        siteId: this.param.id,
        groupName: group.groupName,
        groupNameEN: group.groupName ?? group.groupName,
        numberOfChildren: group.numberOfChildren || 0,
        serviceSlots: ((group as { serviceSlots?: SiteChildGroupServiceSlotRequest[] }).serviceSlots ?? []) as SiteChildGroupServiceSlotRequest[],
      }));
      this.nextGroupNumber = this.childGroups.length + 1;

      this.servicesByGroups = param.childGroups.map((group, index) => ({
        id: group.id ?? index + 1,
        groupName: group.groupName,
        numberOfChildren: group.numberOfChildren || 0,
        serviceSlots: (group.serviceSlots ?? []).map((slot: SiteChildGroupServiceSlotResponse) => ({
          serviceTypeId: slot.serviceTypeId,
          isOffered: slot.isOffered,
          from: slot.from ?? slot.fromTime,
          to: slot.to ?? slot.toTime,
          serviceTypeName: slot.serviceTypeName,
          serviceTypeNameEN: slot.serviceTypeNameEN,
          operatingDates: slot.operatingDates ?? [],
        })),
      }));
      this.updateServicesTableDataSource();
      this.syncChildGroupsFromServices();
    }

    // Calcular días operativos automáticamente si es necesario
    DateCalculationsUtil.calculateOperatingDaysIfNeeded(this.headerConfig.formGroup);

    // Cargar deliveryTypes según el groupType inicial
    if (groupType) {
      this.loadDeliveryTypesByGroupType(groupType);
    }

    // Actualizar el estado del botón después de cargar todos los datos
    this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;
    this._changeDetectorRef.detectChanges();
  }

  /**
   * Calcula los días operativos automáticamente si es necesario
   * Calculates operating days automatically if needed
   */

  /**
   * Envía el formulario de edición de escuela
   * Submits the school edit form
   */
  onSubmit() {
    if (this.headerConfig.formGroup.invalid) {
      // Log detallado de campos inválidos usando función utilitaria
      logFormValidationErrors(this.headerConfig.formGroup, 'Formulario de Sitio');

      this._notificationService.showError('Por favor, complete todos los campos requeridos');
      this.headerConfig.formGroup.markAllAsTouched();
      return;
    }

    if (isNullOrUndefinedEmptyStringNullArray(this.param)) {
      this._notificationService.showError('No se puede editar una escuela que no existe');
      return;
    }

    // Recalcular Total de Días de Funcionamiento antes de guardar
    DateCalculationsUtil.calculateOperatingDays(this.headerConfig.formGroup);

    // Usar getRawValue() para obtener todos los valores, incluyendo campos deshabilitados
    const formValues = this.headerConfig.formGroup.getRawValue();
    // Obtener y mapear los valores del formulario
    // Get and map form values
    const cityId: number = formValues.city?.id;
    const regionId: number = formValues.region?.id;
    const postalCityId: number = formValues.postalCity?.id;
    const postalRegionId: number = formValues.postalRegion?.id;
    const educationLevelIds: number[] = formValues.educationLevels?.map((level: any) => level.id) || [];
    const organizationTypeId: number = formValues.organizationType?.id;
    const kitchenTypeId: number | null = formValues.kitchenType?.id ?? null;
    const siteLocationId: number | null = formValues.siteLocation?.id ?? null;
    const groupTypeId: number | null = formValues.groupType?.id ?? null;
    const deliveryTypeId: number | null = formValues.deliveryType?.id ?? null;
    const sponsorTypeId: number | null = formValues.sponsorType?.id ?? null;
    const applicantTypeId: number | null = formValues.typeOfApplicant?.id ?? null;
    const centerTypeId: number | null = formValues.centerType?.id ?? null;
    const residentialTypeId: number | null = formValues.typeOfResidential?.id ?? null;
    const operatingPolicyId: number | null = formValues.operatingPolicy?.id ?? null;
    const areaTypeId: number | null = formValues.areaType?.id ?? null;
    const locationTypeId: number | null = formValues.locationType?.id ?? null;

    // Mapear objetos DayOfWeekResponse a IDs
    const operatingDaysOfWeek: number[] = formValues.operatingDaysOfWeek.map((day: DayOfWeekResponse) => day.id);

    // Construir el objeto de actualización
    // Build the update object
    const siteRequest: SiteRequest = {
      id: this.param.id,
      agencyId: this.agencyId,
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
      organizationTypeId: organizationTypeId,
      centerTypeId: centerTypeId,
      operatingFromDate: formValues.operatingFromDate ?? null,
      operatingToDate: formValues.operatingToDate ?? null,
      operatingDaysCalculated: formValues.operatingDaysCalculated ?? null,
      operatingDaysOfWeek: operatingDaysOfWeek,
      operatingStartTime: formValues.operatingStartTime ? toTimeString(formValues.operatingStartTime) : null,
      operatingEndTime: formValues.operatingEndTime ? toTimeString(formValues.operatingEndTime) : null,
      firstAcademicClassStartTime: formValues.firstAcademicClassStartTime ? toTimeString(formValues.firstAcademicClassStartTime) : null,
      lastAcademicClassEndTime: formValues.lastAcademicClassEndTime ? toTimeString(formValues.lastAcademicClassEndTime) : null,
      kitchenTypeId: kitchenTypeId ?? null,
      siteLocationId: siteLocationId ?? null,
      groupTypeId: groupTypeId ?? null,
      deliveryTypeId: deliveryTypeId ?? null,
      sponsorTypeId: sponsorTypeId ?? null,
      applicantTypeId: applicantTypeId ?? null,
      operatingPolicyId: operatingPolicyId ?? null,
      residentialTypeId: residentialTypeId ?? null,
      areaTypeId: areaTypeId ?? null,
      locationTypeId: locationTypeId ?? null,
      nonProfit: formValues.nonProfit ?? null,
      startDate: formValues.startDate ?? null,
      baseYear: formValues.baseYear ?? null,
      renewalYear: formValues.renewalYear ?? null,
      hasWarehouse: formValues.hasWarehouse ?? null,
      hasDiningRoom: formValues.hasDiningRoom ?? null,
      diningRoomCapacity: formValues.diningRoomCapacity ?? null,
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
      // Campos requeridos por el stored procedure 104_UpdateSite
      serviceTime: formValues.serviceTime ?? null,
      isActive: formValues.isActive ?? true,
      inactiveJustification: formValues.inactiveJustification ?? null,
      inactiveDate: formValues.inactiveDate ?? null,
      generalEnrollment: formValues.generalEnrollment ?? null,
    };

    // ===== CREAR SCHOOL EDUCATION LEVEL REQUEST =====
    // Crear SiteEducationLevelRequest para cada nivel educativo seleccionado
    if (educationLevelIds.length > 0) {
      siteRequest.educationLevels = educationLevelIds.map((id) => {
        const educationLevelRequest: SiteEducationLevelRequest = {
          siteId: this.param.id, // ID del sitio existente
          educationLevelId: id,
          isActive: true,
        };
        return educationLevelRequest;
      });
    }

    // Validar y sincronizar grupos si hay servicios por grupos
    if (this.servicesByGroups.length > 0) {
      // Validar que todos los servicios tengan groupName
      const servicesWithoutGroup = this.servicesByGroups.filter(s => !s.groupName || s.groupName.trim() === '');
      if (servicesWithoutGroup.length > 0) {
        this._notificationService.showError('Todos los servicios deben tener un nombre de grupo');
        return;
      }

      // Sincronizar grupos desde servicios antes de enviar
      this.syncChildGroupsFromServices();

      // Validar que haya grupos si hay servicios
      if (this.childGroups.length === 0) {
        this._notificationService.showError('Debe haber al menos un grupo cuando hay servicios por grupos');
        return;
      }
    }

    // Validar suma de grupos ≤ matrícula y cada grupo ≤ capacidad del salón (si aplica)
    if (this.childGroups.length > 0 && !this.validateGroupsEnrollmentAndCapacity()) {
      return;
    }

    // En edición los grupos se persisten en el momento desde el modal; no enviar childGroups en update-site.
    this.isLoading = true;
    this.headerConfig.formGroup.disable();

    this._siteService.updateSite(siteRequest, {}).subscribe({
      next: (result: any) => {
        switch (result.body) {
          case true:
            this._notificationService.showSuccessDialogWithCallback('sites.edit.success', (result) => {
              if (result === 'confirmed') {
                // Navegar a la ruta correcta según el programa
                this._customRouterService.navigate(['schools']);
              }
            });
            break;
          default:
            this._notificationService.showErrorDialog('sites.edit.error.save-failed');
            break;
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('[Edit Site] updateSite error:', err);
        const body = err?.error as ApiErrorBody | undefined;
        if (
          err?.status === 400 &&
          (body?.code === 'FirstSiteMustBeComedor' ||
            body?.code === 'SchoolMustHaveComedorFirst' ||
            body?.code === 'SiteDatesOutsideComedorRange') &&
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
   * Cancela la edición y navega al listado de sitios o escuelas según el programa
   * Cancels editing and navigates to the sites or schools list based on the program
   */
  onCancel(event: Event) {
    // Navegar a la ruta correcta según el programa
    this._customRouterService.navigate(['schools']);
  }

  /**
   * Determina la ruta de navegación según el programa activo
   * Determines navigation route based on active program
   * @returns Array con la ruta de navegación
   */
  private getTargetRoute(): string[] {
    // Este componente es específico para PDAM
    return ['sites-pdam'];
  }

  // Método para manejar acciones del menú de settings
  onSettingsMenuAction(menuItemId: string): void {
    switch (menuItemId) {
      case 'toggle-active':
        this.onToggleActive();
        break;
      case 'calendar':
        this.navigateToCalendar();
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
        siteId: this.param.id,
        isActive: currentIsActive,
        inactiveDate: currentInactiveDate,
        inactiveJustification: currentInactiveJustification,
        isActiveOptions: this.isActive,
        yesNoOptions: this.yesNoOptions,
      } as SiteStatusModalData,
      disableClose: false,
      width: '600px',
      maxWidth: '90vw',
      panelClass: ['mat-dialog-container', 'dialog-responsive'],
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action === 'redirect-to-changes-form') {
        const changesDialogRef = this._dialog.open(
          SiteChangesCancellationsModalComponent,
          {
            data: {
              siteId: result.siteId,
              endOfOperationDate: result.inactiveDate ?? null,
            } as SiteChangesCancellationsModalData,
            width: '600px',
            maxWidth: '90vw',
            panelClass: ['mat-dialog-container', 'dialog-responsive'],
          }
        );
        changesDialogRef.afterClosed().subscribe(() => {
          // Por ahora no se actualiza el formulario ni se llama al backend
        });
        return;
      }

      if (result && result.action === 'submit') {
        // Actualizar el formulario con los valores del modal
        const isActiveControl = this.headerConfig.formGroup.get('isActive');
        const inactiveDateControl = this.headerConfig.formGroup.get('inactiveDate');
        const inactiveJustificationControl = this.headerConfig.formGroup.get('inactiveJustification');

        isActiveControl?.setValue(result.isActive);

        if (result.isActive === false) {
          // Si está inactivo, establecer fecha y justificación del modal
          inactiveDateControl?.enable({ emitEvent: false });
          inactiveJustificationControl?.enable({ emitEvent: false });
          inactiveDateControl?.setValue(result.inactiveDate);
          inactiveJustificationControl?.setValue(result.inactiveJustification);
          inactiveDateControl?.setValidators([Validators.required]);
          inactiveJustificationControl?.setValidators([Validators.required]);
        } else {
          // Si está activo, limpiar validadores y valores
          inactiveDateControl?.clearValidators();
          inactiveJustificationControl?.clearValidators();
          inactiveDateControl?.setValue(null);
          inactiveJustificationControl?.setValue('');
          inactiveDateControl?.disable({ emitEvent: false });
          inactiveJustificationControl?.disable({ emitEvent: false });
        }

        inactiveDateControl?.updateValueAndValidity({ emitEvent: false });
        inactiveJustificationControl?.updateValueAndValidity({ emitEvent: false });
        this._changeDetectorRef.detectChanges();
      }
    });
  }

  // Método para navegar al calendario
  private navigateToCalendar(): void {
    const targetRoute = this.getTargetRoute();
    const siteId = this.param?.id;
    if (siteId) {
      this._customRouterService.navigate([...targetRoute, 'calendar', siteId.toString()]);
    }
  }

  // Método para agregar una escuela satélite
  onTableAddSatelliteSite(event: Event, element: any) {
    console.log('onTableAddSatelliteSite', event, element);
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
              // Preservar el valor actual si ya está establecido y es válido
              const currentPostalRegion = regionControl.value;
              const isValidCurrentRegion = currentPostalRegion && this.listPostalRegions.some((r) => r.id === currentPostalRegion.id);

              if (this.listPostalRegions.length === 1) {
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

  // Método para obtener tipos de cocina según el tipo de grupo seleccionado
  // Get kitchen types by group type
  getKitchenTypesByGroupType(groupType: OptionSelection): void {
    if (!groupType) {
      this.kitchenTypes = [];
      this.isKitchenTypeDisabled = false;
      return;
    }

    // Verificar si es "Comedor" - solo cargar tipos de cocina para Comedor
    const isComedor = groupType.name === 'Comedor' || groupType.nameEN === 'Dining Room';

    if (!isComedor) {
      // Si no es "Comedor", limpiar el valor y las opciones
      this.kitchenTypes = [];
      this.headerConfig.formGroup.patchValue({ kitchenType: null });
      this._changeDetectorRef.detectChanges();
      return;
    }

    // Para "Comedor", usar la API para obtener los tipos de cocina válidos
    this.isKitchenTypeDisabled = false;

    const queryParameters: QueryParameters = {
      groupTypeId: groupType.id,
      programId: PROGRAM_IDS.PDAM,
    };

    this._kitchenTypeService.getKitchenTypesByGroupType(queryParameters).subscribe({
      next: (response) => {
        if (response) {
          this.kitchenTypes = response.body;

          // Para "Comedor", limpiar la selección para que el usuario elija
          this.headerConfig.formGroup.patchValue({ kitchenType: null });

          this._changeDetectorRef.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error al cargar los tipos de cocina:', error);
      },
    });
  }

  /**
   * Verifica si se debe mostrar el campo de Tipo de Cocina
   * Solo se muestra cuando:
   * - El programa es PDAM
   * - Y el Tipo de Grupo seleccionado es "Comedor" (Dining Room)
   */
  get shouldShowKitchenTypeField(): boolean {
    // Verificar si el Tipo de Grupo seleccionado es "Comedor"
    const groupType = this.headerConfig.formGroup.get('groupType')?.value;
    if (groupType) {
      const isComedor = groupType.name === 'Comedor' || groupType.nameEN === 'Dining Room';
      return isComedor;
    }

    return false;
  }

  /**
   * Carga los tipos de entrega según el tipo de grupo seleccionado
   */
  private loadDeliveryTypesByGroupType(groupType: any): void {
    if (!groupType || !groupType.id) {
      // Si no hay tipo de grupo, mantener los deliveryTypes actuales (no limpiar en edit)
      return;
    }

    const queryParameters: QueryParameters = {
      groupTypeId: groupType.id,
    };

    this._deliveryTypeService.getDeliveryTypesByGroupType(queryParameters).subscribe({
      next: (response) => {
        if (response && response.body) {
          this.deliveryTypes = response.body;
          // En modo edición, no limpiar el deliveryType seleccionado si aún es válido
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
        this._notificationService.showError('Error al cargar los tipos de entrega');
      },
    });
  }

  // Método para obtener el tipo de área según la ciudad seleccionada
  // Get area type by city
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

          // Validar que el tipo de área esté en la lista disponible
          const validAreaType = this.areaTypes.find((at) => at.id === areaType.id);
          if (validAreaType) {
            this.headerConfig.formGroup.patchValue({ areaType: validAreaType });
            // Mantener el campo deshabilitado después del patchValue
            this.headerConfig.formGroup.get('areaType')?.disable();
            this._changeDetectorRef.detectChanges();
          } else {
            console.warn('Tipo de área obtenido no está en la lista disponible:', areaType);
            // Intentar encontrar por nombre como fallback
            const fallbackAreaType = this.areaTypes.find((at) => at.name === areaType.name || at.nameEN === areaType.nameEN);
            if (fallbackAreaType) {
              this.headerConfig.formGroup.patchValue({ areaType: fallbackAreaType });
              // Mantener el campo deshabilitado después del patchValue
              this.headerConfig.formGroup.get('areaType')?.disable();
              this._changeDetectorRef.detectChanges();
            }
          }
        } else {
          console.warn('No se encontró tipo de área para la ciudad:', city.name);
        }
      },
      error: (error) => {
        console.error('Error al obtener el tipo de área para la ciudad:', error);
      },
    });
  }

  // Método para obtener tipos de centro según el programa seleccionado
  // Get center types by program

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
          { emitEvent: false }
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
          { emitEvent: false }
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
   * Edita un elemento de la tabla
   * Edits an element of the table
   */
  onTableEditElement(event: Event, element: any) {
    event.stopPropagation();
    event.preventDefault();
    this._customRouterService.navigate([`sites-pdam/edit/${element.satelliteSiteId}`]);
  }

  /**
   * Maneja el cambio en el campo de estado activo/inactivo
   * Handles the change in the active/inactive status field
   * NOTA: Este método ya no se usa ya que los campos se manejan desde el modal de Settings
   * NOTE: This method is no longer used as fields are managed from the Settings modal
   */
  // onIsActiveChange(event: any): void {
  //   // Método eliminado - los campos isActive, inactiveDate e inactiveJustification
  //   // ahora se manejan desde el modal de Settings
  // }

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
        deliveryTypeName: this.currentLang === 'en' ? deliveryType.nameEN : deliveryType.name,
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
        deliveryTypeName: this.currentLang === 'en' ? deliveryType.nameEN : deliveryType.name,
        deliveryTypeNameEN: deliveryType.nameEN,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action === 'submit') {
        // Aquí se implementaría la lógica para enviar la solicitud de permiso
        // Por ahora, solo mostramos un mensaje de confirmación
        this._notificationService.showSuccess('Solicitud de permiso enviada correctamente');

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

  /**
   * Verifica si debe mostrar el campo Tipo de Distribución usando FieldVisibilityService
   */
  shouldShowDistributionType(): boolean {
    const groupType = this.headerConfig.formGroup.get('groupType')?.value;

    // Obtener el tipo de grupo como string para el servicio
    const groupTypeKey = this.getGroupTypeKey(groupType);

    return this._fieldVisibilityService.shouldShowField('distributionType', groupTypeKey);
  }

  /**
   * Actualiza las validaciones condicionales usando FieldVisibilityService
   */
  private updateDistributionTypeValidation(): void {
    const groupType = this.headerConfig.formGroup.get('groupType')?.value;
    const distributionTypeControl = this.headerConfig.formGroup.get('distributionType');

    // Obtener el tipo de grupo como string para el servicio
    const groupTypeKey = this.getGroupTypeKey(groupType);

    const isRequired = this._fieldVisibilityService.isFieldRequired('distributionType', groupTypeKey);

    if (isRequired) {
      // Requerir distribución type
      distributionTypeControl?.setValidators([Validators.required]);
      distributionTypeControl?.enable();
    } else {
      // No requerir para otros tipos y deshabilitar el campo
      distributionTypeControl?.clearValidators();
      distributionTypeControl?.setValue(null); // Limpiar el valor
      distributionTypeControl?.disable();
      distributionTypeControl?.markAsUntouched(); // Limpiar estado de validación
    }

    distributionTypeControl?.updateValueAndValidity();

    // Actualizar el estado del botón después de cambiar las validaciones
    this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;
    this._changeDetectorRef.detectChanges();
  }

  /**
   * Actualiza la visibilidad del campo Tipo de Centro y Tipo de Institución Residencial basado en el tipo de organización seleccionado
   */

  /**
   * Convierte el objeto groupType a la clave usada en la configuración
   */
  private getGroupTypeKey(groupType: any): string {
    if (!groupType) return '';

    // Usar directamente el nombre del groupType
    return groupType.name || groupType.nameEN || '';
  }

  // Método para obtener Site Location según el tipo de grupo seleccionado
  // Get site location by group type
  getSiteLocationByGroupType(groupType: OptionSelection): void {
    if (!groupType) {
      this.siteLocations = [];
      this.isSiteLocationDisabled = false; // Mantener habilitado
      return;
    }

    // Para TODOS los tipos de grupo, usar la API para obtener el Site Location válido
    this.isSiteLocationDisabled = false;

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

  /**
   * Verifica si se deben mostrar los campos de fecha de inicio de provisión
   * Solo se muestran cuando la política de funcionamiento es 3, 4 o 5 (Provisión I, II, III)
   */
  /**
   * Determina si se debe mostrar el campo de capacidad de salón comedor
   */
  shouldShowDiningRoomCapacity(): boolean {
    return this.headerConfig.formGroup.get('hasDiningRoom')?.value === true;
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
    return (
      hasDiningRoom &&
      capacity != null &&
      enrollment != null &&
      !Number.isNaN(capacityNum) &&
      !Number.isNaN(enrollmentNum) &&
      capacityNum < enrollmentNum
    );
  }

  /**
   * Determina si se deben mostrar campos adicionales para diferentes grupos
   * Se muestra cuando la capacidad del salón comedor es menor que la matrícula general
   */
  shouldShowDifferentGroupsFields(): boolean {
    return true; // Tabla siempre habilitada
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
    const totalChildren = this.servicesByGroups.reduce(
      (sum, g) => sum + Number(g.numberOfChildren ?? 0),
      0
    );
    const maxEnrollment = Number(generalEnrollment);
    if (maxEnrollment != null && !Number.isNaN(maxEnrollment) && totalChildren > maxEnrollment) {
      this._notificationService.showErrorDialog('sites.edit.groups.total-exceeds-enrollment');
      return false;
    }
    if (hasDiningRoom && diningRoomCapacity != null) {
      const capacityNum = Number(diningRoomCapacity);
      const exceeds = this.servicesByGroups.some(
        (g) => Number(g.numberOfChildren ?? 0) > capacityNum
      );
      if (exceeds) {
        this._notificationService.showErrorDialog('sites.edit.groups.group-exceeds-capacity');
        return false;
      }
    }
    return true;
  }

  // ===== MÉTODOS PARA MANEJO DE TABLA DE SERVICIOS POR GRUPOS =====

  onAddMenuAction(menuItemId: string): void {
    if (menuItemId === 'add') {
      // Siempre en modo grupos
      this.onTableAdd();
    }
  }

  onTableAdd(): void {
    const hasDiningRoom = this.headerConfig.formGroup.get('hasDiningRoom')?.value === true;
    if (hasDiningRoom) {
      const diningRoomCapacityVal = this.headerConfig.formGroup.get('diningRoomCapacity')?.value;
      if (diningRoomCapacityVal == null || diningRoomCapacityVal === '' || Number(diningRoomCapacityVal) < 1) {
        this._notificationService.showErrorDialog('sites.edit.groups.dining-room-capacity-required');
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
        existingGroups: this.servicesByGroups.map(s => ({ id: s.id, numberOfChildren: s.numberOfChildren })),
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
        this.servicesCardLoading = true;
        this._changeDetectorRef?.markForCheck();
        const newId = this.servicesByGroups.length > 0
          ? Math.max(...this.servicesByGroups.map((s) => s.id || 0)) + 1
          : 1;
        this.servicesByGroups.push({ ...result, id: newId });
        this.updateServicesTableDataSource();
        this.syncChildGroupsFromServices();
        this.saveChildGroupsToBackend();
      }
    });
  }

  onTableEdit(event: Event, id: number): void {
    // Siempre en modo grupos
    const serviceToEdit = this.servicesByGroups.find((s) => s.id === id);
    if (!serviceToEdit) {
      this._notificationService.showError('sites.add.services.error.service-not-found');
      return;
    }
    const hasDiningRoom = this.headerConfig.formGroup.get('hasDiningRoom')?.value === true;
    if (hasDiningRoom) {
      const diningRoomCapacityVal = this.headerConfig.formGroup.get('diningRoomCapacity')?.value;
      if (diningRoomCapacityVal == null || diningRoomCapacityVal === '' || Number(diningRoomCapacityVal) < 1) {
        this._notificationService.showErrorDialog('sites.edit.groups.dining-room-capacity-required');
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
          existingGroups: this.servicesByGroups.map(s => ({ id: s.id, numberOfChildren: s.numberOfChildren })),
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
          this.servicesCardLoading = true;
          this._changeDetectorRef?.markForCheck();
          const index = this.servicesByGroups.findIndex((s) => s.id === id);
          if (index !== -1) {
            this.servicesByGroups[index] = { ...result, id };
            this.updateServicesTableDataSource();
            this.syncChildGroupsFromServices();
            this.saveChildGroupsToBackend();
          }
        }
      });
  }

  onTableDelete(event: Event, id: number): void {
    // Siempre en modo grupos
    const serviceToDelete = this.servicesByGroups.find((s) => s.id === id);
    if (!serviceToDelete) {
      this._notificationService.showError('sites.add.services.error.service-not-found');
      return;
    }

    const confirmMessage = this._translocoService.translate('sites.add.services.confirm-delete', {
      groupName: serviceToDelete.groupName,
    });

    this._notificationService.showConfirmationDialogWithCallback({
      message: confirmMessage,
      icon: {
        show: true,
        name: 'heroicons_outline:trash',
        color: 'warn'
      },
      actions: {
        confirm: {
          label: 'users.list.actions.delete',
          color: 'warn'
        }
      }
    }, (result) => {
      if (result === 'confirmed') {
        this.servicesCardLoading = true;
        this._changeDetectorRef?.markForCheck();
        const index = this.servicesByGroups.findIndex((s) => s.id === id);
        if (index !== -1) {
          this.servicesByGroups.splice(index, 1);
          this.updateServicesTableDataSource();
          this.syncChildGroupsFromServices();
          this.saveChildGroupsToBackend();
        }
      }
    });
  }

  private saveChildGroupsToBackend(): void {
    const siteId = this.param?.id;
    if (siteId == null) {
      this.servicesCardLoading = false;
      this._changeDetectorRef?.markForCheck();
      return;
    }
    const payload = this.childGroups.map((g) => ({
      groupName: g.groupName,
      numberOfChildren: g.numberOfChildren,
      serviceSlots: (g.serviceSlots ?? []).map((slot) => ({
        serviceTypeId: slot.serviceTypeId,
        isOffered: slot.isOffered,
        fromTime: slot.fromTime ?? (slot as { from?: string }).from ?? undefined,
        toTime: slot.toTime ?? (slot as { to?: string }).to ?? undefined,
        operatingDates: (slot.operatingDates ?? []).map((od: string | { date?: string }) =>
          typeof od === 'string' ? od : (od as { date?: string }).date
        ).filter((d): d is string => typeof d === 'string'),
      })),
    }));
    this._siteService.updateSiteChildGroups(siteId, payload).subscribe({
      next: () => {
        this.servicesCardLoading = false;
        this._changeDetectorRef?.markForCheck();
        this._notificationService.showSuccessDialog('sites.edit.childGroups.saved');
        this._siteService.getSiteById({ id: siteId }).subscribe({
          next: (response) => {
            const site = response?.body ?? response;
            if (site) {
              this.onSetForm(site);
              this._changeDetectorRef?.markForCheck();
            }
          },
        });
      },
      error: () => {
        this.servicesCardLoading = false;
        this._changeDetectorRef?.markForCheck();
        this._notificationService.showErrorDialog('sites.edit.childGroups.error');
      },
    });
  }

  /** Mapeo serviceTypeId → clave de columna desde programData.serviceTypes (code en camelCase). */
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
        const label = slotWithName.serviceTypeName ?? (currentLang === 'en' ? st?.nameEN : st?.name) ?? st?.name ?? st?.code;
        return { ...slot, serviceTypeName: label };
      });
      const booleans: Record<string, boolean> = {};
      const fromTo: Record<string, string | undefined> = {};
      for (const [idStr, key] of Object.entries(idToKey)) {
        const id = Number(idStr);
        const slot = slots.find((s) => s.serviceTypeId === id && s.isOffered);
        booleans[key] = !!slot;
        const s = slot as SiteChildGroupServiceSlotResponse | undefined;
        let fromVal = s?.from ?? s?.fromTime;
        let toVal = s?.to ?? s?.toTime;
        if ((fromVal == null || toVal == null) && s?.operatingDates?.length) {
          const firstWithTimes = (s.operatingDates as { from?: string; to?: string; From?: string; To?: string }[]).find(
            (od) => (od.from ?? od.From) && (od.to ?? od.To)
          );
          if (firstWithTimes) {
            fromVal = fromVal ?? firstWithTimes.from ?? (firstWithTimes as { From?: string }).From;
            toVal = toVal ?? firstWithTimes.to ?? (firstWithTimes as { To?: string }).To;
          }
        }
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
    this.childGroups = this.servicesByGroups.map(service => ({
      id: service.id,
      siteId: this.param?.id || 0,
      groupName: service.groupName,
      groupNameEN: service.groupName,
      numberOfChildren: service.numberOfChildren,
      serviceSlots: service.serviceSlots ?? [],
    }));
  }



  get shouldShowProvisionFields(): boolean {
    const operatingPolicy = this.headerConfig.formGroup.get('operatingPolicy')?.value;

    // Verificar si la política seleccionada es 3, 4 o 5
    if (operatingPolicy && operatingPolicy.id) {
      return operatingPolicy.id === 3 || operatingPolicy.id === 4 || operatingPolicy.id === 5;
    }

    return false;
  }
}
