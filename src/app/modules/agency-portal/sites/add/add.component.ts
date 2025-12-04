import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
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
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Agency } from 'app/shared/models/Agency';
import { OptionSelection } from 'app/shared/models/OptionSelection';
import { OperatingPolicy } from 'app/shared/models/OperatingPolicy';
import { compare, compareById, comparePostal, isNullOrUndefinedEmptyStringNullArray, toTimeString, logFormValidationErrors } from 'app/shared/utils';
import { City } from 'app/shared/models/City';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { Region } from 'app/shared/models/Region';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { SiteRequest } from 'app/shared/models/Request/SiteRequest';
import { SiteServiceRequest } from 'app/shared/models/Request/SiteServiceRequest';
import { SiteEducationLevelRequest } from 'app/shared/models/Request/SiteEducationLevelRequest';
import { SiteChildGroupRequest } from 'app/shared/models/Request/SiteChildGroupRequest';
import { GroupTypeService } from 'app/shared/services/group-type.service';
import { KitchenTypeService } from 'app/shared/services/kitchen-type.service';
import { DeliveryType } from 'app/shared/models/DeliveryType';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { CenterType } from 'app/shared/models/CenterType';
import { CenterTypeService } from 'app/shared/services/center-type.service';
import { OrganizationType } from 'app/shared/models/OrganizationType';
import { SponsorType } from 'app/shared/models/SponsorType';
import { EducationLevelResponse } from 'app/shared/models/Response/EducationLevelResponse';
import { AuthService } from 'app/core/auth/auth.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { AreaTypeService } from 'app/shared/services/area-type.service';
import { AreaType } from 'app/shared/models/AreaType';
import { AgencyService } from 'app/shared/services/agency.service';
import { PROGRAM_IDS, isPDAMProgram } from 'app/shared/const';
import { PermissionRequestDialogComponent } from '../permission-request-dialog/permission-request-dialog.component';
import { CfrInfoDialogComponent } from 'app/shared/components/cfr-info-dialog/cfr-info-dialog.component';
import { PermissionRequestFormDialogComponent } from '../permission-request-form-dialog/permission-request-form-dialog.component';
import { SiteStatusModalComponent, SiteStatusModalData } from '../site-status-modal/site-status-modal.component';
import { FieldVisibilityService } from 'app/shared/services/field-visibility.service';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { GenericTableConfig, OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { SERVICES_COLUMNS_SCHEMA } from '../add-service-by-group-modal/services-columns-schema';
import { AddServiceByGroupModalComponent, ServiceByGroupDialogData } from '../add-service-by-group-modal/add-service-by-group-modal.component';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'environments/environment';
import { NumericOnlyDirective } from 'app/shared/directives/numeric-only.directive';
import { PhoneFormatDirective } from 'app/shared/directives/phone-format.directive';
import { DynamicGridDirective } from 'app/shared/directives/dynamic-grid.directive';
import { puertoRicoPhoneValidator } from 'app/shared/validators/puerto-rico-phone.validator';
import { puertoRicoZipCodeValidator } from 'app/shared/validators/puerto-rico-zip-code.validator';
import { PuertoRicoZipCodeDirective } from 'app/shared/directives/puerto-rico-zip-code.directive';
import { LatitudeDirective } from 'app/shared/directives/latitude.directive';
import { LongitudeDirective } from 'app/shared/directives/longitude.directive';
import { validateAndCleanSiteService } from 'app/shared/utils/site-service-validator';

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
    GenericTableComponent,
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
  ],
})
export class AddSiteComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers, OnGenericTableHandler {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _formBuilder = inject(UntypedFormBuilder);
  private _siteService = inject(SiteService);
  private _geoService = inject(GeoService);
  private _notificationService = inject(NotificationService);
  private _customRouter = inject(CustomRouterService);
  private _translocoService = inject(TranslocoService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _authService = inject(AuthService);
  private _agencyService = inject(AgencyService);
  private _groupTypeService = inject(GroupTypeService);
  private _kitchenTypeService = inject(KitchenTypeService);
  private _areaTypeService = inject(AreaTypeService);
  private _centerTypeService = inject(CenterTypeService);
  private _route = inject(ActivatedRoute);
  private _dialog = inject(MatDialog);
  private _fieldVisibilityService = inject(FieldVisibilityService);
  private _fuseConfirmationService = inject(FuseConfirmationService);

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
  pacnaValidationMessage: { type: 'error' | 'warning' | null; message: string | null } = { type: null, message: null };

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
      operatingFromDate: [null],
      operatingToDate: [null],
      operatingDaysCalculated: [{ value: null, disabled: true }],

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
      // Tipo de auspiciador - Tipo de patrocinio del sitio
      // Sponsor type - Type of site sponsorship
      sponsorType: [null],
      // Tipo de solicitante - Tipo de solicitante del sitio
      // Type of applicant - Type of site applicant
      // Laico (15), Base de fe (16)
      typeOfApplicant: [null],
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
      hasWarehouse: [null],
      // Disponibilidad de comedor - Indica si el sitio tiene instalaciones de comedor
      // Dining room availability - Indicates if site has dining facilities
      hasDiningRoom: [null],
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
      // Desayuno (si, no)
      // Breakfast (yes, no)
      breakfast: [null],
      // Horario desde para el desayuno
      // Breakfast schedule from
      breakfastFrom: [null],
      // Horario hasta para el desayuno
      // Breakfast schedule to
      breakfastTo: [null],
      // Almuerzo (si, no)
      // Lunch (yes, no)
      lunch: [null],
      // Horario desde para el almuerzo
      // Lunch schedule from
      lunchFrom: [null],
      // Horario hasta para el almuerzo
      // Lunch schedule to
      lunchTo: [null],
      // Merienda AM (si, no)
      // Snack AM (yes, no)
      snackAM: [null],
      // Horario desde para la merienda AM
      // Snack AM schedule from
      snackAMFrom: [null],
      // Horario hasta para la merienda AM
      // Snack AM schedule to
      snackAMTo: [null],
      // Merienda PM (si, no)
      // Snack PM (yes, no)
      snackPM: [null],
      // Horario desde para la merienda PM
      // Snack PM schedule from
      snackPMFrom: [null],
      // Horario hasta para la merienda PM
      // Snack PM schedule to
      snackPMTo: [null],
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
      // Cena (si, no)
      // Dinner (yes, no)
      dinner: [null],
      // Horario desde para la cena
      // Dinner schedule from
      dinnerFrom: [null],
      // Horario hasta para la cena
      // Dinner schedule to
      dinnerTo: [null],
      // Merienda nocturna (si, no)
      // Snack night (yes, no)
      snackNight: [null],
      // Horario desde para la merienda nocturna
      // Snack night schedule from
      snackNightFrom: [null],
      // Horario hasta para la merienda nocturna
      // Snack night schedule to
      snackNightTo: [null],

      // NUEVOS CAMPOS PARA PACNA - Servicios adicionales
      // Cena Horario Extendido (si, no)
      dinnerExtended: [null],
      // Horario desde para la cena horario extendido
      dinnerExtendedFrom: [null],
      // Horario hasta para la cena horario extendido
      dinnerExtendedTo: [null],

      // Cena en Riesgo (si, no)
      dinnerAtRisk: [null],
      // Horario desde para la cena en riesgo
      dinnerAtRiskFrom: [null],
      // Horario hasta para la cena en riesgo
      dinnerAtRiskTo: [null],

      // Merienda Horario Extendido (si, no)
      snackExtended: [null],
      // Horario desde para la merienda horario extendido
      snackExtendedFrom: [null],
      // Horario hasta para la merienda horario extendido
      snackExtendedTo: [null],

      // Merienda en Riesgo (si, no)
      snackAtRisk: [null],
      // Horario desde para la merienda en riesgo
      snackAtRiskFrom: [null],
      // Horario hasta para la merienda en riesgo
      snackAtRiskTo: [null],

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
      // Participantes (selección múltiple)
      // Participants (multiple selection)
      participantTypes: [[]],
      // ¿Ofrece servicio a diferentes grupos de niños?
      // Does it offer service to different groups of children?
      offersServiceToDifferentGroups: [null],
      // Fecha de Nacimiento del Proveedor
      // Provider Birth Date
      administratorBirthDate: [null],
      // Matrícula General
      // General Enrollment
      generalEnrollment: [null, [Validators.pattern(/^\d+$/)]],

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
  };

  // Agregar esta propiedad
  protected readonly window = window;

  // Compare methods
  compare = compare;
  comparePostal = comparePostal;
  compareById = compareById;

  isLoading = false;

  // Agencia Id
  agencyId: number = 0;
  agency: Agency = null;


  // Propiedades para controlar visibilidad según programa
  isPDAM: boolean = false;
  isPSAV: boolean = false;
  isPACNA: boolean = false;
  isPFHF: boolean = false;
  isPDFE: boolean = false;
  isAESAN: boolean = false;

  // Propiedad para controlar visibilidad del campo Tipo de Centro
  showCenterTypeField: boolean = false;

  // Propiedad para controlar visibilidad cuando es Day Care Home
  isDayCareHome: boolean = false;
  isDayCareHomeId: number | null = null;
  showDifferentGroupsFields: boolean = false;

  // Propiedad para controlar la visibilidad de la sección de desarrollo
  isDevelopmentMode: boolean = !environment.production;

  // Propiedad para controlar visibilidad de campos de provisión en modo desarrollo
  showProvisionFieldsDev: boolean = false;

  // School-related properties
  schoolId: number | null = null;
  childGroups: SiteChildGroupRequest[] = [];
  nextGroupNumber: number = 1;

  // Tabla de servicios por grupos
  servicesTableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<any>(),
    columnsSchema: SERVICES_COLUMNS_SCHEMA,
    displayedColumns: SERVICES_COLUMNS_SCHEMA.map((col) => col.key as string),
    addButtonShow: true,
    addButtonIcon: 'add',
    addButtonLabel: 'sites.add.services.add-service',
    handler: this,
    showPaginator: true,
    pageSizeOptions: [5, 10, 25, 50],
    pageSize: 10,
    onAddButtonClick: (event: Event, tableId?: string) => {
      this.onTableAdd();
    },
  };

  // Lista de servicios por grupos (en memoria hasta el envío)
  servicesByGroups: ServiceByGroupDialogData[] = [];

  // Configuración de tabla requerida por OnGenericTableHandler
  tableConfig: GenericTableConfig = this.servicesTableConfig;

  // Función para mostrar campos específicos de Day Care Home (PACNA + isDayCareHome)
  shouldShowDayCareFields(): boolean {
    return this.isDayCareHome && this.isPACNA;
  }

  /**
   * Determina si se deben mostrar campos adicionales para diferentes grupos
   */
  shouldShowDifferentGroupsFields(): boolean {
    return this.showDifferentGroupsFields && this.isDayCareHome && this.isPACNA;
  }

  /**
   * Determina si se deben ocultar los campos de servicios individuales
   * cuando se están usando servicios por grupos
   */
  shouldHideIndividualServiceFields(): boolean {
    return this.shouldShowDifferentGroupsFields();
  }

  constructor() {}

  ngOnInit(): void {
    this.currentLang = this._translocoService.getActiveLang();

    // Configurar FieldVisibilityService SOLO para distributionType
    this._fieldVisibilityService.setActiveConfig('sites');

    // Obtener Agencia desde local storage desde AuthService
    this.agencyId = this._authService.getAgencyId();


    // Verificar si hay schoolId o isDayCareHomeId en query parameters
    this._route.queryParams.subscribe(params => {
      if (params['schoolId']) {
        this.schoolId = +params['schoolId'];
      }
      // Leer isDayCareHomeId de los query parameters
      if (params['isDayCareHomeId']) {
        const isDayCareHomeId = +params['isDayCareHomeId'];
        // Determinar isDayCareHome basado en el ID
        // Necesitamos obtener las opciones para comparar
        // Por ahora, asumimos que si viene el parámetro, debemos determinar el valor
        // Esto se ajustará cuando tengamos las opciones cargadas
      }
    });
    const resolvedData = this._route.snapshot.data['data'];

    if (resolvedData) {
      // Yes No Options
      this.yesNoOptions = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'yesNo');
      // Estatus Options
      this.isActiveOptions = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'isActive');
      this.typeOfResidential = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'typeOfResidential');
      this.typeOfApplicant = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'typeOfApplicant');
      this.community = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'community');
      this.relationshipTypeOptions = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'relationshipType');
      this.homeTypeOptions = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'homeType');
      this.participantTypeOptions = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'participantType');
      this.publicAllianceContractOptions = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'publicAllianceContract');
      this.walkers = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'walkers');
      this.distributionType = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'distributionType');
      this.siteType = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'siteType');
      this.experience = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'experience');
      this.siteLocations = resolvedData.siteLocations || [];

      // Catálogos
      this.centerTypes = resolvedData.centerTypes;
      this.organizationTypes = resolvedData.organizationTypes;
      this.educationLevels = resolvedData.educationLevels;
      this.kitchenTypes = resolvedData.kitchenTypes;
      this.groupTypes = resolvedData.groupTypes;
      this.sponsorType = resolvedData.sponsorTypes;

      // Filtrar operating policies según si la agencia es recurrente
      this.operatingPolicies = this.filterOperatingPolicies(
        resolvedData.operatingPolicies,
        this.agency?.isRecurrent || false
      );

      this.deliveryTypes = resolvedData.deliveryTypes;
      this.listCities = resolvedData.cities;
      this.listRegions = resolvedData.regions;
      this.areaTypes = resolvedData.areaTypes;
      this.locationTypes = resolvedData.areaTypes; // Usar los mismos valores que AreaType



      // Los tipos de cocina se cargan dinámicamente según el tipo de grupo

      this._changeDetectorRef.markForCheck();
    }

    // Obtener datos de la agencia para determinar campos visibles
    this._agencyService.agency$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.agency = result.body;
        const programs = this.agency.programs || [];

        // Leer isDayCareHomeId de los query parameters
        const queryParams = this._route.snapshot.queryParams;
        const isDayCareHomeIdFromQuery = queryParams['isDayCareHomeId']
          ? parseInt(queryParams['isDayCareHomeId'], 10)
          : null;

        // Si hay isDayCareHomeId en query params, usarlo directamente
        if (isDayCareHomeIdFromQuery !== null && resolvedData) {
          this.isDayCareHomeId = isDayCareHomeIdFromQuery;

          // Obtener las opciones de isDayCareHome del resolver para determinar isDayCareHome (bool)
          const isDayCareHomeOptions = resolvedData.options?.data?.filter(
            (option: OptionSelection) => option.optionKey === 'isDayCareHome'
          ) || [];

          const selectedOption = isDayCareHomeOptions.find(
            (opt: OptionSelection) => opt.id === isDayCareHomeIdFromQuery
          );

          // Si el ID corresponde a "Sí" (booleanValue === true), entonces isDayCareHome = true
          // Si el ID corresponde a "No" (booleanValue === false), entonces isDayCareHome = false
          // Si el ID corresponde a "Ambos" (booleanValue === null), entonces isDayCareHome = true (para mostrar campos)
          this.isDayCareHome = selectedOption
            ? (selectedOption.booleanValue === true || selectedOption.booleanValue == null)
            : false;
        } else {
          // Si no hay query param, usar el valor de la agencia como antes (solo para nuevos sitios)
          const isDayCareHomeOption = this.agency?.inscription?.isDayCareHome;
          if (isDayCareHomeOption) {
            this.isDayCareHomeId = isDayCareHomeOption.id;
            this.isDayCareHome = isDayCareHomeOption.booleanValue === true || isDayCareHomeOption.booleanValue == null;
          } else {
            this.isDayCareHomeId = null;
            this.isDayCareHome = false;
          }
        }

        // Determinar qué campos mostrar según los programas
        this.determineVisibleFields(programs);
      }
    });

    // Transloco
    this._translocoService.langChanges$.pipe(takeUntil(this._unsubscribeAll)).subscribe((lang: string) => {
      this.currentLang = lang;
    });

    // Actualizar validaciones de distributionType inicialmente
    this.updateDistributionTypeValidation();

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

    // Listener para cambios en organizationType que afectan la visibilidad del campo centerType
    this.headerConfig.formGroup.get('organizationType')?.valueChanges.subscribe((organizationType: OrganizationType) => {
      this.updateCenterTypeFieldVisibility(organizationType);
      this._changeDetectorRef.detectChanges();
    });

    // Listener para cambios en operatingPolicy que afectan la visibilidad de campos de provisión
    this.headerConfig.formGroup.get('operatingPolicy')?.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this._changeDetectorRef.detectChanges();
      });

    // Configurar validaciones condicionales para servicios
    this.setupServiceValidations();
  }

  /**
   * Configura validaciones condicionales para todos los servicios
   * Cuando un servicio está en "Sí" (true), los campos "Hora desde" y "Hora hasta" son requeridos
   */
  private setupServiceValidations(): void {
    // Lista de servicios con sus campos From y To correspondientes
    const services = [
      { service: 'breakfast', from: 'breakfastFrom', to: 'breakfastTo' },
      { service: 'lunch', from: 'lunchFrom', to: 'lunchTo' },
      { service: 'snackAM', from: 'snackAMFrom', to: 'snackAMTo' },
      { service: 'snackPM', from: 'snackPMFrom', to: 'snackPMTo' },
      { service: 'dinner', from: 'dinnerFrom', to: 'dinnerTo' },
      { service: 'snackNight', from: 'snackNightFrom', to: 'snackNightTo' },
      { service: 'dinnerExtended', from: 'dinnerExtendedFrom', to: 'dinnerExtendedTo' },
      { service: 'dinnerAtRisk', from: 'dinnerAtRiskFrom', to: 'dinnerAtRiskTo' },
      { service: 'snackExtended', from: 'snackExtendedFrom', to: 'snackExtendedTo' },
      { service: 'snackAtRisk', from: 'snackAtRiskFrom', to: 'snackAtRiskTo' },
    ];

    // Configurar suscripciones para cada servicio
    services.forEach(({ service, from, to }) => {
      const serviceControl = this.headerConfig.formGroup.get(service);
      const fromControl = this.headerConfig.formGroup.get(from);
      const toControl = this.headerConfig.formGroup.get(to);

      if (serviceControl && fromControl && toControl) {
        // Validación inicial
        this.updateServiceTimeValidations(serviceControl.value, fromControl, toControl);

        // Suscribirse a cambios en el campo de servicio
        serviceControl.valueChanges
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((value: boolean | null) => {
            this.updateServiceTimeValidations(value, fromControl, toControl);
          });
      }
    });
  }

  /**
   * Actualiza las validaciones de los campos de hora según el estado del servicio
   * @param serviceValue Valor del servicio (true = Sí, false/null = No)
   * @param fromControl Control del campo "Hora desde"
   * @param toControl Control del campo "Hora hasta"
   */
  private updateServiceTimeValidations(
    serviceValue: boolean | null,
    fromControl: AbstractControl,
    toControl: AbstractControl
  ): void {
    if (serviceValue === true) {
      // Si el servicio está en "Sí", hacer requeridos los campos de hora
      fromControl.setValidators([Validators.required]);
      toControl.setValidators([Validators.required]);
    } else {
      // Si el servicio está en "No" o null, remover validaciones requeridas
      fromControl.clearValidators();
      toControl.clearValidators();
    }

    fromControl.updateValueAndValidity({ emitEvent: false });
    toControl.updateValueAndValidity({ emitEvent: false });
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
    const selectedProgram = programs.find(p => p.id === PROGRAM_IDS.PDAM);

    // Verificar elegibilidad para PDAM cuando no es sin fines de lucro
    if (selectedProgram && isPDAMProgram(selectedProgram)) {
      this._dialog.open(CfrInfoDialogComponent, {
        data: {
          title: this._translocoService.translate('sites.add.pdam-not-eligible.title'),
          message: this._translocoService.translate('sites.add.pdam-not-eligible.message'),
          cfrLink: {
            url: 'https://www.ecfr.gov/current/title-7/subtitle-B/chapter-II/subchapter-A/part-210#p-210.9(b)(1)',
            text: this._translocoService.translate('sites.add.pdam-not-eligible.cfr-link-text')
          }
        },
        disableClose: false,
        panelClass: ['mat-dialog-container', 'dialog-responsive']
      });
    }
  }

  private calculateOperatingDays(): void {
    const fromDate = this.headerConfig.formGroup.get('operatingFromDate')?.value;
    const toDate = this.headerConfig.formGroup.get('operatingToDate')?.value;

    if (fromDate && toDate) {
      try {
        const workingDays = this.calculateWorkingDays(fromDate, toDate);

        this.headerConfig.formGroup.patchValue({
          operatingDaysCalculated: workingDays,
        });
      } catch (error) {
        console.error('Error calculating working days:', error);
        this.headerConfig.formGroup.patchValue({
          operatingDaysCalculated: null,
        });
      }
    } else {
      this.headerConfig.formGroup.patchValue({
        operatingDaysCalculated: null,
      });
    }
  }

  /**
   * Actualiza la visibilidad del campo Tipo de Centro basado en el tipo de organización seleccionado
   */
  private updateCenterTypeFieldVisibility(organizationType: OrganizationType): void {
    const centerTypeControl = this.headerConfig.formGroup.get('centerType');

    if (organizationType) {
      this.showCenterTypeField = organizationType.requiresCenterType;

      // Si no requiere tipo de centro, limpiar el valor y remover validación requerida
      if (!organizationType.requiresCenterType) {
        centerTypeControl?.setValue(null);
        centerTypeControl?.clearValidators();
        centerTypeControl?.updateValueAndValidity();
      } else {
        // Si requiere tipo de centro, agregar validación requerida
        centerTypeControl?.setValidators([Validators.required]);
        centerTypeControl?.updateValueAndValidity();
      }
    } else {
      this.showCenterTypeField = false;
      centerTypeControl?.clearValidators();
      centerTypeControl?.updateValueAndValidity();
    }
  }

  /**
   * Calcula los días laborables entre dos fechas (excluyendo fines de semana)
   * @param startDate Fecha de inicio
   * @param endDate Fecha de fin
   * @returns Número de días laborables
   */
  private calculateWorkingDays(startDate: Date, endDate: Date): number {
    // Validar fechas
    if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return 0;
    }

    // Normalizar fechas a medianoche para evitar problemas de zona horaria
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    // Asegurar que las fechas estén en el orden correcto
    const [earlier, later] = start <= end ? [start, end] : [end, start];

    // Calcular semanas completas para optimización
    const totalDays = Math.floor((later.getTime() - earlier.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const fullWeeks = Math.floor(totalDays / 7);
    const workingDaysInFullWeeks = fullWeeks * 5; // 5 días laborables por semana

    // Calcular días restantes
    const remainingDays = totalDays % 7;
    const startDayOfWeek = earlier.getDay();
    let remainingWorkingDays = 0;

    for (let i = 0; i < remainingDays; i++) {
      const dayOfWeek = (startDayOfWeek + i) % 7;
      // Contar solo días laborables (lunes = 1, martes = 2, ..., viernes = 5)
      // Excluir sábado (6) y domingo (0)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        remainingWorkingDays++;
      }
    }

    return workingDaysInFullWeeks + remainingWorkingDays;
  }

  /**
   * Valida si el sitio tiene al menos un año de servicio
   * Validates if the site has at least one year of service
   * NOTE: Validation disabled - commented out for future reference
   */
  checkServiceTime(): void {
    // const serviceTime = this.headerConfig.formGroup.get('serviceTime')?.value;
    // if (serviceTime) {
    //   const today = new Date();
    //   const serviceDate = new Date(serviceTime);
    //   const diffInMonths = (today.getFullYear() - serviceDate.getFullYear()) * 12 + (today.getMonth() - serviceDate.getMonth());

    //   if (diffInMonths < 12) {
    //     this._fuseConfirmationService.open({
    //       title: this._translocoService.translate('sites.notification.title'),
    //       message: this._translocoService.translate('sites.add.service-time.not-eligible'),
    //       actions: {
    //         confirm: {
    //           label: this._translocoService.translate('sites.notification.confirm'),
    //         },
    //         cancel: {
    //           show: false,
    //         },
    //       },
    //     });
    //   }
    // }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  private determineVisibleFields(programs: any[]): void {
    this.isPDAM = programs.some((p) => p.id === PROGRAM_IDS.PDAM);
    this.isPSAV = programs.some((p) => p.id === PROGRAM_IDS.PSAV);
    this.isPACNA = programs.some((p) => p.id === PROGRAM_IDS.PACNA);
    this.isPFHF = programs.some((p) => p.id === PROGRAM_IDS.PFHF);
    this.isPDFE = programs.some((p) => p.id === PROGRAM_IDS.PDFE);
    this.isAESAN = programs.some((p) => p.id === PROGRAM_IDS.AESAN);

    // Cargar tipos de centro según el programa
    this.loadCenterTypesByProgram(programs);

    this.updateValidations();

    // Listener para cambios en groupType que afectan distributionType y siteLocation
    this.headerConfig.formGroup.get('groupType')?.valueChanges.subscribe((groupType) => {
      this.updateDistributionTypeValidation();
      this.getSiteLocationByGroupType(groupType);
      // Si no es "Comedor", limpiar el valor de kitchenType
      if (groupType) {
        const isComedor = groupType.name === 'Comedor' || groupType.nameEN === 'Dining Room';
        if (!isComedor) {
          this.headerConfig.formGroup.patchValue({ kitchenType: null });
          this.kitchenTypes = [];
        }
      }
      this._changeDetectorRef.detectChanges();
      this._changeDetectorRef.detectChanges();
    });

    this._changeDetectorRef.detectChanges();
  }

  // Método para cargar tipos de centro según los programas de la agencia
  // Load center types by agency programs
  private loadCenterTypesByProgram(programs: any[]): void {
    // Los tipos de centro ya vienen filtrados desde el resolver
    // No necesitamos cargar nada adicional aquí
  }

  private updateValidations(): void {
    // Si es Day Care Home, remover todas las validaciones requeridas
    if (this.isDayCareHome) {
      // Remover validaciones requeridas de todos los campos
      const fieldsToUpdate = [
        'name',
        'address',
        'city',
        'region',
        'zipCode',
        'latitude',
        'longitude',
        'postalCity',
        'postalRegion',
        'nonProfit',
        'organizationType',
        'centerType',
        'educationLevels',
        'areaType',
        'locationType',
        // Campos específicos de PACNA
        'organizedAthleticPrograms',
        'atRiskService',
        'publicAllianceContractId',
      ];

      fieldsToUpdate.forEach((fieldName) => {
        const control = this.headerConfig.formGroup.get(fieldName);
        if (control) {
          control.clearValidators();
          control.updateValueAndValidity();
        }
      });

      // Limpiar validaciones de personInCharge cuando es Day Care Home
      this.updatePersonInChargeValidations();
    } else {
      // Restaurar validaciones requeridas cuando no es Day Care Home
      this.restoreRequiredValidations();
    }
  }

  private restoreRequiredValidations(): void {
    // Restaurar validaciones requeridas para campos básicos
    const requiredFields = {
      name: [Validators.required],
      address: [Validators.required],
      city: [Validators.required],
      region: [Validators.required],
      zipCode: [Validators.required],
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

    // educationLevels solo es requerido para PDAM
    const educationLevelsControl = this.headerConfig.formGroup.get('educationLevels');
    if (educationLevelsControl) {
      if (this.isPDAM) {
        educationLevelsControl.setValidators([Validators.required]);
      } else {
        educationLevelsControl.clearValidators();
      }
      educationLevelsControl.updateValueAndValidity();
    }

    // personInCharge solo es requerido para PDAM
    this.updatePersonInChargeValidations();

    // Campos específicos de PACNA - requeridos solo cuando es PACNA y no es Day Care Home
    if (this.isPACNA && !this.isDayCareHome) {
      const pacnaFields = {
        organizedAthleticPrograms: [Validators.required],
        atRiskService: [Validators.required],
        publicAllianceContractId: [Validators.required],
      };

      Object.keys(pacnaFields).forEach((fieldName) => {
        const control = this.headerConfig.formGroup.get(fieldName);
        if (control) {
          control.setValidators(pacnaFields[fieldName]);
          control.updateValueAndValidity();
        }
      });
    } else {
      // Limpiar validadores de campos PACNA si no es PACNA o es Day Care Home
      const pacnaFieldsToClear = ['organizedAthleticPrograms', 'atRiskService', 'publicAllianceContractId'];
      pacnaFieldsToClear.forEach((fieldName) => {
        const control = this.headerConfig.formGroup.get(fieldName);
        if (control) {
          control.clearValidators();
          control.updateValueAndValidity();
        }
      });
    }

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
  }

  /**
   * Actualiza las validaciones de personInCharge según el programa
   * Solo se valida cuando isPDAM es true
   */
  private updatePersonInChargeValidations(): void {
    const personInChargeGroup = this.headerConfig.formGroup.get('personInCharge') as FormGroup;

    if (!personInChargeGroup) {
      return;
    }

    if (this.isPDAM) {
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
    } else {
      // Limpiar todas las validaciones cuando no es PDAM
      Object.keys(personInChargeGroup.controls).forEach(key => {
        const control = personInChargeGroup.get(key);
        if (control) {
          control.clearValidators();
          control.updateValueAndValidity();
        }
      });
    }
  }

  // Método para enviar el formulario
  onSubmit() {
    // Validar formulario
    if (this.headerConfig.formGroup.invalid) {
      // Log detallado de campos inválidos usando función utilitaria
      logFormValidationErrors(this.headerConfig.formGroup, 'Formulario de Sitio');

      this._notificationService.showError('Por favor, complete todos los campos requeridos');
      this.headerConfig.formGroup.markAllAsTouched();
      return;
    }

    const formValues = this.headerConfig.formGroup.value;
    // Ciudad
    const cityId: number = formValues.city?.id;
    // Región
    const regionId: number = formValues.region?.id;
    // Ciudad postal
    const postalCityId: number = formValues.postalCity?.id;
    // Región postal
    const postalRegionId: number = formValues.postalRegion?.id;

    // Horario de desayuno
    const breakfastFrom: string = toTimeString(formValues.breakfastFrom);
    const breakfastTo: string = toTimeString(formValues.breakfastTo);
    // Horario de almuerzo
    const lunchFrom: string = toTimeString(formValues.lunchFrom);
    const lunchTo: string = toTimeString(formValues.lunchTo);
    // Horario de merienda AM
    const snackAMFrom: string = toTimeString(formValues.snackAMFrom);
    const snackAMTo: string = toTimeString(formValues.snackAMTo);
    // Horario de merienda PM
    const snackPMFrom: string = toTimeString(formValues.snackPMFrom);
    const snackPMTo: string = toTimeString(formValues.snackPMTo);

    // Horario de cena
    const dinnerFrom: string = toTimeString(formValues.dinnerFrom);
    const dinnerTo: string = toTimeString(formValues.dinnerTo);
    // Horario de merienda nocturna
    const snackNightFrom: string = toTimeString(formValues.snackNightFrom);
    const snackNightTo: string = toTimeString(formValues.snackNightTo);

    // NUEVOS CAMPOS PARA PACNA - Servicios adicionales
    // Horario de cena horario extendido
    const dinnerExtendedFrom: string = toTimeString(formValues.dinnerExtendedFrom);
    const dinnerExtendedTo: string = toTimeString(formValues.dinnerExtendedTo);
    // Horario de cena en riesgo
    const dinnerAtRiskFrom: string = toTimeString(formValues.dinnerAtRiskFrom);
    const dinnerAtRiskTo: string = toTimeString(formValues.dinnerAtRiskTo);
    // Horario de merienda horario extendido
    const snackExtendedFrom: string = toTimeString(formValues.snackExtendedFrom);
    const snackExtendedTo: string = toTimeString(formValues.snackExtendedTo);
    // Horario de merienda en riesgo
    const snackAtRiskFrom: string = toTimeString(formValues.snackAtRiskFrom);
    const snackAtRiskTo: string = toTimeString(formValues.snackAtRiskTo);

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
      operatingFromDate: formValues.operatingFromDate ?? null,
      operatingToDate: formValues.operatingToDate ?? null,
      operatingDaysCalculated: formValues.operatingDaysCalculated ?? null,
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
      // Persona a Cargo (solo para PDAM)
      // Person in Charge (only for PDAM)
      personInCharge: formValues.personInCharge ? {
        firstName: formValues.personInCharge.firstName ?? null,
        middleName: formValues.personInCharge.middleName ?? null,
        fatherLastName: formValues.personInCharge.fatherLastName ?? null,
        motherLastName: formValues.personInCharge.motherLastName ?? null,
        sitePhone: formValues.personInCharge.sitePhone ?? null,
        extension: formValues.personInCharge.extension ?? null,
        mobilePhone: formValues.personInCharge.mobilePhone ?? null,
      } : null,
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

      // ID que indica si el sitio es un Centro (No) o un Hogar (Sí)
      // ID indicating if the site is a Center (No) or a Home (Yes)
      isDayCareHomeId: this.isDayCareHomeId,

      // IDs de programas de la agencia para determinar lógica de días de funcionamiento
      // Agency program IDs to determine operating days logic
      programIds: this.agency?.programs?.map((p: any) => p.id) || [],
    };

    // ===== CREAR SITE SERVICE REQUEST =====
    // Constantes para servicios básicos
    const breakfast = formValues.breakfast ?? null;
    const lunch = formValues.lunch ?? null;
    const snackAM = formValues.snackAM ?? null;
    const snackPM = formValues.snackPM ?? null;
    const dinner = formValues.dinner ?? null;
    const snackNight = formValues.snackNight ?? null;

    // Constantes para servicios adicionales PACNA
    const dinnerExtended = formValues.dinnerExtended ?? null;
    const dinnerAtRisk = formValues.dinnerAtRisk ?? null;
    const snackExtended = formValues.snackExtended ?? null;
    const snackAtRisk = formValues.snackAtRisk ?? null;

    // Crear SiteServiceRequest
    const siteServiceRequest: SiteServiceRequest = {
      childGroupId: null, // Servicio general

      // Servicios básicos
      breakfast: breakfast,
      breakfastFrom: breakfastFrom ?? null,
      breakfastTo: breakfastTo ?? null,

      lunch: lunch,
      lunchFrom: lunchFrom ?? null,
      lunchTo: lunchTo ?? null,

      snackAM: snackAM,
      snackAMFrom: snackAMFrom ?? null,
      snackAMTo: snackAMTo ?? null,

      dinner: dinner,
      dinnerFrom: dinnerFrom ?? null,
      dinnerTo: dinnerTo ?? null,

      snackPM: snackPM,
      snackPMFrom: snackPMFrom ?? null,
      snackPMTo: snackPMTo ?? null,

      snackNight: snackNight,
      snackNightFrom: snackNightFrom ?? null,
      snackNightTo: snackNightTo ?? null,

      // Servicios adicionales para PACNA
      dinnerExtended: dinnerExtended,
      dinnerExtendedFrom: dinnerExtendedFrom ?? null,
      dinnerExtendedTo: dinnerExtendedTo ?? null,

      dinnerAtRisk: dinnerAtRisk,
      dinnerAtRiskFrom: dinnerAtRiskFrom ?? null,
      dinnerAtRiskTo: dinnerAtRiskTo ?? null,

      snackExtended: snackExtended,
      snackExtendedFrom: snackExtendedFrom ?? null,
      snackExtendedTo: snackExtendedTo ?? null,

      snackAtRisk: snackAtRisk,
      snackAtRiskFrom: snackAtRiskFrom ?? null,
      snackAtRiskTo: snackAtRiskTo ?? null,
    };

    // Validar y limpiar el servicio antes de agregarlo
    const cleanedServiceRequest = validateAndCleanSiteService(siteServiceRequest);

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

    // Agregar servicios al SiteRequest
    if (formValues.offersServiceToDifferentGroups && this.servicesByGroups.length > 0) {
      // Si ofrece servicios a diferentes grupos, crear múltiples servicios (uno por grupo)
      siteRequest.services = this.servicesByGroups.map((serviceData) => {
        const serviceRequest: SiteServiceRequest = {
          siteId: 0, // Se asignará cuando se cree el sitio
          childGroupId: null, // Se asignará cuando se cree el grupo
          // Servicios básicos
          breakfast: serviceData.breakfast || false,
          breakfastFrom: serviceData.breakfastFrom || null,
          breakfastTo: serviceData.breakfastTo || null,
          lunch: serviceData.lunch || false,
          lunchFrom: serviceData.lunchFrom || null,
          lunchTo: serviceData.lunchTo || null,
          snackAM: serviceData.snackAM || false,
          snackAMFrom: serviceData.snackAMFrom || null,
          snackAMTo: serviceData.snackAMTo || null,
          dinner: serviceData.dinner || false,
          dinnerFrom: serviceData.dinnerFrom || null,
          dinnerTo: serviceData.dinnerTo || null,
          snackPM: serviceData.snackPM || false,
          snackPMFrom: serviceData.snackPMFrom || null,
          snackPMTo: serviceData.snackPMTo || null,
          snackNight: serviceData.snackNight || false,
          snackNightFrom: serviceData.snackNightFrom || null,
          snackNightTo: serviceData.snackNightTo || null,
          // Servicios PACNA
          dinnerExtended: serviceData.dinnerExtended || false,
          dinnerExtendedFrom: serviceData.dinnerExtendedFrom || null,
          dinnerExtendedTo: serviceData.dinnerExtendedTo || null,
          dinnerAtRisk: serviceData.dinnerAtRisk || false,
          dinnerAtRiskFrom: serviceData.dinnerAtRiskFrom || null,
          dinnerAtRiskTo: serviceData.dinnerAtRiskTo || null,
          snackExtended: serviceData.snackExtended || false,
          snackExtendedFrom: serviceData.snackExtendedFrom || null,
          snackExtendedTo: serviceData.snackExtendedTo || null,
          snackAtRisk: serviceData.snackAtRisk || false,
          snackAtRiskFrom: serviceData.snackAtRiskFrom || null,
          snackAtRiskTo: serviceData.snackAtRiskTo || null,
        };
        // Validar y limpiar cada servicio
        return validateAndCleanSiteService(serviceRequest);
      });
    } else {
      // Servicio general (sin grupos específicos)
      siteRequest.services = [cleanedServiceRequest];
    }

    // Agregar grupos de niños si OffersServiceToDifferentGroups = true
    if (formValues.offersServiceToDifferentGroups && this.childGroups.length > 0) {
      siteRequest.childGroups = this.childGroups;
    }

    // Agregar información de Day Care Home
    if (this.isDayCareHome) {
      siteRequest.dayCareHome = {
        siteId: 0, // Se asignará cuando se cree el sitio
        isAuthorizedToOperate: formValues.isAuthorizedToOperate ?? null,
        hasFamilyDepartmentLicense: formValues.hasFamilyDepartmentLicense ?? null,
        numberOfEnrolledChildren: formValues.numberOfEnrolledChildren ?? null,
        numberOfProviderChildren: formValues.numberOfProviderChildren ?? null,
        numberOfParticipantsWithBloodTies: formValues.numberOfParticipantsWithBloodTies ?? null,
        numberOfParticipantsWithoutBloodTies: formValues.numberOfParticipantsWithoutBloodTies ?? null,
        minorsLiveWithProvider: formValues.minorsLiveWithProvider ?? null,
        relationshipTypeId: formValues.relationshipType?.id ?? null,
        offersServiceToImmigrantChildren: formValues.offersServiceToImmigrantChildren ?? null,
        homeTypeId: formValues.homeType?.id ?? null,
        administratorAuthorizedName: formValues.administratorAuthorizedName ?? null,
        administratorBirthDate: formValues.administratorBirthDate ?? null,
        offersServiceToDifferentGroups: formValues.offersServiceToDifferentGroups ?? null,
      };
    }

    this.isLoading = true;

    // Disable the form
    this.headerConfig.formGroup.disable();

    this._siteService.insertSite(siteRequest, {}).subscribe({
      next: (result: any) => {
        switch (result.body) {
          case true:
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
            this._notificationService.showErrorDialog();
            break;
        }
      },
      error: () => {
        this._notificationService.showErrorDialog();
        this.headerConfig.formGroup.enable();
      },
      complete: () => {
        this.isLoading = false;
        // Enable the form
        //this.headerConfig.formGroup.enable();
        // Reset the form
        this.headerConfig.formGroup.reset();

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
    // PDAM y PSAV usan 'schools', todos los demás programas usan 'sites'
    if (this.isPDAM || this.isPSAV) {
      return ['schools'];
    }
    // PACNA, PFHF, PDFE, AESAN usan 'sites'
    return ['sites'];
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

  // Método para obtener tipos de cocina según el tipo de grupo seleccionado
  // Get kitchen types by group type
  getKitchenTypesByGroupType(groupType: OptionSelection): void {
    const kitchenTypeControl = this.headerConfig.formGroup.get('kitchenType');

    if (!groupType) {
      this.kitchenTypes = [];
      kitchenTypeControl?.enable();
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

    // Habilitar el control solo para Comedor
    kitchenTypeControl?.enable();

    const queryParameters: QueryParameters = {
      groupTypeId: groupType.id,
    };

    this._kitchenTypeService.getKitchenTypesByGroupType(queryParameters).subscribe({
      next: (response) => {
        if (response) {
          this.kitchenTypes = response.body;

          // Si solo hay una opción disponible, auto-seleccionarla
          if (this.kitchenTypes.length === 1) {
            this.headerConfig.formGroup.patchValue({ kitchenType: this.kitchenTypes[0] });
          } else {
            // Si hay múltiples opciones, limpiar para que el usuario elija
            this.headerConfig.formGroup.patchValue({ kitchenType: null });
          }

          this._changeDetectorRef.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error al cargar los tipos de cocina:', error);
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
    if (selectedDeliveryType && selectedDeliveryType.selectionNotification) {
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

  // ===== MÉTODOS PARA DESARROLLO - CONTROL MANUAL DE PROGRAMAS =====

  /**
   * Maneja el cambio de estado de PDAM para desarrollo
   */
  onDevPDAMChange(checked: boolean): void {
    this.isPDAM = checked;
    this.updateDevPrograms();
  }

  /**
   * Maneja el cambio de estado de PSAV para desarrollo
   */
  onDevPSAVChange(checked: boolean): void {
    this.isPSAV = checked;
    this.updateDevPrograms();
  }

  /**
   * Maneja el cambio de estado de PACNA para desarrollo
   */
  onDevPACNAChange(checked: boolean): void {
    this.isPACNA = checked;
    this.updateDevPrograms();
  }

  /**
   * Maneja el cambio de estado de PFHF para desarrollo
   */
  onDevPFHFChange(checked: boolean): void {
    this.isPFHF = checked;
    this.updateDevPrograms();
  }

  /**
   * Maneja el cambio de estado de PDFE para desarrollo
   */
  onDevPDFEChange(checked: boolean): void {
    this.isPDFE = checked;
    this.updateDevPrograms();
  }

  /**
   * Maneja el cambio de estado de AESAN para desarrollo
   */
  onDevAESANChange(checked: boolean): void {
    this.isAESAN = checked;
    this.updateDevPrograms();
  }

  /**
   * Maneja el cambio de estado de Day Care Home para desarrollo
   */
  onDevDayCareHomeChange(checked: boolean): void {
    this.isDayCareHome = checked;
    this.updateDevPrograms();
  }

  /**
   * Maneja el cambio del campo "¿Ofrece servicio a diferentes grupos de niños?"
   */
  onOffersServiceToDifferentGroupsChange(checked: boolean): void {
    this.showDifferentGroupsFields = checked;
    console.log('Offers service to different groups:', checked);
    console.log('Show different groups fields:', this.showDifferentGroupsFields);

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

  // ==========================================
  // MÉTODOS HANDLER PARA TABLA DE SERVICIOS
  // ==========================================

  /**
   * Maneja el evento de agregar servicio desde la tabla
   */
  onTableAdd(): void {
    const dialogRef = this._dialog.open(AddServiceByGroupModalComponent, {
      data: {
        isEdit: false,
        yesNoOptions: this.yesNoOptions,
      } as ServiceByGroupDialogData,
      width: '90vw',
      maxWidth: '1200px',
      height: '90vh',
      maxHeight: '800px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: ServiceByGroupDialogData) => {
      if (result) {
        // Generar ID único para el servicio
        const newId = this.servicesByGroups.length > 0 ? Math.max(...this.servicesByGroups.map((s) => s.id || 0)) + 1 : 1;

        result.id = newId;
        this.servicesByGroups.push(result);
        this.updateServicesTableDataSource();
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

    const dialogRef = this._dialog.open(AddServiceByGroupModalComponent, {
      data: {
        ...serviceToEdit,
        isEdit: true,
        yesNoOptions: this.yesNoOptions,
      } as ServiceByGroupDialogData,
      width: '90vw',
      maxWidth: '1200px',
      height: '90vh',
      maxHeight: '800px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: ServiceByGroupDialogData) => {
      if (result) {
        const index = this.servicesByGroups.findIndex((s) => s.id === id);
        if (index !== -1) {
          this.servicesByGroups[index] = result;
          this.updateServicesTableDataSource();
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

    // Confirmar eliminación
    const confirmMessage = this._translocoService.translate('sites.add.services.confirm-delete', {
      groupName: serviceToDelete.groupName,
    });

    if (confirm(confirmMessage)) {
      const index = this.servicesByGroups.findIndex((s) => s.id === id);
      if (index !== -1) {
        this.servicesByGroups.splice(index, 1);
        this.updateServicesTableDataSource();
        this._notificationService.showSuccess('sites.add.services.success.deleted');
      }
    }
  }

  /**
   * Actualiza el dataSource de la tabla de servicios
   */
  private updateServicesTableDataSource(): void {
    this.servicesTableConfig.dataSource.data = [...this.servicesByGroups];
  }

  // ===== MÉTODOS DE VALIDACIÓN PACNA =====

  /**
   * Valida los campos específicos de PACNA
   */
  checkPACNAValidation(): void {
    if (!this.isPACNA) {
      this.pacnaValidationMessage = { type: null, message: null };
      return;
    }

    const formValues = this.headerConfig.formGroup.value;
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
   * Actualiza los programas activos basado en los checkboxes de desarrollo
   */
  private updateDevPrograms(): void {
    // Actualizar validaciones y campos visibles
    this.updateValidations();
    this._changeDetectorRef.detectChanges();
  }

  /**
   * Verifica si se debe mostrar el campo de Tipo de Cocina
   * Solo se muestra cuando:
   * - El programa es PDAM
   * - Y el Tipo de Grupo seleccionado es "Comedor" (Dining Room)
   */
  get shouldShowKitchenTypeField(): boolean {
    // Solo para PDAM
    if (!this.isPDAM) {
      return false;
    }

    // Verificar si el Tipo de Grupo seleccionado es "Comedor"
    const groupType = this.headerConfig.formGroup.get('groupType')?.value;
    if (groupType) {
      const isComedor = groupType.name === 'Comedor' || groupType.nameEN === 'Dining Room';
      return isComedor;
    }

    return false;
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
    return policies.filter(p => p.id !== 3 && p.id !== 4 && p.id !== 5);
  }

  /**
   * Verifica si se deben mostrar los campos de fecha de inicio de provisión
   * Solo se muestran cuando la política de funcionamiento es 3, 4 o 5 (Provisión I, II, III)
   * O si está en modo desarrollo y el checkbox está marcado
   */
  get shouldShowProvisionFields(): boolean {
    const operatingPolicy = this.headerConfig.formGroup.get('operatingPolicy')?.value;

    // En modo desarrollo, si el checkbox está marcado, mostrar siempre
    if (this.isDevelopmentMode && this.showProvisionFieldsDev) {
      return true;
    }

    // Verificar si la política seleccionada es 3, 4 o 5
    if (operatingPolicy && operatingPolicy.id) {
      return operatingPolicy.id === 3 || operatingPolicy.id === 4 || operatingPolicy.id === 5;
    }

    return false;
  }

  /**
   * Maneja el cambio del checkbox de campos de provisión para desarrollo
   */
  onDevProvisionFieldsChange(checked: boolean): void {
    this.showProvisionFieldsDev = checked;
    this._changeDetectorRef.detectChanges();
  }
}
