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
import { NgForOf, NgIf } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { AgencyResponse } from 'app/shared/models/agency/AgencyResponse';
import { OptionSelection } from 'app/shared/models/common/OptionSelection';
import {
  compare,
  compareById,
  comparePostal,
  toTimeString,
  logFormValidationErrors,
  generateTimeOptions,
  filterStartTimeOptions,
  getEndTimeOptions,
  timeStringToDate,
  dateToMinutes,
  compareByTime,
  TimeOption
} from 'app/shared/utils';
import { City } from 'app/shared/models/location/City';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { Region } from 'app/shared/models/location/Region';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { SiteRequest } from 'app/shared/models/request/SiteRequest';
import { SiteServiceRequest } from 'app/shared/models/request/SiteServiceRequest';
import { SiteEducationLevelRequest } from 'app/shared/models/request/SiteEducationLevelRequest';
import { SiteChildGroupRequest } from 'app/shared/models/request/SiteChildGroupRequest';
import { SiteParticipantRequest } from 'app/shared/models/request/SiteParticipantRequest';
import { GroupTypeService } from 'app/shared/services/group-type.service';
import { KitchenTypeService } from 'app/shared/services/kitchen-type.service';
import { DeliveryTypeService } from 'app/shared/services/delivery-type.service';
import { DeliveryType } from 'app/shared/models/catalog/DeliveryType';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { CenterType } from 'app/shared/models/catalog/CenterType';
import { OrganizationType } from 'app/shared/models/catalog/OrganizationType';
import { SponsorType } from 'app/shared/models/catalog/SponsorType';
import { EducationLevelResponse } from 'app/shared/models/response/EducationLevelResponse';
import { AuthService } from 'app/core/auth/auth.service';
import { ApiErrorBody } from 'app/shared/models/common/ApiError';
import { SiteChildGroupServiceSlotResponse } from 'app/shared/models/response/SiteChildGroupServiceSlotResponse';
import { ValidationMessage } from 'app/shared/models/common/ValidationMessage';
import { NotificationService } from 'app/shared/services/notification.service';
import { AreaTypeService } from 'app/shared/services/area-type.service';
import { AreaType } from 'app/shared/models/catalog/AreaType';
import { DayOfWeekResponse } from 'app/shared/models/calendar/DayOfWeekResponse';
import { FieldVisibilityService } from 'app/shared/services/field-visibility.service';
import { NumericOnlyDirective } from 'app/shared/directives/numeric-only.directive';
import { PhoneFormatDirective } from 'app/shared/directives/phone-format.directive';
import { DynamicGridDirective } from 'app/shared/directives/dynamic-grid.directive';
import { puertoRicoPhoneValidator } from 'app/shared/validators/puerto-rico-phone.validator';
import { puertoRicoZipCodeValidator } from 'app/shared/validators/puerto-rico-zip-code.validator';
import { PuertoRicoZipCodeDirective } from 'app/shared/directives/puerto-rico-zip-code.directive';
import { LatitudeDirective } from 'app/shared/directives/latitude.directive';
import { LongitudeDirective } from 'app/shared/directives/longitude.directive';
import { validateAndCleanSiteService } from 'app/shared/utils/site-service-validator';
import { PermissionRequestFormDialogComponent } from 'app/shared/components/permission-request-form-dialog/permission-request-form-dialog.component';
import { SiteStatusModalComponent, SiteStatusModalData } from 'app/shared/components/site-status-modal/site-status-modal.component';
import { PermissionRequestDialogComponent } from 'app/shared/components/permission-request-dialog/permission-request-dialog.component';
import { ServiceByGroupDialogData, ServiceByGroupDialogResult, AddServiceByGroupModalComponent } from 'app/shared/components/add-service-by-group-modal/add-service-by-group-modal.component';
import { ServiceTypeByProgram } from 'app/shared/models/program/ServiceTypeByProgram';
import { SERVICES_COLUMNS_SCHEMA } from 'app/shared/components/add-service-by-group-modal/services-columns-schema';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { GenericTableConfig, OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { MatTableDataSource } from '@angular/material/table';
import { DateCalculationsUtil } from 'app/shared/utils/date-calculations.util';
import { TimeValidationUtil, ServiceConfig } from 'app/shared/utils/time-validation.util';
import { FieldVisibilityUtil } from 'app/shared/utils/field-visibility.util';
import { PROGRAM_IDS } from 'app/shared/const';

@Component({
  selector: 'app-add-sites-center',
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
    GenericTableComponent
],
})
export class AddSitePacnaCenterComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers, OnGenericTableHandler {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _formBuilder = inject(UntypedFormBuilder);
  private _siteService = inject(SiteService);
  private _geoService = inject(GeoService);
  private _notificationService = inject(NotificationService);
  private _customRouter = inject(CustomRouterService);
  private _translocoService = inject(TranslocoService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _authService = inject(AuthService);
  private _groupTypeService = inject(GroupTypeService);
  private _kitchenTypeService = inject(KitchenTypeService);
  private _deliveryTypeService = inject(DeliveryTypeService);
  private _areaTypeService = inject(AreaTypeService);
  private _route = inject(ActivatedRoute);
  private _dialog = inject(MatDialog);
  private _fieldVisibilityService = inject(FieldVisibilityService);

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

  // Relationship Type Options
  // Opciones de Parentesco
  relationshipTypeOptions: OptionSelection[] = [];

  // Home Type Options
  // Opciones de Tipo de Hogar
  homeTypeOptions: OptionSelection[] = [];

  // Participant Type Options
  // Opciones de Tipo de Participantes
  participantTypeOptions: OptionSelection[] = [];

  // Public Alliance Contract Options
  // Opciones de Contrato de Alianza Pública
  publicAllianceContractOptions: OptionSelection[] = [];

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

  // Lenguaje actual
  currentLang: string = 'es';

  // ===== PROPIEDADES PARA VALIDACIÓN PACNA =====
  pacnaValidationMessage: ValidationMessage = { type: null, message: null };

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
      // Días de la semana en que opera el sitio (selección múltiple)
      // Days of the week the site operates (multiple selection)
      operatingDaysOfWeek: [[], Validators.required],

      // ¿Cuánto tiempo lleva el sitio ofreciendo servicios con una matrícula establecida?
      // How long has the site been providing services with an established enrollment?
      serviceTime: [null, Validators.required],
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
      sponsorType: [null, Validators.required],
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
      // Disponibilidad de almacén - Indica si el sitio tiene instalaciones de almacenamiento
      // Warehouse availability - Indicates if site has storage facilities
      hasWarehouse: [null, Validators.required],
      // Disponibilidad de comedor - Indica si el sitio tiene instalaciones de comedor
      // Dining room availability - Indicates if site has dining facilities
      hasDiningRoom: [null, Validators.required],
      // Capacidad de Salón Comedor - Solo visible cuando hasDiningRoom es true
      // Dining room capacity - Only visible when hasDiningRoom is true
      diningRoomCapacity: [null, [Validators.min(1)]],
      // Persona a Cargo (solo para PDAM y PSAV)
      // Person in Charge (only for PDAM and PSAV)
      personInCharge: this._formBuilder.group({
        firstName: ['', Validators.required],
        middleName: [''],
        fatherLastName: ['', Validators.required],
        motherLastName: [''],
        sitePhone: ['', [Validators.required, puertoRicoPhoneValidator()]],
        extension: [''],
        mobilePhone: ['', puertoRicoPhoneValidator()],
      }),
      // Comunidad
      // Community
      community: [null],
      // Caminantes / Walkers
      // Walkers
      walkers: [null],
      // Tipo de sitio / Site type
      // Site type
      siteType: [null],
      // Experiencia / Experience
      // Experience
      experience: [null],

      // Campos específicos para Day Care Home (PACNA)
      // ¿Este hogar está autorizado a funcionar?
      // Is this home authorized to operate?
      isAuthorizedToOperate: [null],
      // ¿Cuenta con la licencia del Departamento de la Familia?
      // Does it have a Family Department license?
      hasFamilyDepartmentLicense: [null],
      // Número de Niños Matriculados
      // Number of Enrolled Children
      numberOfEnrolledChildren: [null],
      // ¿Cuántos son hijos del proveedor?
      // How many are provider's children?
      numberOfProviderChildren: [null],
      // ¿Con cuántos de los participantes tiene lazos sanguíneos?
      // How many participants have blood ties?
      numberOfParticipantsWithBloodTies: [null],
      // ¿Con cuántos de los participantes no tiene lazos sanguíneos?
      // How many participants do not have blood ties?
      numberOfParticipantsWithoutBloodTies: [null],
      // ¿Los menores viven con usted?
      // Do the minors live with you?
      minorsLiveWithProvider: [null],
      // Parentesco
      // Relationship Type
      relationshipType: [null],
      // ¿Ofrece el servicio a niños inmigrantes?
      // Does it offer service to immigrant children?
      offersServiceToImmigrantChildren: [null],
      // Tipo de Hogar
      // Home Type
      homeType: [null],
      // ¿Es un centro o institución afiliada?
      // Is it an affiliated center or institution?
      isAffiliatedCenter: [null, Validators.required],
      // Participantes (selección múltiple)
      // Participants (multiple selection)
      participantTypes: [[]],
      // ¿Ofrece servicio a diferentes grupos de niños?
      // Does it offer service to different groups of children?
      offersServiceToDifferentGroups: [null],
      // Fecha de Nacimiento del Proveedor
      // Provider Birth Date
      administratorBirthDate: [null],
      // Nombre Completo de la Persona a Cargo (Day Care Home)
      // Administrator Authorized Name (Day Care Home)
      administratorAuthorizedName: [null],
      // Matrícula General
      // General Enrollment
      generalEnrollment: [null, [Validators.required, Validators.pattern(/^\d+$/)]],

      // ===== CAMPOS ESPECÍFICOS PARA PACNA =====

      // ¿El sitio ofrece programas atléticos organizados que participan en deportes competitivos interescolares o a nivel comunitario?
      // Does the site offer organized athletic programs engaged in interscholastic or community level competitive sports?
      organizedAthleticPrograms: [null],

      // ¿El sitio está interesado en participar en el servicio de merienda y cena en riesgo?
      // Is the site interested in participating in the at-risk snack and dinner service?
      atRiskService: [null],

      // De poseer un contrato Público Alianza, especifique su modalidad
      // If you have a Public Alliance contract, please specify the type of contract
      publicAllianceContractId: [null],
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

  // School-related properties (schoolId y schoolName desde resolver schoolData)
  schoolId: number | null = null;
  schoolName: string | null = null;
  childGroups: SiteChildGroupRequest[] = [];
  nextGroupNumber: number = 1;

  // Lista de grupos con sus slots de servicio (en memoria hasta el envío)
  servicesByGroups: ServiceByGroupDialogResult[] = [];

  // Tabla de servicios por grupos
  servicesTableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<any>(),
    columnsSchema: SERVICES_COLUMNS_SCHEMA,
    displayedColumns: SERVICES_COLUMNS_SCHEMA.map((col) => col.key as string),
    viewMode: 'cards',
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
    operatingDaysOfWeek: []
  };

  // Configuración de tabla requerida por OnGenericTableHandler
  tableConfig: GenericTableConfig = this.servicesTableConfig;

  constructor() {}

  ngOnInit(): void {
    this.currentLang = this._translocoService.getActiveLang();

    // Generar opciones de hora
    this.initializeTimeOptions();

    // Configurar FieldVisibilityService SOLO para distributionType
    this._fieldVisibilityService.setActiveConfig('sites');

    // Obtener Agencia desde local storage desde AuthService
    this.agencyId = this._authService.getAgencyId();

    // schoolId y schoolName desde el resolver (schoolData)
    const schoolData = this._route.snapshot.data['schoolData'] as { schoolId: number | null; schoolName: string | null } | undefined;
    if (schoolData) {
      this.schoolId = schoolData.schoolId;
      this.schoolName = schoolData.schoolName;
    }

    // Combinar datos de resolvers comunes y específicos del programa
    const commonData = this._route.snapshot.data['commonData'];
    const programData = this._route.snapshot.data['programData'];
    const resolvedData = commonData && programData ? { ...commonData, ...programData } : null;

    if (resolvedData) {
      // Yes No Options
      this.yesNoOptions = resolvedData.options.filter((option: OptionSelection) => option.optionKey === 'yesNo');
      // Estatus Options
      this.isActiveOptions = resolvedData.options.filter((option: OptionSelection) => option.optionKey === 'isActive');
      this.typeOfResidential = resolvedData.options.filter((option: OptionSelection) => option.optionKey === 'typeOfResidential');
      this.typeOfApplicant = resolvedData.options.filter((option: OptionSelection) => option.optionKey === 'typeOfApplicant');
      this.community = resolvedData.options.filter((option: OptionSelection) => option.optionKey === 'community');
      this.relationshipTypeOptions = resolvedData.options.filter((option: OptionSelection) => option.optionKey === 'relationshipType');
      this.homeTypeOptions = resolvedData.options.filter((option: OptionSelection) => option.optionKey === 'homeType');
      this.participantTypeOptions = resolvedData.options.filter((option: OptionSelection) => option.optionKey === 'participantType');
      this.publicAllianceContractOptions = resolvedData.options.filter((option: OptionSelection) => option.optionKey === 'publicAllianceContract');
      this.walkers = resolvedData.options.filter((option: OptionSelection) => option.optionKey === 'walkers');
      this.distributionType = resolvedData.options.filter((option: OptionSelection) => option.optionKey === 'distributionType');
      this.siteType = resolvedData.options.filter((option: OptionSelection) => option.optionKey === 'siteType');
      this.experience = resolvedData.options.filter((option: OptionSelection) => option.optionKey === 'experience');

      this.siteLocations = resolvedData.options.filter((option: OptionSelection) => option.optionKey === 'siteLocation');

      // Catálogos
      this.centerTypes = resolvedData.centerTypes;
      this.organizationTypes = resolvedData.organizationTypes;
      this.educationLevels = resolvedData.educationLevels;
      this.kitchenTypes = resolvedData.kitchenTypes;
      this.groupTypes = resolvedData.groupTypes;
      this.sponsorType = resolvedData.sponsorTypes;


      this.deliveryTypes = resolvedData.deliveryTypes;
      this.listCities = resolvedData.cities;
      this.listRegions = resolvedData.regions;
      this.areaTypes = resolvedData.areaTypes;
      this.locationTypes = resolvedData.areaTypes; // Usar los mismos valores que AreaType

      // Cargar días permitidos desde el resolver
      this.availableDaysOfWeek = resolvedData.allowedOperatingDays;

      // Los tipos de cocina se cargan dinámicamente según el tipo de grupo

      this._changeDetectorRef.markForCheck();
    }

    // Obtener datos de la agencia desde el resolver padre
    // Los datos ya están disponibles desde initialDataAgencyPortalResolver
    const parentData = this._route.parent?.snapshot.data['initialData'];
    const agencyFromResolver = parentData?.agency;

    if (agencyFromResolver) {
      this.agency = agencyFromResolver;

      // Configurar validaciones y listeners
      this.updateValidations();
      this.setupGroupTypeListener();
    }

    // Transloco (el orden de community/experience viene ya del resolver vía SP 101_)
    this._translocoService.langChanges$.pipe(takeUntil(this._unsubscribeAll)).subscribe((lang: string) => {
      this.currentLang = lang;
    });

    // Actualizar validaciones de distributionType inicialmente
    this.updateDistributionTypeValidation();

    this.setupFormListeners();

    this.servicesTableConfig.operatingDaysOfWeek =
      this.headerConfig.formGroup.get('operatingDaysOfWeek')?.value ?? [];

    // Suscribirse a cambios de validación del formulario para actualizar el estado del botón de guardar
    this.headerConfig.formGroup.statusChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;
        this._changeDetectorRef.detectChanges();
      });
  }

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

    // Escuchar cambios en los días seleccionados para recalcular los días operativos
    this.headerConfig.formGroup.get('operatingDaysOfWeek')?.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((value: DayOfWeekResponse[] | null) => {
        if (this._isResettingForm) return;
        DateCalculationsUtil.calculateOperatingDays(this.headerConfig.formGroup);
        this.servicesTableConfig.operatingDaysOfWeek = value ?? [];
        this._changeDetectorRef.markForCheck();
      });

    // Listener para cambios en organizationType que afectan la visibilidad del campo centerType
    this.headerConfig.formGroup.get('organizationType')?.valueChanges.subscribe((organizationType: OrganizationType) => {
      const result = FieldVisibilityUtil.updateCenterTypeFieldVisibility(
        this.headerConfig.formGroup,
        organizationType,
        'centerType',
        this._changeDetectorRef,
        (disabled) => { this.headerConfig.submitDisabled = disabled; }
      );
      this.showCenterTypeField = result.showCenterTypeField;
    });


    // Listener para cambios en hasDiningRoom
    this.headerConfig.formGroup.get('hasDiningRoom')?.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((hasDiningRoom: boolean) => {
        const capacityControl = this.headerConfig.formGroup.get('diningRoomCapacity');
        if (hasDiningRoom === false) {
          // Si cambia a false, limpiar el campo de capacidad y deshabilitar
          capacityControl?.setValue(null, { emitEvent: false });
          capacityControl?.clearValidators();
          capacityControl?.disable({ emitEvent: false });
          capacityControl?.updateValueAndValidity({ emitEvent: false });
        } else if (hasDiningRoom === true) {
          // Si cambia a true, capacidad es obligatoria y mínimo 1
          capacityControl?.enable({ emitEvent: false });
          capacityControl?.setValidators([Validators.required, Validators.min(1)]);
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

    // Estado inicial: deshabilitar capacidad si no tiene salón comedor
    const initialHasDiningRoom = this.headerConfig.formGroup.get('hasDiningRoom')?.value;
    if (initialHasDiningRoom !== true) {
      this.headerConfig.formGroup.get('diningRoomCapacity')?.disable({ emitEvent: false });
    }
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

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }


  private setupGroupTypeListener(): void {
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
          // PACNA: Tipo de cocina no se muestra en este módulo; no exigir ni cargar.
          this.kitchenTypes = [];
          this.headerConfig.formGroup.patchValue({ kitchenType: null });
          kitchenTypeControl?.clearValidators();
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
  }

  private updateValidations(): void {
    // Restaurar validaciones requeridas para centros
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

    // educationLevels no es requerido para PACNA
    const educationLevelsControl = this.headerConfig.formGroup.get('educationLevels');
    if (educationLevelsControl) {
      educationLevelsControl.clearValidators();
      educationLevelsControl.updateValueAndValidity();
    }

    // personInCharge no es requerido para PACNA
    this.updatePersonInChargeValidations();

    // Campos específicos de PACNA - requeridos para centros PACNA
    const pacnaFields = {
      organizedAthleticPrograms: [Validators.required],
      atRiskService: [Validators.required],
      publicAllianceContractId: [Validators.required],
      isAffiliatedCenter: [Validators.required],
    };

    Object.keys(pacnaFields).forEach((fieldName) => {
      const control = this.headerConfig.formGroup.get(fieldName);
      if (control) {
        control.setValidators(pacnaFields[fieldName]);
        control.updateValueAndValidity();
      }
    });

    // Restaurar validación de centerType solo si el organizationType actual lo requiere
    const organizationType = this.headerConfig.formGroup.get('organizationType')?.value as OrganizationType;
    const centerTypeControl = this.headerConfig.formGroup.get('centerType');
    if (centerTypeControl) {
      if (organizationType?.requiresCenterType) {
        centerTypeControl.setValidators([Validators.required]);
      } else {
        centerTypeControl.clearValidators();
      }
      centerTypeControl.updateValueAndValidity();
    }

    // Actualizar el estado del botón después de restaurar las validaciones
    this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;
    this._changeDetectorRef.detectChanges();
  }

  /**
   * Actualiza las validaciones de personInCharge
   * Para PACNA, se requieren validaciones de personInCharge
   */
  private updatePersonInChargeValidations(): void {
    const personInChargeGroup = this.headerConfig.formGroup.get('personInCharge') as FormGroup;

    if (!personInChargeGroup) {
      return;
    }

    // Restaurar validaciones requeridas para PACNA
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


  // Método para enviar el formulario
  onSubmit() {
    // Protección contra doble clic: si ya está cargando, ignorar
    if (this.isLoading) return;

    // Validar formulario
    if (this.headerConfig.formGroup.invalid) {
      // Log detallado de campos inválidos usando función utilitaria
      logFormValidationErrors(this.headerConfig.formGroup, 'Formulario de Sitio');

      this._notificationService.showError('Por favor, complete todos los campos requeridos');
      this.headerConfig.formGroup.markAllAsTouched();
      return;
    }

    // Recalcular Total de Días de Funcionamiento antes de guardar
    DateCalculationsUtil.calculateOperatingDays(this.headerConfig.formGroup);

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
    const operatingStartTime: string | null = toTimeString(formValues.operatingStartTime);
    const operatingEndTime: string | null = toTimeString(formValues.operatingEndTime);

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
      // Horas de funcionamiento - Horas de inicio y fin para los días de funcionamiento
      // Operating hours - Start and end times for operating days
      operatingStartTime: operatingStartTime ?? null,
      operatingEndTime: operatingEndTime ?? null,
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
      personInCharge: personInCharge ?? null,
      // Comunidad
      // Community
      communityId: formValues.community?.id ?? null,
      // Caminantes
      // Walkers
      walkersId: formValues.walkers?.id ?? null,
      // Tipo de sitio
      // Site type
      siteTypeId: formValues.siteType?.id ?? null,
      // Experiencia
      // Experience
      experienceId: formValues.experience?.id ?? null,
      // Resultado de revisión
      // Review result
      reviewResultId: formValues.reviewResult?.id ?? null,
      // Fecha de revisión
      // Review date
      reviewDate: formValues.reviewDate ?? null,
      // Justificación de revisión
      // Review justification
      reviewJustification: formValues.reviewJustification ?? null,


      // Matrícula General
      // General Enrollment
      generalEnrollment: formValues.generalEnrollment ?? null,

      // ===== CAMPOS ESPECÍFICOS PARA PACNA =====

      // ¿El sitio ofrece programas atléticos organizados que participan en deportes competitivos interescolares o a nivel comunitario?
      // Does the site offer organized athletic programs engaged in interscholastic or community level competitive sports?
      organizedAthleticPrograms: formValues.organizedAthleticPrograms ?? false,

      // ¿El sitio está interesado en participar en el servicio de merienda y cena en riesgo?
      // Is the site interested in participating in the at-risk snack and dinner service?
      atRiskService: formValues.atRiskService ?? false,

      // De poseer un contrato Público Alianza, especifique su modalidad
      // If you have a Public Alliance contract, please specify the type of contract
      publicAllianceContractId: formValues.publicAllianceContractId ?? null,

      // ¿Es un centro o institución afiliada?
      // Is it an affiliated center or institution?
      isAffiliatedCenter: formValues.isAffiliatedCenter ?? null,

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

    // Agregar grupos de niños con sus servicios si se están usando servicios por grupos
    // Se usa servicios por grupos si:
    // 1. offersServiceToDifferentGroups es true (Day Care Home), O
    // 2. La capacidad del salón comedor es menor que la matrícula general
    const shouldUseServicesByGroups = (formValues.offersServiceToDifferentGroups || this.shouldShowServicesByGroupsForDiningRoom()) && this.servicesByGroups.length > 0;

    if (shouldUseServicesByGroups) {
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
    } else {
      if (this.childGroups.length > 0) {
        siteRequest.childGroups = this.childGroups;
      }
    }

    // Agregar participantes (selección múltiple)
    // Add participants (multiple selection)
    if (formValues.participantTypes && Array.isArray(formValues.participantTypes) && formValues.participantTypes.length > 0) {
      siteRequest.participants = formValues.participantTypes.map((participantTypeId: number) => {
        const participantRequest: SiteParticipantRequest = {
          siteId: 0, // Se asignará cuando se cree el sitio
          participantTypeId: participantTypeId,
          isActive: true,
        };
        return participantRequest;
      });
    }

    this.isLoading = true;

    // Disable the form
    this.headerConfig.formGroup.disable();

    this._siteService.insertSite(siteRequest, {}).subscribe({
      next: (result: any) => {
        switch (result?.body) {
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

            this._notificationService.showSuccessDialogWithCallback(
              'sites.add.success',
              (result) => {
                if (result === 'confirmed') {
                  // Navegar a la ruta correcta según el programa
                  const targetRoute = this.getTargetRoute();
                  this._customRouter.navigate(targetRoute);
                }
              }
            );
            break;
          default:
            this.isLoading = false;
            this._notificationService.showErrorDialog();
            break;
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        const body = err?.error as ApiErrorBody | undefined;
        if (
          err?.status === 400 &&
          (body?.code === 'FIRST_SITE_MUST_BE_COMEDOR' ||
            body?.code === 'SCHOOL_MUST_HAVE_COMEDOR_FIRST' ||
            body?.code === 'SITE_DATES_OUTSIDE_COMEDOR_RANGE') &&
          body?.message
        ) {
          this._notificationService.showWarningDialogWithRawMessage(body.message);
        } else if (err?.status === 400 && body?.code === 'MISSING_STRONG_SERVICE' && body?.message) {
          this._notificationService.showWarningDialogWithRawMessage(body.message);
        } else if (
          err?.status === 400 &&
          body?.code === 'INSUFFICIENT_TIME_BETWEEN_SERVICES' &&
          body?.message
        ) {
          this._notificationService.showError(body.message);
        } else {
          this._notificationService.showErrorDialog();
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
    const targetRoute = this.getTargetRoute();
    this._customRouter.navigate(targetRoute);
  }

  /**
   * Determina la ruta de navegación según el programa activo
   * Determines navigation route based on active program
   * @returns Array con la ruta de navegación
   */
  private getTargetRoute(): string[] {
    // Este componente es específico para PACNA Centers
    // La lista de centros está en el módulo centers separado
    return ['centers'];
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
        yesNoOptions: this.yesNoOptions
      } as SiteStatusModalData,
      disableClose: false,
      width: '600px',
      maxWidth: '90vw',
      panelClass: ['mat-dialog-container', 'dialog-responsive']
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

  /**
   * En PACNA el campo Tipo de Cocina no se muestra ni se usa.
   * Solo se limpia el valor y las opciones al cambiar el tipo de grupo (sin llamar al API).
   */
  getKitchenTypesByGroupType(groupType: OptionSelection): void {
    const kitchenTypeControl = this.headerConfig.formGroup.get('kitchenType');

    this.kitchenTypes = [];
    this.headerConfig.formGroup.patchValue({ kitchenType: null });
    kitchenTypeControl?.clearValidators();
    kitchenTypeControl?.updateValueAndValidity({ emitEvent: false });
    this._changeDetectorRef.detectChanges();
  }

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
      programId: PROGRAM_IDS.PACNA,
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
              const isValidCurrentRegion = currentPostalRegion &&
                this.listPostalRegions.some(r => r.id === currentPostalRegion.id);

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
        const matchingRegion = this.listPostalRegions.find(r => r.id === physicalRegion.id);
        const regionToSet = matchingRegion || physicalRegion;

        // Establecer los valores después de sincronizar la lista
        this.headerConfig.formGroup.patchValue({
          postalAddress: physicalAddress,
          postalCity: physicalCity,
          postalRegion: regionToSet, // Usar la región de la lista para que coincida exactamente
          postalZipCode: physicalZipCode,
        }, { emitEvent: false }); // emitEvent: false para evitar que se dispare valueChange en postalCity

        // Forzar detección de cambios para actualizar la vista
        this._changeDetectorRef.detectChanges();
      } else {
        // Si no hay ciudad o región, solo copiar lo que hay
        this.headerConfig.formGroup.patchValue({
          postalAddress: physicalAddress,
          postalCity: physicalCity,
          postalZipCode: physicalZipCode,
        }, { emitEvent: false });
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
   * Determina si se debe mostrar el campo de capacidad de salón comedor
   */
  shouldShowDiningRoomCapacity(): boolean {
    return this.headerConfig.formGroup.get('hasDiningRoom')?.value === true;
  }

  /**
   * Determina si se deben mostrar servicios por grupos cuando la capacidad es menor que la matrícula
   */
  shouldShowServicesByGroupsForDiningRoom(): boolean {
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

  /**
   * Maneja el cambio del campo "¿Ofrece servicio a diferentes grupos de niños?"
   */
  onOffersServiceToDifferentGroupsChange(checked: boolean): void {
    // Si no ofrece servicio a diferentes grupos, limpiar campos adicionales
    if (!checked) {
      this.clearDifferentGroupsFields();
    }
  }

  /**
   * Limpia los campos adicionales cuando no se ofrecen servicios a diferentes grupos
   */
  private clearDifferentGroupsFields(): void {
    // Limpiar grupos de niños cuando no se ofrecen servicios a diferentes grupos
    this.childGroups = [];
    this.nextGroupNumber = 1;
    this.servicesByGroups = [];
    this.updateServicesTableDataSource();
    console.log('Clearing different groups fields');
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
    const displayRows = this.servicesByGroups.map((row) => {
      const slots = row.serviceSlots ?? [];
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
      return { ...row, ...booleans, ...fromTo };
    });
    this.servicesTableConfig.dataSource.data = displayRows;
  }

  /**
   * Maneja las acciones del menú de agregar
   */
  onAddMenuAction(menuItemId: string): void {
    if (menuItemId === 'add') {
      this.onTableAdd();
    }
  }

  /**
   * Maneja el evento de agregar servicio desde la tabla
   */
  onTableAdd(): void {
    const operatingStartTime = this.headerConfig.formGroup.get('operatingStartTime')?.value;
    const operatingEndTime = this.headerConfig.formGroup.get('operatingEndTime')?.value;

    const programData = this._route.snapshot.data['programData'] as { serviceTypes?: unknown[] } | undefined;
    const dialogRef = this._dialog.open(AddServiceByGroupModalComponent, {
      data: {
        isEdit: false,
        yesNoOptions: this.yesNoOptions,
        isPDAM: false,
        isPACNA: true,
        isPSAV: false,
        operatingStartTime: operatingStartTime,
        operatingEndTime: operatingEndTime,
        serviceTypes: programData?.serviceTypes ?? [],
        existingGroups: this.servicesByGroups.map(s => ({ id: s.id, numberOfChildren: s.numberOfChildren })),
        generalEnrollment: this.headerConfig.formGroup.get('generalEnrollment')?.value,
        diningRoomCapacity: this.headerConfig.formGroup.get('diningRoomCapacity')?.value,
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

  /**
   * Maneja el evento de editar servicio desde la tabla
   */
  onTableEdit(event: Event, id: number): void {
    const serviceToEdit = this.servicesByGroups.find((s) => s.id === id);
    if (!serviceToEdit) {
      this._notificationService.showError('sites.add.services.error.service-not-found');
      return;
    }

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
        isPDAM: false,
        isPACNA: true,
        isPSAV: false,
        operatingStartTime: operatingStartTime,
        operatingEndTime: operatingEndTime,
        serviceTypes: programData?.serviceTypes ?? [],
        existingGroups: this.servicesByGroups.map(s => ({ id: s.id, numberOfChildren: s.numberOfChildren })),
        generalEnrollment: this.headerConfig.formGroup.get('generalEnrollment')?.value,
        diningRoomCapacity: this.headerConfig.formGroup.get('diningRoomCapacity')?.value,
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

  /**
   * Maneja el evento de eliminar servicio desde la tabla
   */
  onTableDelete(event: Event, id: number): void {
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
        const index = this.servicesByGroups.findIndex((s) => s.id === id);
        if (index !== -1) {
          this.servicesByGroups.splice(index, 1);
          this.updateServicesTableDataSource();
          this.syncChildGroupsFromServices();

        }
      }
    });
  }

  private syncChildGroupsFromServices(): void {
    this.childGroups = this.servicesByGroups.map(service => ({
      id: service.id,
      siteId: 0,
      groupName: service.groupName,
      groupNameEN: service.groupName,
      numberOfChildren: service.numberOfChildren,
      serviceSlots: service.serviceSlots ?? [],
    }));
  }

  // ===== MÉTODOS DE VALIDACIÓN PACNA =====

  /**
   * Valida los campos específicos de PACNA
   */
  checkPACNAValidation(): void {
    // Usar getRawValue() para obtener todos los valores, incluyendo campos deshabilitados
    const formValues = this.headerConfig.formGroup.getRawValue();
    const organizedAthleticPrograms = formValues.organizedAthleticPrograms === true;
    const atRiskService = formValues.atRiskService === true;

    // Caso 1: Ambos campos = true = No elegible
    if (organizedAthleticPrograms && atRiskService) {
      this.pacnaValidationMessage = {
        type: 'error',
        message: 'sites.add.pacna-fields.validation.both-true-error',
      };
      return;
    }

    // Caso 2: Solo uno de los campos = true = Advertencia
    if (organizedAthleticPrograms || atRiskService) {
      this.pacnaValidationMessage = {
        type: 'warning',
        message: 'sites.add.pacna-fields.validation.one-true-warning',
      };
      return;
    }

    // Caso 3: Ambos campos = false = Sin restricciones
    this.pacnaValidationMessage = { type: null, message: null };
  }

  /**
   * En PACNA el campo Tipo de Cocina no se muestra (solo se usa en PDAM).
   */
  get shouldShowKitchenTypeField(): boolean {
    return false;
  }

}
