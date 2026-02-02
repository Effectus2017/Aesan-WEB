import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Validators, ReactiveFormsModule, UntypedFormBuilder, AbstractControl } from '@angular/forms';
import { SiteService } from 'app/shared/services/site.service';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GeoService } from 'app/shared/services/geo.service';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericTableConfig, OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { SiteChildGroupRequest } from 'app/shared/models/Request/SiteChildGroupRequest';
import { AddServiceByGroupModalComponent, ServiceByGroupDialogData, ServiceByGroupDialogResult } from 'app/shared/components/add-service-by-group-modal/add-service-by-group-modal.component';
import { SERVICES_COLUMNS_SCHEMA } from 'app/shared/components/add-service-by-group-modal/services-columns-schema';
import { ServiceTypeByProgram } from 'app/shared/models/ServiceTypeByProgram';
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
import { SiteRequest } from 'app/shared/models/Request/SiteRequest';
import { GroupTypeService } from 'app/shared/services/group-type.service';
import { KitchenTypeService } from 'app/shared/services/kitchen-type.service';
import { DeliveryTypeService } from 'app/shared/services/delivery-type.service';
import { AuthService } from 'app/core/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { OrganizationType } from 'app/shared/models/OrganizationType';
import { DeliveryType } from 'app/shared/models/DeliveryType';
import {
  compareById,
  isNullOrUndefinedEmptyStringNullArray,
  toTimeDate,
  toTimeString,
  logFormValidationErrors,
  generateTimeOptions,
  filterStartTimeOptions,
  getEndTimeOptions,
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
import { MatTableDataSource } from '@angular/material/table';

import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { AreaType } from 'app/shared/models/AreaType';
import { DayOfWeekResponse } from 'app/shared/models/DayOfWeekResponse';
import { MatDialog } from '@angular/material/dialog';
import { PermissionRequestDialogComponent } from '../../../../shared/components/permission-request-dialog/permission-request-dialog.component';
import { PermissionRequestFormDialogComponent } from '../../../../shared/components/permission-request-form-dialog/permission-request-form-dialog.component';
import { FieldVisibilityService } from 'app/shared/services/field-visibility.service';
import { AreaTypeService } from 'app/shared/services/area-type.service';
import { AgencyService } from 'app/shared/services/agency.service';
import { Agency } from 'app/shared/models/Agency';
import { PROGRAM_IDS, isPDAMProgram } from 'app/shared/const';
import { CfrInfoDialogComponent } from 'app/shared/components/cfr-info-dialog/cfr-info-dialog.component';
import { NumericOnlyDirective } from 'app/shared/directives/numeric-only.directive';
import { PhoneFormatDirective } from 'app/shared/directives/phone-format.directive';
import { SiteStatusModalComponent, SiteStatusModalData } from 'app/shared/components/site-status-modal/site-status-modal.component';
import {
  SiteChangesCancellationsModalComponent,
  SiteChangesCancellationsModalData,
} from 'app/shared/components/site-changes-cancellations-modal/site-changes-cancellations-modal.component';

import { puertoRicoPhoneValidator } from 'app/shared/validators/puerto-rico-phone.validator';
import { puertoRicoZipCodeValidator } from 'app/shared/validators/puerto-rico-zip-code.validator';
import { operatingHoursRangeValidator } from 'app/shared/validators/operating-hours-range.validator';
import { PuertoRicoZipCodeDirective } from 'app/shared/directives/puerto-rico-zip-code.directive';
import { LatitudeDirective } from 'app/shared/directives/latitude.directive';
import { LongitudeDirective } from 'app/shared/directives/longitude.directive';
import { DateCalculationsUtil } from 'app/shared/utils/date-calculations.util';
import { TimeValidationUtil, ServiceConfig } from 'app/shared/utils/time-validation.util';
import { DynamicGridDirective } from 'app/shared/directives/dynamic-grid.directive';
import { SATELLITE_SCHOOLS_COLUMNS_SCHEMA } from 'app/shared/components/site-satellites-modal/columns-schema';

@Component({
  selector: 'app-sites-psav-edit',
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
    DynamicGridDirective
],
})
export class EditSitePsavComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers, OnGenericTableHandler {
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

  // Tipo de entrega
  // Delivery type
  deliveryTypes: DeliveryType[] = [];

  // Tipo de solicitante
  // Type of applicant
  typeOfApplicant: OptionSelection[] = [];

  // Estatus
  // Status
  isActive: OptionSelection[] = [];

  // Tipo de cocina
  // Type of kitchen
  kitchenTypes: OptionSelection[] = [];
  isKitchenTypeDisabled: boolean = false;

  // Site Location
  // Site location - Determined by group type
  siteLocations: OptionSelection[] = [];

  // Propiedad para controlar visibilidad del campo Tipo de Localización
  // Property to control visibility of the Location Type field
  isSiteLocationDisabled: boolean = false;

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
  // COMENTADO: Se va a cambiar de lugar
  // reviewResult: OptionSelection[] = [];

  // Lista de sitios
  // List of sites

  // Propiedad para controlar visibilidad del campo Tipo de Centro

  // Propiedad para controlar visibilidad del campo Tipo de Institución Residencial
  showResidentialTypeField: boolean = false;


  // Opciones de hora para los campos "hasta" - se filtran dinámicamente
  timeOptions: TimeOption[] = [];

  currentLang: string = 'es';

  // Tipo de área
  // Type of area
  areaTypes: AreaType[] = [];

  // Tipo de localización
  // Type of location
  locationTypes: AreaType[] = [];

  // Available days of the week for selection (filtered by program)
  // Se cargan desde el backend, no hardcodeados
  availableDaysOfWeek: DayOfWeekResponse[] = [];

  // Parámetro del sitio
  // Site parameter
  param: Site | null;

  // Propiedades para grupos de niños y servicios por grupos
  childGroups: SiteChildGroupRequest[] = [];
  servicesByGroups: ServiceByGroupDialogResult[] = [];
  servicesTableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<any>([]),
    columnsSchema: SERVICES_COLUMNS_SCHEMA,
    displayedColumns: SERVICES_COLUMNS_SCHEMA.map((col) => col.key as string),
    addMenuShow: true,
    addMenuItems: [
      { id: 'add', label: 'sites.add.services.add-service', icon: 'mat_outline:add' },
    ],
    handler: this,
    showPaginator: true,
    pageSizeOptions: [5, 10, 25, 50],
    pageSize: 10,
    fullScreen: false,
    viewMode: 'cards'
  };
  tableConfig: GenericTableConfig = this.servicesTableConfig;

  // Configuración del header y formulario reactivo
  // Header config and reactive form
  headerConfig: GenericHeaderConfig = {
    title: 'sites.edit.title',
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
      // Tipo de organización - Campo requerido para la clasificación del sitio
      // Organization type - Required field for site classification
      organizationType: [null, Validators.required],
      // Centro - Campo requerido para la clasificación del sitio
      // Center - Required field for site classification
      // Fechas de funcionamiento - Fechas desde y hasta cuando opera el sitio
      // Operating dates - Dates from and to when the site operates
      operatingFromDate: [null, Validators.required],
      operatingToDate: [null, Validators.required],
      operatingDaysCalculated: [{ value: null, disabled: true }],
      // Horas de funcionamiento - Horas de inicio y fin para los días de funcionamiento
      // Operating hours - Start and end times for operating days
      operatingStartTime: [null, Validators.required],
      operatingEndTime: [null, Validators.required],
      // Días de la semana en que opera el sitio (selección múltiple)
      // Days of the week the site operates (multiple selection)
      operatingDaysOfWeek: [[], Validators.required],

      // ¿Cuánto tiempo lleva el sitio ofreciendo servicios con una matrícula establecida?
      // How long has the site been providing services with an established enrollment?
      serviceTime: [null],
      // Datos Operativos / Operational Data
      // Tipo de cocina - Tipo de instalación de cocina
      // Kitchen type - Type of kitchen facility
      kitchenType: [null],
      // Site Location - Determined by Group Type
      // Site location - Determined by group type
      siteLocation: [null],
      // Tipo de grupo - Clasificación de grupos de estudiantes
      // Group type - Classification of student groups
      groupType: [null],
      // Tipo de distribución - Método de distribución para sitios no congregados
      // Distribution type - Distribution method for non-congregate sites
      distributionType: [{ value: null, disabled: true }],
      // Tipo de entrega - Método de entrega de servicio
      // Delivery type - Method of service delivery
      deliveryType: [null],
      // Tipo de solicitante - Tipo de solicitante del sitio
      // Type of applicant - Type of applicant of the site
      typeOfApplicant: [null],
      // Tipo de área - Tipo de área del sitio
      // Type of area - Type of area of the site
      // (tipo select-SOLO DISABLED - se auto-selecciona según ciudad)
      areaType: [{ value: null, disabled: true }],
      // Localización - Tipo de localización del sitio
      // Location - Type of location of the site
      // (tipo select - selección manual)
      locationType: [null, Validators.required],
      // Almacén - Campo requerido para indicar si el sitio tiene un almacén
      // Warehouse - Required field indicating if the site has a warehouse
      hasWarehouse: [false],
      // Comedor - Campo requerido para indicar si el sitio tiene un comedor
      // Dining room - Required field indicating if the site has a dining room
      hasDiningRoom: [false],
      // Capacidad de Salón Comedor - Solo visible cuando hasDiningRoom es true
      // Dining room capacity - Only visible when hasDiningRoom is true
      diningRoomCapacity: [null, [Validators.min(1)]],
      // Persona a Cargo (solo para PDAM y PSAV)
      // Person in Charge (only for PDAM and PSAV)
      personInCharge: this._formBuilder.group({
        firstName: [''],
        middleName: [''],
        fatherLastName: [''],
        motherLastName: [''],
        sitePhone: ['', puertoRicoPhoneValidator()],
        extension: [''],
        mobilePhone: ['', puertoRicoPhoneValidator()],
      }),
      // COMENTADO: Servicios individuales ya no se usan - se manejan dentro de grupos
      // Desayuno - Campo requerido para indicar si el sitio tiene desayuno
      // Breakfast - Required field indicating if the site has breakfast
      // breakfast: [false],
      // Desayuno desde - Campo requerido para indicar la hora de inicio del desayuno
      // Breakfast from - Required field indicating the start time of breakfast
      // breakfastFrom: [null],
      // Desayuno hasta - Campo requerido para indicar la hora de fin del desayuno
      // Breakfast to - Required field indicating the end time of breakfast
      // breakfastTo: [null],
      // Almuerzo - Campo requerido para indicar si el sitio tiene almuerzo
      // Lunch - Required field indicating if the site has lunch
      // lunch: [false],
      // Almuerzo desde - Campo requerido para indicar la hora de inicio del almuerzo
      // Lunch from - Required field indicating the start time of lunch
      // lunchFrom: [null],
      // Almuerzo hasta - Campo requerido para indicar la hora de fin del almuerzo
      // Lunch to - Required field indicating the end time of lunch
      // lunchTo: [null],
      // Merienda AM - Campo requerido para indicar si el sitio tiene merienda AM
      // Snack AM - Required field indicating if the site has snack AM
      // snackAM: [false],
      // Merienda AM desde - Campo requerido para indicar la hora de inicio de la merienda AM
      // Snack AM from - Required field indicating the start time of snack AM
      // snackAMFrom: [null],
      // Merienda AM hasta - Campo requerido para indicar la hora de fin de la merienda AM
      // Snack AM to - Required field indicating the end time of snack AM
      // snackAMTo: [null],
      // Merienda PM - Campo requerido para indicar si el sitio tiene merienda PM
      // Snack PM - Required field indicating if the site has snack PM
      // snackPM: [false],
      // Merienda PM desde - Campo requerido para indicar la hora de inicio de la merienda PM
      // Snack PM from - Required field indicating the start time of snack PM
      // snackPMFrom: [null],
      // Merienda PM hasta - Campo requerido para indicar la hora de fin de la merienda PM
      // Snack PM to - Required field indicating the end time of snack PM
      // snackPMTo: [null],
      // Cena - Campo requerido para indicar si el sitio tiene cena
      // Dinner - Required field indicating if the site has dinner
      // dinner: [false],
      // Cena desde - Campo requerido para indicar la hora de inicio de la cena
      // Dinner from - Required field indicating the start time of dinner
      // dinnerFrom: [null],
      // Cena hasta - Campo requerido para indicar la hora de fin de la cena
      // Dinner to - Required field indicating the end time of dinner
      // dinnerTo: [null],
      // Merienda nocturna - Campo requerido para indicar si el sitio tiene merienda nocturna
      // Snack night - Required field indicating if the site has snack night
      // snackNight: [false],
      // Merienda nocturna desde - Campo requerido para indicar la hora de inicio de la merienda nocturna
      // Snack night from - Required field indicating the start time of snack night
      // snackNightFrom: [null],
      // Merienda nocturna hasta - Campo requerido para indicar la hora de fin de la merienda nocturna
      // Snack night to - Required field indicating the end time of snack night
      // snackNightTo: [null],
      // Comunidad - Campo requerido para indicar la comunidad del sitio
      // Community - Required field indicating the community of the site
      community: [null, Validators.required],
      // Caminantes - Campo requerido para indicar los caminantes del sitio
      // Walkers - Required field indicating the walkers of the site
      walkers: [null, Validators.required],
      // Tipo de sitio - Campo requerido para indicar el tipo de sitio
      // Site type - Required field indicating the site type
      siteType: [null, Validators.required],
      // Experiencia - Campo requerido para indicar la experiencia del sitio
      // Experience - Required field indicating the experience of the site
      experience: [null, Validators.required],
      // Estado activo/inactivo del sitio
      // Active/inactive status of the site
      isActive: [true],
      // Justificación de inactivación - Requerida cuando isActive es false
      // Inactivation justification - Required when isActive is false
      inactiveJustification: [{ value: '', disabled: true }],
      // Fecha de inactivación - Fecha cuando se inactivó el sitio
      // Inactivation date - Date when the site was inactivated
      inactiveDate: [{ value: null, disabled: true }],
      // Resultado de revisión - Resultado de la revisión del sitio
      // Review result - Result of the site review
      // COMENTADO: Se va a cambiar de lugar
      // reviewResult: [null],
      // Fecha de revisión - Fecha cuando se realizó la revisión
      // Review date - Date when the review was conducted
      // reviewDate: [null],
      // Justificación de revisión - Justificación de la revisión
      // Review justification - Justification of the review
      // reviewJustification: [null],
      // Matrícula General
      // General Enrollment
      generalEnrollment: [null, [Validators.pattern(/^\d+$/)]],

      // ===== CAMPOS ESPECÍFICOS PARA PACNA =====

      // ¿El sitio ofrece programas atléticos organizados que participan en deportes competitivos interescolares o a nivel comunitario?
      // Does the site offer organized athletic programs engaged in interscholastic or community level competitive sports?

      // Código de Sitio
      // Site Code
      siteCode: [{ value: '', disabled: true }],
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
    pageSizeOptions: [25, 50, 100],
    length: 0,
  };

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

  /**
   * Ordena las opciones de community alfabéticamente según el idioma actual
   */
  private sortOptionsAlphabetically(options: OptionSelection[]): OptionSelection[] {
    return [...options].sort((a, b) => {
      const nameA = (this.currentLang === 'en' ? a.nameEN : a.name).toLowerCase();
      const nameB = (this.currentLang === 'en' ? b.nameEN : b.name).toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }

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
      // Comunidad
      this.community = this.sortOptionsAlphabetically(resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'community'));
      // Caminantes / Walkers
      this.walkers = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'walkers');
      // Tipo de distribución / Distribution type
      this.distributionType = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'distributionType');
      // Tipo de sitio / Site type
      this.siteType = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'siteType');
      // Experiencia / Experience
      this.experience = this.sortOptionsAlphabetically(resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'experience'));

      // Resultado de revisión / Review result
      // COMENTADO: Se va a cambiar de lugar
      // this.reviewResult = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'reviewResult');

      // Catálogos
      this.organizationTypes = resolvedData.organizationTypes;
      this.kitchenTypes = resolvedData.kitchenTypes;
      this.groupTypes = resolvedData.groupTypes;

      this.deliveryTypes = resolvedData.deliveryTypes;
      this.listCities = resolvedData.cities;
      this.listRegions = resolvedData.regions;
      this.listPostalRegions = resolvedData.regions;
      this.areaTypes = resolvedData.areaTypes;
      this.locationTypes = resolvedData.areaTypes; // Usar los mismos valores que AreaType

      // Cargar días permitidos desde el resolver
      this.availableDaysOfWeek = resolvedData.allowedOperatingDays;

      // Usar la sitio del resolver
      // Use site from resolver
      this.onSetForm(resolvedData.site);

      this._changeDetectorRef.markForCheck();
    }

    // Obtener datos de la agencia para determinar campos visibles
    this._agencyService.agency$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.agency = result.body;
      }
    });

    // Transloco
    this._translocoService.langChanges$.pipe(takeUntil(this._unsubscribeAll)).subscribe((lang: string) => {
      this.currentLang = lang;
      this.community = this.sortOptionsAlphabetically(this.community);
      this.experience = this.sortOptionsAlphabetically(this.experience);
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

    // Escuchar cambios en los días seleccionados para recalcular los días operativos
    this.headerConfig.formGroup.get('operatingDaysOfWeek')?.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        DateCalculationsUtil.calculateOperatingDays(this.headerConfig.formGroup);
      });

    // COMENTADO: Servicios individuales ya no se usan - se manejan dentro de grupos
    // Suscribirse a cambios en operatingStartTime y operatingEndTime para revalidar servicios
    // this.headerConfig.formGroup
    //   .get('operatingStartTime')
    //   ?.valueChanges.pipe(takeUntil(this._unsubscribeAll))
    //   .subscribe(() => {
    //     this.revalidateAllServiceTimes();
    //   });

    // this.headerConfig.formGroup
    //   .get('operatingEndTime')
    //   ?.valueChanges.pipe(takeUntil(this._unsubscribeAll))
    //   .subscribe(() => {
    //     this.revalidateAllServiceTimes();
    //   });

    // Listener para cambios en groupType que afectan distributionType, siteLocation, kitchenType y deliveryTypes
    this.headerConfig.formGroup.get('groupType')?.valueChanges.subscribe((groupType) => {
      this.updateDistributionTypeValidation();
      this.getSiteLocationByGroupType(groupType);
      // Actualizar tipos de cocina según el grupo seleccionado
      this.getKitchenTypesByGroupType(groupType);
      this.loadDeliveryTypesByGroupType(groupType);
      this._changeDetectorRef.detectChanges();
    });

    // Listener para cambios en organizationType
    this.headerConfig.formGroup.get('organizationType')?.valueChanges.subscribe(() => {
      this._changeDetectorRef.detectChanges();
    });

    // Campos isActive, inactiveDate e inactiveJustification ahora se manejan desde el modal de Settings
    // No se necesita suscripción a cambios de isActive ya que se gestiona desde el modal

    // COMENTADO: Servicios individuales ya no se usan - se manejan dentro de grupos
    // Configurar validaciones condicionales para servicios
    // this.setupServiceValidations();

    // Listener para cambios en hasDiningRoom
    this.headerConfig.formGroup.get('hasDiningRoom')?.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((hasDiningRoom: boolean) => {
        const capacityControl = this.headerConfig.formGroup.get('diningRoomCapacity');
        if (hasDiningRoom === false) {
          capacityControl?.setValue(null, { emitEvent: false });
          capacityControl?.clearValidators();
          capacityControl?.updateValueAndValidity({ emitEvent: false });
        } else if (hasDiningRoom === true) {
          capacityControl?.setValidators([Validators.min(1)]);
          capacityControl?.updateValueAndValidity({ emitEvent: false });
        }
        this._changeDetectorRef.detectChanges();
      });

    // Listener para cambios en diningRoomCapacity y generalEnrollment
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
  }

  /**
   * COMENTADO: Servicios individuales ya no se usan - se manejan dentro de grupos
   * Configura validaciones condicionales para todos los servicios
   * Cuando un servicio está en "Sí" (true), los campos "Hora desde" y "Hora hasta" son requeridos
   * Si hay horarios seleccionados, el campo si/no del servicio es requerido
   */
  // private setupServiceValidations(): void {
  //   // Lista de servicios con sus campos From y To correspondientes
  //   const services = [
  //     { service: 'breakfast', from: 'breakfastFrom', to: 'breakfastTo' },
  //     { service: 'lunch', from: 'lunchFrom', to: 'lunchTo' },
  //     { service: 'snackAM', from: 'snackAMFrom', to: 'snackAMTo' },
  //     { service: 'snackPM', from: 'snackPMFrom', to: 'snackPMTo' },
  //     { service: 'dinner', from: 'dinnerFrom', to: 'dinnerTo' },
  //     { service: 'snackNight', from: 'snackNightFrom', to: 'snackNightTo' },
  //   ];

  //   // Configurar suscripciones para cada servicio
  //   services.forEach(({ service, from, to }) => {
  //     const serviceControl = this.headerConfig.formGroup.get(service);
  //     const fromControl = this.headerConfig.formGroup.get(from);
  //     const toControl = this.headerConfig.formGroup.get(to);

  //     if (serviceControl && fromControl && toControl) {
  //       // Validación inicial
  //       this.updateServiceTimeValidations(serviceControl.value, fromControl, toControl, serviceControl);
  //       this.updateServiceRequiredValidation(serviceControl, fromControl, toControl);

  //       // Suscribirse a cambios en el campo de servicio
  //       serviceControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((value: boolean | null) => {
  //         this.updateServiceTimeValidations(value, fromControl, toControl, serviceControl);
  //         this.updateServiceRequiredValidation(serviceControl, fromControl, toControl);
  //       });

  //       // Suscribirse a cambios en "Hora desde" para validar y ajustar "Hora hasta"
  //       fromControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
  //           TimeValidationUtil.validateAndAdjustTimeRange(fromControl, toControl);
  //           TimeValidationUtil.validateTimeRange(fromControl, toControl);
  //         this.updateServiceRequiredValidation(serviceControl, fromControl, toControl);
  //         // Forzar detección de cambios para actualizar las opciones en el template
  //         this._changeDetectorRef.detectChanges();
  //       });

  //       // Suscribirse a cambios en "Hora hasta" para validar y ajustar si es necesario
  //       toControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
  //           TimeValidationUtil.validateAndAdjustTimeRange(fromControl, toControl);
  //           TimeValidationUtil.validateTimeRange(fromControl, toControl);
  //         this.updateServiceRequiredValidation(serviceControl, fromControl, toControl);
  //       });
  //     }
  //   });
  // }

  /**
   * Genera todas las opciones de hora (cada 30 minutos)
   */
  private initializeTimeOptions(): void {
    this.timeOptions = generateTimeOptions();
  }

  /**
   * COMENTADO: Servicios individuales ya no se usan - se manejan dentro de grupos
   * Obtiene las opciones filtradas para un campo "desde" basado en las horas de funcionamiento
   */
  // getStartTimeOptions(): TimeOption[] {
  //   const operatingStartTime = this.headerConfig.formGroup.get('operatingStartTime')?.value;
  //   const operatingEndTime = this.headerConfig.formGroup.get('operatingEndTime')?.value;

  //   return filterStartTimeOptions(
  //     this.timeOptions,
  //     operatingStartTime,
  //     operatingEndTime
  //   );
  // }

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

    return getEndTimeOptions(
      this.timeOptions,
      fromTime,
      '23:59',
      operatingStartTime,
      operatingEndTime
    );
  }

  /**
   * Convierte string HH:mm a objeto Date (wrapper para usar en template)
   */
  timeStringToDateWrapper(timeString: string): Date | null {
    return timeStringToDate(timeString);
  }

  /**
   * Valida y ajusta la hora "hasta" si es menor o igual a "desde"
   * Establece la hora "hasta" en la siguiente hora válida (30 minutos después de "desde")
   */

  /**
   * COMENTADO: Servicios individuales ya no se usan - se manejan dentro de grupos
   * Verifica si un campo de hora "hasta" es inválido (menor o igual a "desde")
   */
  // isEndTimeInvalid(fromField: string, toField: string): boolean {
    // const fromControl = this.headerConfig.formGroup.get(fromField);
    // const toControl = this.headerConfig.formGroup.get(toField);

    // if (!fromControl || !toControl) return false;

    // const fromTime = fromControl.value;
    // const toTime = toControl.value;

    // if (!fromTime || !toTime) return false;

    // const fromMinutes = dateToMinutes(fromTime);
    // const toMinutes = dateToMinutes(toTime);

    // return toMinutes <= fromMinutes;
  // }

  /**
   * COMENTADO: Servicios individuales ya no se usan - se manejan dentro de grupos
   * Actualiza la validación requerida del campo servicio basado en si hay horarios seleccionados
   * Si hay un horario "desde" o "hasta", el campo si/no del servicio es requerido
   */
  // private updateServiceRequiredValidation(serviceControl: AbstractControl, fromControl: AbstractControl, toControl: AbstractControl): void {
    // const fromTime = fromControl.value;
    // const toTime = toControl.value;
    // // Verificar si hay horarios (pueden ser Date, string, o null/undefined)
    // const hasFromTime = fromTime !== null && fromTime !== undefined && fromTime !== '';
    // const hasToTime = toTime !== null && toTime !== undefined && toTime !== '';

    // if (hasFromTime || hasToTime) {
    //   // Si hay algún horario seleccionado, el campo si/no es requerido
    //   serviceControl.setValidators([Validators.required]);
    //   serviceControl.updateValueAndValidity({ emitEvent: false });
    // } else {
    //   // Si no hay horarios, remover la validación requerida solo si el servicio no está en "Sí"
    //   const serviceValue = serviceControl.value;
    //   if (serviceValue !== true) {
    //     serviceControl.clearValidators();
    //     serviceControl.updateValueAndValidity({ emitEvent: false });
    //   }
    // }

    // // Actualizar el estado del botón después de cambiar las validaciones
    // this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;
    // this._changeDetectorRef.detectChanges();
  // }

  /**
   * COMENTADO: Servicios individuales ya no se usan - se manejan dentro de grupos
   * Actualiza las validaciones de los campos de hora según el estado del servicio
   * @param serviceValue Valor del servicio (true = Sí, false/null = No)
   * @param fromControl Control del campo "Hora desde"
   * @param toControl Control del campo "Hora hasta"
   * @param serviceControl Control del campo servicio (opcional, para actualizar validación del servicio)
   */
  // private updateServiceTimeValidations(serviceValue: boolean | null, fromControl: AbstractControl, toControl: AbstractControl, serviceControl?: AbstractControl): void {
    // const operatingStartTime = this.headerConfig.formGroup.get('operatingStartTime')?.value;
    // const operatingEndTime = this.headerConfig.formGroup.get('operatingEndTime')?.value;

    // if (serviceValue === true) {
    //   // Si el servicio está en "Sí", hacer requeridos los campos de hora y agregar validación de rango
    //   const fromValidators = [Validators.required];
    //   const toValidators = [Validators.required];

    //   // Agregar validador de rango si hay horas de funcionamiento configuradas
    //   if (operatingStartTime && operatingEndTime) {
    //     fromValidators.push(operatingHoursRangeValidator(operatingStartTime, operatingEndTime, true));
    //     toValidators.push(operatingHoursRangeValidator(operatingStartTime, operatingEndTime, false));
    //   }

    //   fromControl.setValidators(fromValidators);
    //   toControl.setValidators(toValidators);
    // } else {
    //   // Si el servicio está en "No" o null, remover validaciones requeridas
    //   fromControl.clearValidators();
    //   toControl.clearValidators();
    //   // Limpiar valores si el servicio está en "No"
    //   if (serviceValue === false) {
    //     fromControl.setValue(null, { emitEvent: false });
    //     toControl.setValue(null, { emitEvent: false });
    //     // Si el servicio está en "No", remover también la validación requerida del servicio
    //     if (serviceControl) {
    //       serviceControl.clearValidators();
    //       serviceControl.updateValueAndValidity({ emitEvent: false });
    //     }
    //   }
    // }

    // fromControl.updateValueAndValidity({ emitEvent: false });
    // toControl.updateValueAndValidity({ emitEvent: false });

    // // Actualizar el estado del botón de guardar después de cambiar las validaciones
    // // (necesario porque usamos emitEvent: false para evitar bucles infinitos)
    // this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;
    // this._changeDetectorRef.detectChanges();
  // }

  /**
   * COMENTADO: Servicios individuales ya no se usan - se manejan dentro de grupos
   * Revalida todos los campos de hora de servicios cuando cambian las horas de funcionamiento
   */
  // private revalidateAllServiceTimes(): void {
    // const services: ServiceConfig[] = [
    //   { service: 'breakfast', from: 'breakfastFrom', to: 'breakfastTo' },
    //   { service: 'lunch', from: 'lunchFrom', to: 'lunchTo' },
    //   { service: 'snackAM', from: 'snackAMFrom', to: 'snackAMTo' },
    //   { service: 'snackPM', from: 'snackPMFrom', to: 'snackPMTo' },
    //   { service: 'dinner', from: 'dinnerFrom', to: 'dinnerTo' },
    //   { service: 'snackNight', from: 'snackNightFrom', to: 'snackNightTo' },
    // ];

    // TimeValidationUtil.revalidateAllServiceTimes(
    //   this.headerConfig.formGroup,
    //   services,
    //   (serviceValue, fromControl, toControl, serviceControl) => {
    //     this.updateServiceTimeValidations(serviceValue, fromControl, toControl, serviceControl);
    //   }
    // );
  // }

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

  onSetForm(param: Site): void {
    this.param = param;

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
    const applicantType = param.applicantType;
    const organizationType = param.organizationType;
    const areaType = param.areaType;
    const locationType = param.locationType;

    // COMENTADO: Servicios individuales ya no se usan - se manejan dentro de grupos
    // Obtener datos de servicios desde el primer grupo (si existe)
    // Si hay grupos con servicios, usar el primer servicio del primer grupo
    // const siteService = param.childGroups && param.childGroups.length > 0 && param.childGroups[0].services && param.childGroups[0].services.length > 0
    //   ? param.childGroups[0].services[0]
    //   : null;

    // Horarios de servicios básicos
    // const breakfastFrom: Date | null = siteService ? toTimeDate(siteService.breakfastFrom) : null;
    // const breakfastTo: Date | null = siteService ? toTimeDate(siteService.breakfastTo) : null;
    // const lunchFrom: Date | null = siteService ? toTimeDate(siteService.lunchFrom) : null;
    // const lunchTo: Date | null = siteService ? toTimeDate(siteService.lunchTo) : null;
    // const snackAMFrom: Date | null = siteService ? toTimeDate(siteService.snackAMFrom) : null;
    // const snackAMTo: Date | null = siteService ? toTimeDate(siteService.snackAMTo) : null;
    // const snackPMFrom: Date | null = siteService ? toTimeDate(siteService.snackPMFrom) : null;
    // const snackPMTo: Date | null = siteService ? toTimeDate(siteService.snackPMTo) : null;

    // Campos adicionales
    // const dinnerFrom: Date | null = siteService ? toTimeDate(siteService.dinnerFrom) : null;
    // const dinnerTo: Date | null = siteService ? toTimeDate(siteService.dinnerTo) : null;
    // const snackNightFrom: Date | null = siteService ? toTimeDate(siteService.snackNightFrom) : null;
    // const snackNightTo: Date | null = siteService ? toTimeDate(siteService.snackNightTo) : null;

    const communityId = param.communityId;
    const walkersId = param.walkersId;
    const siteTypeId = param.siteTypeId;
    const experienceId = param.experienceId;
    // COMENTADO: Se va a cambiar de lugar
    // const reviewResultId = param.reviewResultId;
    // const reviewDate = param.reviewDate;
    // const reviewJustification = param.reviewJustification;

    // Obtener los días de operación seleccionados, con fallback a días permitidos
    // Convertir operatingDaysOfWeek (number[]) a formato DayOfWeekResponse[]
    const operatingDaysOfWeek = param.operatingDaysOfWeek;

    this.headerConfig.formGroup.patchValue({
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
      organizationType: organizationType,
      operatingFromDate: param.operatingFromDate,
      operatingToDate: param.operatingToDate,
      operatingDaysCalculated: param.operatingDaysCalculated,
      operatingStartTime: param.operatingStartTime ? toTimeDate(param.operatingStartTime) : null,
      operatingEndTime: param.operatingEndTime ? toTimeDate(param.operatingEndTime) : null,
      operatingDaysOfWeek: operatingDaysOfWeek,
      serviceTime: param.serviceTime,
      //
      nonProfit: param.nonProfit,
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
      // COMENTADO: Servicios individuales ya no se usan - se manejan dentro de grupos
      // Servicios básicos
      // breakfast: siteService?.breakfast ?? false,
      // breakfastFrom: breakfastFrom,
      // breakfastTo: breakfastTo,
      // lunch: siteService?.lunch ?? false,
      // lunchFrom: lunchFrom,
      // lunchTo: lunchTo,
      // snackAM: siteService?.snackAM ?? false,
      // snackAMFrom: snackAMFrom,
      // snackAMTo: snackAMTo,
      // snackPM: siteService?.snackPM ?? false,
      // snackPMFrom: snackPMFrom,
      // snackPMTo: snackPMTo,
      // dinner: siteService?.dinner ?? false,
      // dinnerFrom: dinnerFrom,
      // dinnerTo: dinnerTo,
      // snackNight: siteService?.snackNight ?? false,
      // snackNightFrom: snackNightFrom,
      // snackNightTo: snackNightTo,
      community: this.community.find((o) => o.id === communityId),
      walkers: this.walkers.find((o) => o.id === walkersId),
      siteType: this.siteType.find((o) => o.id === siteTypeId),
      experience: this.experience.find((o) => o.id === experienceId),
      // COMENTADO: Se va a cambiar de lugar
      // reviewResult: this.reviewResult.find((o) => o.id === reviewResultId),
      // reviewDate: reviewDate,
      // reviewJustification: reviewJustification,
      isActive: param.isActive,
      inactiveJustification: param.inactiveJustification || null,
      inactiveDate: param.inactiveDate,
      //
      kitchenType: kitchenType,
      siteLocation: siteLocation,
      groupType: groupType,
      deliveryType: deliveryType,
      applicantType: applicantType,
      applicantTypeId: applicantType?.id,
      typeOfApplicant: applicantType,
      areaType: areaType,
      locationType: locationType,
      generalEnrollment: param.generalEnrollment,
      siteCode: param.siteCode || '',
    });

    // Recalcular Total de Días de Funcionamiento tras cargar datos (valueChanges no se dispara con patchValue)
    DateCalculationsUtil.calculateOperatingDays(this.headerConfig.formGroup);

    // Auto-seleccionar areaType si es null y hay una ciudad seleccionada
    // Auto-select areaType if it's null and there's a city selected
    if (!areaType && city) {
      this.getAreaTypeByCity(city);
    }

    // Cargar deliveryTypes según el groupType inicial
    if (groupType) {
      this.loadDeliveryTypesByGroupType(groupType);
    }

    // Asegurar que el campo areaType permanezca deshabilitado
    // Ensure areaType field remains disabled
    this.headerConfig.formGroup.get('areaType')?.disable();

    // Actualizar validaciones de distributionType basado en groupType
    this.updateDistributionTypeValidation();

    // Satélites
    this.satellitesTableConfig.dataSource.data = param.satellites || [];
    this.satellitesTableConfig.length = param.satellites?.length || 0;

    // Servicios por grupos (desde childGroups con serviceSlots)
    this.servicesByGroups = (param.childGroups || []).map((g, idx) => ({
      id: g.id ?? idx + 1,
      groupName: g.groupName ?? '',
      numberOfChildren: g.numberOfChildren ?? 0,
      serviceSlots: g.serviceSlots ?? [],
    }));
    this.updateServicesTableDataSource();
    this.syncChildGroupsFromServices();

    // Calcular días operativos automáticamente si es necesario
    DateCalculationsUtil.calculateOperatingDaysIfNeeded(this.headerConfig.formGroup);

    // Actualizar el estado del botón después de cargar todos los datos
    this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;
    this._changeDetectorRef.detectChanges();
  }

  // ===== MÉTODOS PARA TABLA DE SERVICIOS POR GRUPOS =====

  onAddMenuAction(menuItemId: string): void {
    if (menuItemId === 'add') {
      this.onTableAdd();
    }
  }

  onTableAdd(): void {
    const generalEnrollment = this.headerConfig.formGroup.get('generalEnrollment')?.value;
    const diningRoomCapacity = this.headerConfig.formGroup.get('diningRoomCapacity')?.value;
    const operatingStartTime = this.headerConfig.formGroup.get('operatingStartTime')?.value;
    const operatingEndTime = this.headerConfig.formGroup.get('operatingEndTime')?.value;
    const programData = this._route.snapshot.data['programData'] as { serviceTypes?: unknown[] } | undefined;
    this._dialog.open(AddServiceByGroupModalComponent, {
      data: {
        isEdit: false,
        yesNoOptions: this.yesNoOptions,
        generalEnrollment: generalEnrollment,
        diningRoomCapacity: diningRoomCapacity,
        existingGroups: this.servicesByGroups.map(s => ({ id: s.id, numberOfChildren: s.numberOfChildren })),
        isPDAM: false,
        isPACNA: false,
        isPSAV: true,
        operatingStartTime: operatingStartTime,
        operatingEndTime: operatingEndTime,
        serviceTypes: programData?.serviceTypes ?? [],
      } as ServiceByGroupDialogData,
      width: '90vw',
      maxWidth: '1200px',
      height: '90vh',
      maxHeight: '800px',
      disableClose: true,
    }).afterClosed().subscribe((result: ServiceByGroupDialogResult) => {
      if (result) {
        const newId = this.servicesByGroups.length > 0
          ? Math.max(...this.servicesByGroups.map((s) => s.id || 0)) + 1
          : 1;
        this.servicesByGroups.push({ ...result, id: newId });
        this.updateServicesTableDataSource();
        this.syncChildGroupsFromServices();
      }
    });
  }

  onTableEdit(event: Event, id: number): void {
    if (this.tableConfig !== this.servicesTableConfig) {
      return;
    }
    const serviceToEdit = this.servicesByGroups.find((s) => s.id === id);
    if (!serviceToEdit) {
      this._notificationService.showError('sites.add.services.error.service-not-found');
      return;
    }
    const generalEnrollment = this.headerConfig.formGroup.get('generalEnrollment')?.value;
    const diningRoomCapacity = this.headerConfig.formGroup.get('diningRoomCapacity')?.value;
    const operatingStartTime = this.headerConfig.formGroup.get('operatingStartTime')?.value;
    const operatingEndTime = this.headerConfig.formGroup.get('operatingEndTime')?.value;
    const programData = this._route.snapshot.data['programData'] as { serviceTypes?: unknown[] } | undefined;
    this._dialog.open(AddServiceByGroupModalComponent, {
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
        isPDAM: false,
        isPACNA: false,
        isPSAV: true,
        operatingStartTime: operatingStartTime,
        operatingEndTime: operatingEndTime,
        serviceTypes: programData?.serviceTypes ?? [],
      } as ServiceByGroupDialogData,
      width: '90vw',
      maxWidth: '1200px',
      height: '90vh',
      maxHeight: '800px',
      disableClose: true,
    }).afterClosed().subscribe((result: ServiceByGroupDialogResult) => {
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
    if (this.tableConfig !== this.servicesTableConfig) {
      return;
    }
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
      icon: { show: true, name: 'heroicons_outline:trash', color: 'warn' },
      actions: { confirm: { label: 'users.list.actions.delete', color: 'warn' } }
    }, (result) => {
      if (result === 'confirmed') {
        const index = this.servicesByGroups.findIndex((s) => s.id === id);
        if (index !== -1) {
          this.servicesByGroups.splice(index, 1);
          this.updateServicesTableDataSource();
          this.syncChildGroupsFromServices();
        }
      }
    });
  }

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
    const displayRows = this.servicesByGroups.map((row) => {
      const slots = row.serviceSlots ?? [];
      const booleans: Record<string, boolean> = {};
      const fromTo: Record<string, string | undefined> = {};
      for (const [idStr, key] of Object.entries(idToKey)) {
        const id = Number(idStr);
        const slot = slots.find((s) => s.serviceTypeId === id && s.isOffered);
        booleans[key] = !!slot;
        const s = slot as { from?: string; to?: string; fromTime?: string; toTime?: string } | undefined;
        const fromVal = s?.from ?? s?.fromTime;
        const toVal = s?.to ?? s?.toTime;
        if (fromVal != null) {
          fromTo[key + 'From'] = fromVal;
        }
        if (toVal != null) {
          fromTo[key + 'To'] = toVal;
        }
      }
      return { ...row, ...booleans, ...fromTo };
    });
    this.servicesTableConfig.dataSource.data = displayRows;
    this._changeDetectorRef.detectChanges();
  }

  private syncChildGroupsFromServices(): void {
    this.childGroups = this.servicesByGroups.map(service => ({
      id: service.id,
      groupName: service.groupName,
      groupNameEN: service.groupName,
      numberOfChildren: service.numberOfChildren,
      serviceSlots: service.serviceSlots ?? [],
    }));
  }

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
    const organizationTypeId: number = formValues.organizationType?.id;
    const kitchenTypeId: number = formValues.kitchenType?.id;
    const siteLocationId: number = formValues.siteLocation?.id;
    const groupTypeId: number = formValues.groupType?.id;
    const deliveryTypeId: number = formValues.deliveryType?.id;
    const applicantTypeId: number = formValues.typeOfApplicant?.id;
    const areaTypeId: number = formValues.areaType?.id;
    const locationTypeId: number = formValues.locationType?.id;
    // COMENTADO: Servicios individuales ya no se usan - se manejan dentro de grupos
    // Horarios de servicios básicos
    // const breakfastFrom: string = toTimeString(formValues.breakfastFrom);
    // const breakfastTo: string = toTimeString(formValues.breakfastTo);
    // const lunchFrom: string = toTimeString(formValues.lunchFrom);
    // const lunchTo: string = toTimeString(formValues.lunchTo);
    // const snackAMFrom: string = toTimeString(formValues.snackAMFrom);
    // const snackAMTo: string = toTimeString(formValues.snackAMTo);
    // const snackPMFrom: string = toTimeString(formValues.snackPMFrom);
    // const snackPMTo: string = toTimeString(formValues.snackPMTo);

    // Servicios básicos
    // const snackAM = formValues.snackAM;
    // const snackPM = formValues.snackPM;
    // const lunch = formValues.lunch;
    // const breakfast = formValues.breakfast;

    // Campos adicionales
    // const dinnerFrom: string = toTimeString(formValues.dinnerFrom);
    // const dinnerTo: string = toTimeString(formValues.dinnerTo);
    // const snackNightFrom: string = toTimeString(formValues.snackNightFrom);
    // const snackNightTo: string = toTimeString(formValues.snackNightTo);
    // const dinner = formValues.dinner;
    // const snackNight = formValues.snackNight;

    const communityId = formValues.community?.id;
    const walkersId = formValues.walkers?.id;
    const siteTypeId = formValues.siteType?.id;
    const experienceId = formValues.experience?.id;
    // COMENTADO: Se va a cambiar de lugar
    // const reviewResultId = formValues.reviewResult?.id;
    // const reviewDate = formValues.reviewDate;
    // const reviewJustification = formValues.reviewJustification;

    // Fechas de operación
    const operatingFromDate: string = formValues.operatingFromDate;
    const operatingToDate: string = formValues.operatingToDate;
    // Días de operación
    const operatingDaysCalculated: number = formValues.operatingDaysCalculated;
    // Horas de funcionamiento
    const operatingStartTime: string = toTimeString(formValues.operatingStartTime);
    const operatingEndTime: string = toTimeString(formValues.operatingEndTime);

    // Obtener los días permitidos de la agencia
    const operatingDaysOfWeekIds: number[] = formValues.operatingDaysOfWeek.map((day: DayOfWeekResponse) => day.id);

    // Persona a cargo
    const personInCharge = formValues.personInCharge ? {
      firstName: formValues.personInCharge.firstName ?? null,
      middleName: formValues.personInCharge.middleName ?? null,
      fatherLastName: formValues.personInCharge.fatherLastName ?? null,
      motherLastName: formValues.personInCharge.motherLastName ?? null,
      sitePhone: formValues.personInCharge.sitePhone ?? null,
      extension: formValues.personInCharge.extension ?? null,
      mobilePhone: formValues.personInCharge.mobilePhone ?? null,
    } : null;

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
      operatingFromDate: operatingFromDate ?? null,
      operatingToDate: operatingToDate ?? null,
      operatingDaysCalculated: operatingDaysCalculated ?? null,
      operatingDaysOfWeek: operatingDaysOfWeekIds,
      operatingStartTime: operatingStartTime ?? null,
      operatingEndTime: operatingEndTime ?? null,
      kitchenTypeId: kitchenTypeId,
      siteLocationId: siteLocationId,
      groupTypeId: groupTypeId,
      deliveryTypeId: deliveryTypeId,
      applicantTypeId: applicantTypeId,
      areaTypeId: areaTypeId,
      locationTypeId: locationTypeId,
      nonProfit: formValues.nonProfit ?? null,
      hasWarehouse: formValues.hasWarehouse ?? null,
      hasDiningRoom: formValues.hasDiningRoom ?? null,
      diningRoomCapacity: formValues.diningRoomCapacity ?? null,
      personInCharge: personInCharge ?? null,
      communityId: communityId ?? null,
      walkersId: walkersId ?? null,
      siteTypeId: siteTypeId ?? null,
      experienceId: experienceId ?? null,
      // COMENTADO: Se va a cambiar de lugar
      // reviewResultId: reviewResultId ?? null,
      // reviewDate: reviewDate ?? null,
      // reviewJustification: reviewJustification ?? null,
      // Campos requeridos por el stored procedure 104_UpdateSite
      serviceTime: formValues.serviceTime ?? null,
      isActive: formValues.isActive ?? true,
      inactiveJustification: formValues.inactiveJustification ?? null,
      inactiveDate: formValues.inactiveDate ?? null,
      generalEnrollment: formValues.generalEnrollment ?? null,
    };

    // COMENTADO: Servicios individuales ya no se usan - se manejan dentro de grupos
    // ===== CREAR SCHOOL SERVICE REQUEST =====
    // Constantes para servicios básicos
    // const breakfastService = breakfast ?? null;
    // const lunchService = lunch ?? null;
    // const snackAMService = snackAM ?? null;
    // const snackPMService = snackPM ?? null;
    // const dinnerService = dinner ?? null;
    // const snackNightService = snackNight ?? null;

    // Crear SiteServiceRequest
    // Obtener el primer servicio del primer grupo (si existe)
    // const siteService = this.param.childGroups && this.param.childGroups.length > 0 && this.param.childGroups[0].services && this.param.childGroups[0].services.length > 0
    //   ? this.param.childGroups[0].services[0]
    //   : null;
    // const siteServiceRequest: SiteServiceRequest = {
    //   id: siteService?.id, // ID del servicio existente para actualizar
    //   childGroupId: null, // Servicio general

    //   // Servicios básicos
    //   breakfast: breakfastService,
    //   breakfastFrom: breakfastFrom ?? null,
    //   breakfastTo: breakfastTo ?? null,

    //   lunch: lunchService,
    //   lunchFrom: lunchFrom ?? null,
    //   lunchTo: lunchTo ?? null,

    //   snackAM: snackAMService,
    //   snackAMFrom: snackAMFrom ?? null,
    //   snackAMTo: snackAMTo ?? null,

    //   dinner: dinnerService,
    //   dinnerFrom: dinnerFrom ?? null,
    //   dinnerTo: dinnerTo ?? null,

    //   snackPM: snackPMService,
    //   snackPMFrom: snackPMFrom ?? null,
    //   snackPMTo: snackPMTo ?? null,

    //   snackNight: snackNightService,
    //   snackNightFrom: snackNightFrom ?? null,
    //   snackNightTo: snackNightTo ?? null,
    // };

    // Validar y limpiar el servicio antes de agregarlo
    // const cleanedServiceRequest = validateAndCleanSiteService(siteServiceRequest);

    // Validar al menos un grupo con servicios y sincronizar
    if (this.servicesByGroups.length === 0) {
      this._notificationService.showError('Debe agregar al menos un grupo con servicios');
      return;
    }
    const servicesWithoutGroup = this.servicesByGroups.filter(s => !s.groupName || s.groupName.trim() === '');
    if (servicesWithoutGroup.length > 0) {
      this._notificationService.showError('Todos los servicios deben tener un nombre de grupo');
      return;
    }
    this.syncChildGroupsFromServices();
    if (this.childGroups.length === 0) {
      this._notificationService.showError('Debe haber al menos un grupo cuando hay servicios por grupos');
      return;
    }
    siteRequest.childGroups = this.childGroups;

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
            this._notificationService.showErrorDialog();
            break;
        }
      },
      error: (err: { status?: number; error?: { code?: string; message?: string } }) => {
        if (
          err?.status === 400 &&
          (err?.error?.code === 'MissingStrongService' || err?.error?.code === 'InsufficientTimeBetweenServices') &&
          err?.error?.message
        ) {
          this._notificationService.showError(err.error.message);
        } else {
          this._notificationService.showErrorDialog();
        }
        this.headerConfig.formGroup.enable();
      },
      complete: () => {
        this.isLoading = false;
        // Enable the form
        this.headerConfig.formGroup.enable();
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
    // Este componente es específico para PSAV
    return ['sites-psav'];
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
      // Si no hay grupo seleccionado, limpiar y deshabilitar
      this.kitchenTypes = [];
      this.headerConfig.formGroup.patchValue({ kitchenType: null });
      this.isKitchenTypeDisabled = true;
      this._changeDetectorRef.detectChanges();
      return;
    }

    // Verificar si es "Comedor" - solo cargar tipos de cocina para Comedor
    const isComedor = groupType.name === 'Comedor' || groupType.nameEN === 'Dining Room';

    if (!isComedor) {
      // Si no es "Comedor", limpiar el valor y las opciones, y deshabilitar
      this.kitchenTypes = [];
      this.headerConfig.formGroup.patchValue({ kitchenType: null });
      this.isKitchenTypeDisabled = true;
      this._changeDetectorRef.detectChanges();
      return;
    }

    // Para "Comedor", usar la API para obtener los tipos de cocina válidos
    this.isKitchenTypeDisabled = false;

    const queryParameters: QueryParameters = {
      groupTypeId: groupType.id,
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
   * Para PSAV siempre se muestra si el grupo es "Comedor"
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
    return hasDiningRoom && capacity && enrollment && capacity < enrollment;
  }

  /**
   * Valida que la capacidad del salón comedor no sea mayor que la matrícula general
   */
  private validateDiningRoomCapacity(): void {
    const capacityControl = this.headerConfig.formGroup.get('diningRoomCapacity');
    const enrollment = this.headerConfig.formGroup.get('generalEnrollment')?.value;
    const capacity = capacityControl?.value;

    if (capacity && enrollment && capacity > enrollment) {
      capacityControl?.setErrors({ max: true });
    } else if (capacityControl?.hasError('max')) {
      const errors = { ...capacityControl.errors };
      delete errors['max'];
      capacityControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
    }
  }

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

  // ===== MÉTODOS PARA DESARROLLO - CONTROL MANUAL DE PROGRAMAS =====
}
