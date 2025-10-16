import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Validators, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { SiteService } from 'app/shared/services/site.service';
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
import { NgForOf, NgIf, NgClass } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { OptionSelection } from 'app/shared/models/OptionSelection';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { City } from 'app/shared/models/City';
import { Region } from 'app/shared/models/Region';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { SiteRequest } from 'app/shared/models/Request/SiteRequest';
import { SiteServiceRequest } from 'app/shared/models/Request/SiteServiceRequest';
import { SiteEducationLevelRequest } from 'app/shared/models/Request/SiteEducationLevelRequest';
import { SiteChildGroupRequest } from 'app/shared/models/Request/SiteChildGroupRequest';
import { SiteDayCareHomeRequest } from 'app/shared/models/Request/SiteDayCareHomeRequest';
import { GroupTypeService } from 'app/shared/services/group-type.service';
import { KitchenTypeService } from 'app/shared/services/kitchen-type.service';
import { DeliveryTypeService } from 'app/shared/services/delivery-type.service';
import { CenterTypeService } from 'app/shared/services/center-type.service';
import { SponsorTypeService } from 'app/shared/services/sponsor-type.service';
import { AuthService } from 'app/core/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { OrganizationType } from 'app/shared/models/OrganizationType';
import { EducationLevel } from 'app/shared/models/EducationLevel';
import { CenterType } from 'app/shared/models/CenterType';
import { DeliveryType } from 'app/shared/models/DeliveryType';
import { SponsorType } from 'app/shared/models/SponsorType';
import { compareById, isNullOrUndefinedEmptyStringNullArray, toTimeDate, toTimeString } from 'app/shared/utils';
import { Site } from 'app/shared/models/Site';
import { SiteList } from 'app/shared/models/SiteList';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { NotificationService } from 'app/shared/services/notification.service';
import { GenericTableConfig, OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { MatTableDataSource } from '@angular/material/table';
import { SATELLITE_SCHOOLS_COLUMNS_SCHEMA } from './columns-schema';
import { SERVICES_COLUMNS_SCHEMA } from '../add-service-by-group-modal/services-columns-schema';
import { AddServiceByGroupModalComponent, ServiceByGroupDialogData } from '../add-service-by-group-modal/add-service-by-group-modal.component';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { AreaType } from 'app/shared/models/AreaType';
import { MatDialog } from '@angular/material/dialog';
import { PermissionRequestDialogComponent } from '../permission-request-dialog/permission-request-dialog.component';
import { PermissionRequestFormDialogComponent } from '../permission-request-form-dialog/permission-request-form-dialog.component';
import { FieldVisibilityService } from 'app/shared/services/field-visibility.service';
import { AreaTypeService } from 'app/shared/services/area-type.service';
import { AgencyService } from 'app/shared/services/agency.service';
import { Agency } from 'app/shared/models/Agency';
import { OperatingPolicy } from 'app/shared/models/OperatingPolicy';
import { PROGRAM_IDS } from 'app/shared/const';
import { environment } from 'environments/environment';

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
  ],
})
export class EditSiteComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers, OnGenericTableHandler {
  // Subject para suscribirse a todos los observables al destruir el componente
  // Subject to unsubscribe from all observables on component destroy
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // Inyección de dependencias y servicios
  // Dependency injection and services
  private _formBuilder = inject(UntypedFormBuilder);
  private _siteService = inject(SiteService);
  private _geoService = inject(GeoService);
  private _operatingPolicyService = inject(OperatingPolicyService);
  private _snackBar = inject(MatSnackBar);
  private _customRouter = inject(CustomRouterService);
  private _translocoService = inject(TranslocoService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _groupTypeService = inject(GroupTypeService);
  private _sponsorTypeService = inject(SponsorTypeService);
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
  private _dialog = inject(MatDialog);
  private _fieldVisibilityService = inject(FieldVisibilityService);
  private _fuseConfirmationService = inject(FuseConfirmationService);

  // Catálogos
  // Catalogs
  listCities: City[] = [];
  listRegions: Region[] = [];
  listPostalRegions: Region[] = [];

  // Yes No Options (1, 2)
  // Si (1) y No (2)
  yesNoOptions: OptionSelection[] = [];

  // Relationship Type Options
  // Opciones de Parentesco
  relationshipTypeOptions: OptionSelection[] = [];

  // Home Type Options
  // Opciones de Tipo de Hogar
  homeTypeOptions: OptionSelection[] = [];

  // Participant Type Options
  // Opciones de Tipo de Participantes
  participantTypeOptions: OptionSelection[] = [];

  // Tipo de Organización Sitio (1), Satélite (2), Institución Residencial (3), Otros (4)
  // Organization type - Required field for site classification
  organizationTypes: OrganizationType[] = [];

  // Nivel educativo - Campo requerido para tipo de sitio
  // Education level - Required field for site type
  educationLevels: EducationLevel[] = [];

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

  // Lista de sitios
  // List of sites
  listSites: SiteList[] = [];

  // Si el sitio actual es el principal
  // If the current site is the main site
  isMainSite: boolean = false;

  // Propiedades para controlar visibilidad según programa
  isPDAM: boolean = false;
  isPSAV: boolean = false;
  isPACNA: boolean = false;
  isPFHF: boolean = false;
  isPDFE: boolean = false;
  isAESAN: boolean = false;

  // ViewChild para el contenedor del grid
  @ViewChild('gridContainer') gridContainer!: ElementRef;

  // Propiedad para controlar visibilidad cuando es Day Care Home
  isDayCareHome: boolean = false;
  showDifferentGroupsFields: boolean = false;

  // Propiedad para controlar la visibilidad de la sección de desarrollo
  isDevelopmentMode: boolean = !environment.production;

  // Propiedades para manejar grupos de niños específicos
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
      // Nombre del sitio - Campo requerido para identificar el sitio
      // Site name - Required field for identifying the site
      name: ['', Validators.required],
      // Sitio principal - Campo requerido para seleccionar el sitio principal (solo si no es sitio principal)
      // Main site - Required field for selecting the main site (only if not main site)
      mainSite: [null],
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
      postalZipCode: [''],
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
      // Type of applicant - Type of applicant of the site
      typeOfApplicant: [null],
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
      hasWarehouse: [false],
      // Comedor - Campo requerido para indicar si el sitio tiene un comedor
      // Dining room - Required field indicating if the site has a dining room
      hasDiningRoom: [false],
      // Nombre del autorizado - Campo requerido para indicar el nombre del autorizado del sitio
      // Administrator authorized name - Required field indicating the name of the authorized of the site
      administratorAuthorizedName: [''],
      // Teléfono del sitio - Campo requerido para indicar el teléfono del sitio
      // Site phone - Required field indicating the site phone
      sitePhone: [''],
      // Extensión - Campo requerido para indicar la extensión del teléfono del sitio
      // Extension - Required field indicating the extension of the site phone
      extension: [''],
      // Teléfono móvil - Campo requerido para indicar el teléfono móvil del sitio
      // Mobile phone - Required field indicating the mobile phone of the site
      mobilePhone: [''],
      // Desayuno - Campo requerido para indicar si el sitio tiene desayuno
      // Breakfast - Required field indicating if the site has breakfast
      breakfast: [false],
      // Desayuno desde - Campo requerido para indicar la hora de inicio del desayuno
      // Breakfast from - Required field indicating the start time of breakfast
      breakfastFrom: [null],
      // Desayuno hasta - Campo requerido para indicar la hora de fin del desayuno
      // Breakfast to - Required field indicating the end time of breakfast
      breakfastTo: [null],
      // Almuerzo - Campo requerido para indicar si el sitio tiene almuerzo
      // Lunch - Required field indicating if the site has lunch
      lunch: [false],
      // Almuerzo desde - Campo requerido para indicar la hora de inicio del almuerzo
      // Lunch from - Required field indicating the start time of lunch
      lunchFrom: [null],
      // Almuerzo hasta - Campo requerido para indicar la hora de fin del almuerzo
      // Lunch to - Required field indicating the end time of lunch
      lunchTo: [null],
      // Merienda AM - Campo requerido para indicar si el sitio tiene merienda AM
      // Snack AM - Required field indicating if the site has snack AM
      snackAM: [false],
      // Merienda AM desde - Campo requerido para indicar la hora de inicio de la merienda AM
      // Snack AM from - Required field indicating the start time of snack AM
      snackAMFrom: [null],
      // Merienda AM hasta - Campo requerido para indicar la hora de fin de la merienda AM
      // Snack AM to - Required field indicating the end time of snack AM
      snackAMTo: [null],
      // Merienda PM - Campo requerido para indicar si el sitio tiene merienda PM
      // Snack PM - Required field indicating if the site has snack PM
      snackPM: [false],
      // Merienda PM desde - Campo requerido para indicar la hora de inicio de la merienda PM
      // Snack PM from - Required field indicating the start time of snack PM
      snackPMFrom: [null],
      // Merienda PM hasta - Campo requerido para indicar la hora de fin de la merienda PM
      // Snack PM to - Required field indicating the end time of snack PM
      snackPMTo: [null],
      // Cena - Campo requerido para indicar si el sitio tiene cena
      // Dinner - Required field indicating if the site has dinner
      dinner: [false],
      // Cena desde - Campo requerido para indicar la hora de inicio de la cena
      // Dinner from - Required field indicating the start time of dinner
      dinnerFrom: [null],
      // Cena hasta - Campo requerido para indicar la hora de fin de la cena
      // Dinner to - Required field indicating the end time of dinner
      dinnerTo: [null],
      // Merienda nocturna - Campo requerido para indicar si el sitio tiene merienda nocturna
      // Snack night - Required field indicating if the site has snack night
      snackNight: [false],
      // Merienda nocturna desde - Campo requerido para indicar la hora de inicio de la merienda nocturna
      // Snack night from - Required field indicating the start time of snack night
      snackNightFrom: [null],
      // Merienda nocturna hasta - Campo requerido para indicar la hora de fin de la merienda nocturna
      // Snack night to - Required field indicating the end time of snack night
      snackNightTo: [null],
      // NUEVOS CAMPOS PARA PACNA - Servicios adicionales
      // Cena Horario Extendido (si, no)
      dinnerExtended: [false],
      // Horario desde para la cena horario extendido
      dinnerExtendedFrom: [null],
      // Horario hasta para la cena horario extendido
      dinnerExtendedTo: [null],
      // Cena en Riesgo (si, no)
      dinnerAtRisk: [false],
      // Horario desde para la cena en riesgo
      dinnerAtRiskFrom: [null],
      // Horario hasta para la cena en riesgo
      dinnerAtRiskTo: [null],
      // Merienda Horario Extendido (si, no)
      snackExtended: [false],
      // Horario desde para la merienda horario extendido
      snackExtendedFrom: [null],
      // Horario hasta para la merienda horario extendido
      snackExtendedTo: [null],
      // Merienda en Riesgo (si, no)
      snackAtRisk: [false],
      // Horario desde para la merienda en riesgo
      snackAtRiskFrom: [null],
      // Horario hasta para la merienda en riesgo
      snackAtRiskTo: [null],
      // Comunidad - Campo requerido para indicar la comunidad del sitio
      // Community - Required field indicating the community of the site
      community: [null],
      // Caminantes - Campo requerido para indicar los caminantes del sitio
      // Walkers - Required field indicating the walkers of the site
      walkers: [null],
      // Tipo de sitio - Campo requerido para indicar el tipo de sitio
      // Site type - Required field indicating the site type
      siteType: [null],
      // Experiencia - Campo requerido para indicar la experiencia del sitio
      // Experience - Required field indicating the experience of the site
      experience: [null],
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
      reviewResult: [null],
      // Fecha de revisión - Fecha cuando se realizó la revisión
      // Review date - Date when the review was conducted
      reviewDate: [null],
      // Justificación de revisión - Justificación de la revisión
      // Review justification - Justification of the review
      reviewJustification: [null],
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
      // Código de Sitio
      // Site Code
      siteCode: [{ value: '', disabled: true }],
    }),
    // Cancel button
    cancelButtonShow: true,
    cancelButtonText: 'sites.edit.buttons.cancel',
    // Submit button
    submitButtonShow: true,
    submitButtonText: 'sites.edit.buttons.save',
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

  // Función para obtener la clase de grid dinámica
  getGridColumnsClass(): string {
    if (!this.gridContainer) {
      return 'sm:grid-cols-4'; // valor por defecto
    }

    const visibleFields = this.gridContainer.nativeElement.querySelectorAll('mat-form-field');
    const count = visibleFields.length;

    return `sm:grid-cols-${count}`;
  }

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

    // Configurar FieldVisibilityService SOLO para distributionType
    this._fieldVisibilityService.setActiveConfig('sites');

    // Obtener Agencia desde local storage desde AuthService
    this.agencyId = this._authService.getAgencyId();

    // Obtener datos del resolver en lugar de suscribirse
    const resolvedData = this._route.snapshot.data['data'];

    if (resolvedData) {
      // Yes No Options
      this.yesNoOptions = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'yesNo');
      // Tipo de residencial
      this.typeOfResidential = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'typeOfResidential');
      // Tipo de solicitante
      this.typeOfApplicant = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'typeOfApplicant');
      // Opciones de Day Care Home
      this.relationshipTypeOptions = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'relationshipType');
      this.homeTypeOptions = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'homeType');
      this.participantTypeOptions = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'participantType');
      // Estatus
      this.isActive = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'isActive');
      // Política de operación - NO USAR ESTA LÍNEA, se usa la de abajo desde operatingPolicies
      // this.operatingPolicies = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'operatingPolicy');
      // Tipo de cocina
      this.kitchenTypes = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'kitchenType');
      // Site Location
      this.siteLocations = resolvedData.siteLocations || [];
      // Tipo de grupo
      this.groupTypes = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'groupType');
      // Comunidad
      this.community = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'community');
      // Caminantes / Walkers
      this.walkers = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'walkers');
      // Tipo de distribución / Distribution type
      this.distributionType = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'distributionType');
      // Tipo de sitio / Site type
      this.siteType = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'siteType');
      // Experiencia / Experience
      this.experience = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'experience');
      // Resultado de revisión / Review result
      this.reviewResult = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'reviewResult');

      // Catálogos
      this.centerTypes = resolvedData.centerTypes;
      this.organizationTypes = resolvedData.organizationTypes;
      this.educationLevels = resolvedData.educationLevels;
      this.kitchenTypes = resolvedData.kitchenTypes;
      this.siteLocations = resolvedData.siteLocations || [];
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
      this.listPostalRegions = resolvedData.regions;
      this.areaTypes = resolvedData.areaTypes;
      this.locationTypes = resolvedData.areaTypes; // Usar los mismos valores que AreaType
      this.listSites = resolvedData.sites;

      // Verificar sitio principal - se establecerá en onSetForm con el valor correcto
      // this.isMainSite = !resolvedData.hasMainSite; // Comentado: lógica incorrecta

      // Usar la sitio del resolver
      // Use site from resolver
      this.onSetForm(resolvedData.site);

      this._changeDetectorRef.markForCheck();
    }

    // Obtener datos de la agencia para determinar campos visibles
    this._agencyService.agency$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.agency = result.body;
        const programs = this.agency.programs || [];

        // Obtener el valor de isDayCareHome de la inscripción
        this.isDayCareHome = this.agency?.inscription?.isDayCareHome || false;

        // Determinar qué campos mostrar según los programas
        this.determineVisibleFields(programs);

        // IMPORTANTE: Re-ejecutar updateValidations después de establecer isDayCareHome
        // para asegurar que las validaciones se apliquen correctamente
        this.updateValidations();
      }
    });

    // Transloco
    this._translocoService.langChanges$.pipe(takeUntil(this._unsubscribeAll)).subscribe((lang: string) => {
      this.currentLang = lang;
    });

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

    // Listener para cambios en groupType que afectan distributionType y siteLocation
    this.headerConfig.formGroup.get('groupType')?.valueChanges.subscribe((groupType) => {
      this.updateDistributionTypeValidation();
      this.getSiteLocationByGroupType(groupType);
      this._changeDetectorRef.detectChanges();
    });

    // Suscribirse a cambios en el control isActive para manejar campos de inactivación
    this.headerConfig.formGroup
      .get('isActive')
      ?.valueChanges.pipe(takeUntil(this._unsubscribeAll))
      .subscribe((isActive: boolean) => {
        const inactiveJustificationControl = this.headerConfig.formGroup.get('inactiveJustification');

        if (isActive === false) {
          // Si el sitio está inactivo, requerir justificación
          inactiveJustificationControl?.setValidators([Validators.required]);
        } else {
          // Si el sitio está activo, limpiar validadores y valores
          inactiveJustificationControl?.clearValidators();
          inactiveJustificationControl?.setValue('');
          this.headerConfig.formGroup.get('inactiveDate')?.setValue(null);
        }

        inactiveJustificationControl?.updateValueAndValidity();
      });
  }

  private calculateOperatingDays(): void {
    const fromDateValue = this.headerConfig.formGroup.get('operatingFromDate')?.value;
    const toDateValue = this.headerConfig.formGroup.get('operatingToDate')?.value;

    if (fromDateValue && toDateValue) {
      try {
        // Convert form values to Date objects if they aren't already
        const fromDate = fromDateValue instanceof Date ? fromDateValue : new Date(fromDateValue);
        const toDate = toDateValue instanceof Date ? toDateValue : new Date(toDateValue);

        // Validate that the conversion was successful
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
          console.warn('Invalid date values provided for operating days calculation');
          this.headerConfig.formGroup.patchValue({
            operatingDaysCalculated: null,
          });
          return;
        }

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
   * Calcula los días laborables entre dos fechas (excluyendo fines de semana)
   * @param startDate Fecha de inicio
   * @param endDate Fecha de fin
   * @returns Número de días laborables
   */
  private calculateWorkingDays(startDate: Date, endDate: Date): number {
    // Validar que los parámetros sean Date objects válidos
    if (!startDate || !endDate || !(startDate instanceof Date) || !(endDate instanceof Date)) {
      console.warn('Invalid Date objects provided to calculateWorkingDays');
      return 0;
    }

    // Validar fechas
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.warn('Invalid date values provided to calculateWorkingDays');
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
   */
  checkServiceTime(): void {
    const serviceTime = this.headerConfig.formGroup.get('serviceTime')?.value;
    if (serviceTime) {
      const today = new Date();
      const serviceDate = new Date(serviceTime);
      const diffInMonths = (today.getFullYear() - serviceDate.getFullYear()) * 12 + (today.getMonth() - serviceDate.getMonth());

      if (diffInMonths < 12) {
        this._fuseConfirmationService.open({
          title: this._translocoService.translate('sites.notification.title'),
          message: this._translocoService.translate('sites.edit.service-time.not-eligible'),
          actions: {
            confirm: {
              label: this._translocoService.translate('sites.notification.confirm'),
            },
            cancel: {
              show: false,
            },
          },
        });
      }
    }
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

    // updateValidations() se ejecuta después en la suscripción a agency$
    this._changeDetectorRef.detectChanges();
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
      ];

      fieldsToUpdate.forEach((fieldName) => {
        const control = this.headerConfig.formGroup.get(fieldName);
        if (control) {
          control.clearValidators();
          control.updateValueAndValidity();
        }
      });
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
      centerType: [Validators.required],
      educationLevels: [Validators.required],
    };

    Object.keys(requiredFields).forEach((fieldName) => {
      const control = this.headerConfig.formGroup.get(fieldName);
      if (control) {
        control.setValidators(requiredFields[fieldName]);
        control.updateValueAndValidity();
      }
    });
  }

  onSetForm(param: Site): void {
    this.param = param;
    // this.isMainSite = param.isMainSite || false; // TODO: Add to Site model

    const mainSiteControl = this.headerConfig.formGroup.get('mainSite');

    // Si este sitio es el principal, no debería poder seleccionar un sitio principal
    if (this.isMainSite) {
      mainSiteControl.disable();
      mainSiteControl.clearValidators();
      mainSiteControl.setValue(null);
    } else {
      mainSiteControl.enable();
      //mainSiteControl.setValidators([Validators.required]);
    }

    mainSiteControl.updateValueAndValidity();

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
    const residentialType = param.residentialType;
    const operatingPolicy = param.operatingPolicy;
    const educationLevels = param.educationLevels || [];
    const organizationType = param.organizationType;
    const centerType = param.centerType;
    const areaType = param.areaType;
    const locationType = param.locationType;

    // Obtener datos de servicios desde la primera entrada del array services
    const siteService = param.services && param.services.length > 0 ? param.services[0] : null;

    // Horarios de servicios básicos
    const breakfastFrom: Date | null = siteService ? toTimeDate(siteService.breakfastFrom) : null;
    const breakfastTo: Date | null = siteService ? toTimeDate(siteService.breakfastTo) : null;
    const lunchFrom: Date | null = siteService ? toTimeDate(siteService.lunchFrom) : null;
    const lunchTo: Date | null = siteService ? toTimeDate(siteService.lunchTo) : null;
    const snackAMFrom: Date | null = siteService ? toTimeDate(siteService.snackAMFrom) : null;
    const snackAMTo: Date | null = siteService ? toTimeDate(siteService.snackAMTo) : null;
    const snackPMFrom: Date | null = siteService ? toTimeDate(siteService.snackPMFrom) : null;
    const snackPMTo: Date | null = siteService ? toTimeDate(siteService.snackPMTo) : null;

    // const mainSite = param.mainSite; // TODO: Add to Site model

    // Campos adicionales
    const dinnerFrom: Date | null = siteService ? toTimeDate(siteService.dinnerFrom) : null;
    const dinnerTo: Date | null = siteService ? toTimeDate(siteService.dinnerTo) : null;
    const snackNightFrom: Date | null = siteService ? toTimeDate(siteService.snackNightFrom) : null;
    const snackNightTo: Date | null = siteService ? toTimeDate(siteService.snackNightTo) : null;

    // NUEVOS CAMPOS PARA PACNA - Servicios adicionales
    // Horarios de cena horario extendido
    const dinnerExtendedFrom: Date | null = siteService ? toTimeDate(siteService.dinnerExtendedFrom) : null;
    const dinnerExtendedTo: Date | null = siteService ? toTimeDate(siteService.dinnerExtendedTo) : null;
    // Horarios de cena en riesgo
    const dinnerAtRiskFrom: Date | null = siteService ? toTimeDate(siteService.dinnerAtRiskFrom) : null;
    const dinnerAtRiskTo: Date | null = siteService ? toTimeDate(siteService.dinnerAtRiskTo) : null;
    // Horarios de merienda horario extendido
    const snackExtendedFrom: Date | null = siteService ? toTimeDate(siteService.snackExtendedFrom) : null;
    const snackExtendedTo: Date | null = siteService ? toTimeDate(siteService.snackExtendedTo) : null;
    // Horarios de merienda en riesgo
    const snackAtRiskFrom: Date | null = siteService ? toTimeDate(siteService.snackAtRiskFrom) : null;
    const snackAtRiskTo: Date | null = siteService ? toTimeDate(siteService.snackAtRiskTo) : null;

    const communityId = param.communityId;
    const walkersId = param.walkersId;
    const siteTypeId = param.siteTypeId;
    const experienceId = param.experienceId;
    const reviewResultId = param.reviewResultId;
    const reviewDate = param.reviewDate;
    const reviewJustification = param.reviewJustification;

    this.headerConfig.formGroup.patchValue({
      name: param.name,
      // mainSite: mainSite, // TODO: Add to Site model
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
      serviceTime: param.serviceTime,
      //
      nonProfit: param.nonProfit,
      startDate: param.startDate,
      baseYear: param.baseYear,
      renewalYear: param.renewalYear,
      administratorAuthorizedName: param.administratorAuthorizedName,
      sitePhone: param.sitePhone,
      extension: param.extension,
      mobilePhone: param.mobilePhone,
      // Servicios básicos
      breakfast: siteService?.breakfast || false,
      breakfastFrom: breakfastFrom,
      breakfastTo: breakfastTo,
      lunch: siteService?.lunch || false,
      lunchFrom: lunchFrom,
      lunchTo: lunchTo,
      snackAM: siteService?.snackAM || false,
      snackAMFrom: snackAMFrom,
      snackAMTo: snackAMTo,
      snackPM: siteService?.snackPM || false,
      snackPMFrom: snackPMFrom,
      snackPMTo: snackPMTo,
      dinner: siteService?.dinner || false,
      dinnerFrom: dinnerFrom,
      dinnerTo: dinnerTo,
      snackNight: siteService?.snackNight || false,
      snackNightFrom: snackNightFrom,
      snackNightTo: snackNightTo,
      // Servicios adicionales para PACNA
      dinnerExtended: siteService?.dinnerExtended || false,
      dinnerExtendedFrom: dinnerExtendedFrom,
      dinnerExtendedTo: dinnerExtendedTo,
      dinnerAtRisk: siteService?.dinnerAtRisk || false,
      dinnerAtRiskFrom: dinnerAtRiskFrom,
      dinnerAtRiskTo: dinnerAtRiskTo,
      snackExtended: siteService?.snackExtended || false,
      snackExtendedFrom: snackExtendedFrom,
      snackExtendedTo: snackExtendedTo,
      snackAtRisk: siteService?.snackAtRisk || false,
      snackAtRiskFrom: snackAtRiskFrom,
      snackAtRiskTo: snackAtRiskTo,
      community: this.community.find((o) => o.id === communityId),
      walkers: this.walkers.find((o) => o.id === walkersId),
      siteType: this.siteType.find((o) => o.id === siteTypeId),
      experience: this.experience.find((o) => o.id === experienceId),
      reviewResult: this.reviewResult.find((o) => o.id === reviewResultId),
      reviewDate: reviewDate,
      reviewJustification: reviewJustification,
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
      residentialType: residentialType,
      operatingPolicy: operatingPolicy,
      areaType: areaType,
      locationType: locationType,
      generalEnrollment: param.generalEnrollment,
      administratorBirthDate: param.dayCareHome?.administratorBirthDate,
      siteCode: param.siteCode || '',

      typeOfApplicant: param.typeOfApplicant,
      relationshipType: param.relationshipType,

      // ===== CAMPOS ESPECÍFICOS PARA PACNA =====

      // ¿El sitio ofrece programas atléticos organizados que participan en deportes competitivos interescolares o a nivel comunitario?
      // Does the site offer organized athletic programs engaged in interscholastic or community level competitive sports?
      organizedAthleticPrograms: param.organizedAthleticPrograms ?? null,

      // ¿El sitio está interesado en participar en el servicio de merienda y cena en riesgo?
      // Is the site interested in participating in the at-risk snack and dinner service?
      atRiskService: param.atRiskService ?? null,
    });

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
      Object.keys(this.headerConfig.formGroup.controls).forEach(key => {
        const control = this.headerConfig.formGroup.get(key);
        if (control && control.invalid) {
        }
      });

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
    const siteLocationId: number = formValues.siteLocation?.id;
    const groupTypeId: number = formValues.groupType?.id;
    const deliveryTypeId: number = formValues.deliveryType?.id;
    const sponsorTypeId: number = formValues.sponsorType?.id ?? null;
    const applicantTypeId: number = formValues.typeOfApplicant?.id;
    const centerTypeId: number = formValues.centerType?.id;
    const residentialTypeId: number = formValues.typeOfResidential?.id;
    const operatingPolicyId: number = formValues.operatingPolicy?.id;
    const areaTypeId: number = formValues.areaType?.id;
    const locationTypeId: number = formValues.locationType?.id;
    const relationshipTypeId: number = formValues.relationshipType?.id;
    // Horarios de servicios básicos
    const breakfastFrom: string = toTimeString(formValues.breakfastFrom);
    const breakfastTo: string = toTimeString(formValues.breakfastTo);
    const lunchFrom: string = toTimeString(formValues.lunchFrom);
    const lunchTo: string = toTimeString(formValues.lunchTo);
    const snackAMFrom: string = toTimeString(formValues.snackAMFrom);
    const snackAMTo: string = toTimeString(formValues.snackAMTo);
    const snackPMFrom: string = toTimeString(formValues.snackPMFrom);
    const snackPMTo: string = toTimeString(formValues.snackPMTo);

    // Servicios básicos
    const snackAM = formValues.snackAM;
    const snackPM = formValues.snackPM;
    const lunch = formValues.lunch;
    const breakfast = formValues.breakfast;

    // Campos adicionales
    const dinnerFrom: string = toTimeString(formValues.dinnerFrom);
    const dinnerTo: string = toTimeString(formValues.dinnerTo);
    const snackNightFrom: string = toTimeString(formValues.snackNightFrom);
    const snackNightTo: string = toTimeString(formValues.snackNightTo);
    const dinner = formValues.dinner;
    const snackNight = formValues.snackNight;

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

    const communityId = formValues.community?.id;
    const walkersId = formValues.walkers?.id;
    const siteTypeId = formValues.siteType?.id;
    const experienceId = formValues.experience?.id;
    const reviewResultId = formValues.reviewResult?.id;
    const reviewDate = formValues.reviewDate;
    const reviewJustification = formValues.reviewJustification;

    const mainSiteId = formValues.mainSite?.id;

    // Construir el objeto de actualización
    // Build the update object
    const siteRequest: SiteRequest = {
      id: this.param.id,
      agencyId: this.agencyId,
      // mainSiteId: mainSiteId, // TODO: Add to SiteRequest model
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
      siteLocationId: siteLocationId,
      groupTypeId: groupTypeId,
      deliveryTypeId: deliveryTypeId,
      sponsorTypeId: sponsorTypeId,
      applicantTypeId: applicantTypeId,
      operatingPolicyId: operatingPolicyId,
      residentialTypeId: residentialTypeId,
      areaTypeId: areaTypeId,
      locationTypeId: locationTypeId,
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
      communityId: communityId ?? null,
      walkersId: walkersId ?? null,
      siteTypeId: siteTypeId ?? null,
      experienceId: experienceId ?? null,
      reviewResultId: reviewResultId ?? null,
      reviewDate: reviewDate ?? null,
      reviewJustification: reviewJustification ?? null,
      // Campos requeridos por el stored procedure 104_UpdateSite
      isMainSite: this.isMainSite ?? false,
      serviceTime: formValues.serviceTime ?? null,
      isActive: formValues.isActive ?? true,
      inactiveJustification: formValues.inactiveJustification ?? null,
      inactiveDate: formValues.inactiveDate ?? null,
      generalEnrollment: formValues.generalEnrollment ?? null,
      // ¿El sitio ofrece programas atléticos organizados que participan en deportes competitivos interescolares o a nivel comunitario?
      // Does the site offer organized athletic programs engaged in interscholastic or community level competitive sports?
      organizedAthleticPrograms: formValues.organizedAthleticPrograms ?? null,
      // ¿El sitio está interesado en participar en el servicio de merienda y cena en riesgo?
      // Is the site interested in participating in the at-risk snack and dinner service?
      atRiskService: formValues.atRiskService ?? null,

      // Indica si la agencia es Day Care Home
      // Indicates if the agency is Day Care Home
      isDayCareHome: this.isDayCareHome,
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

    // ===== CREAR SCHOOL SERVICE REQUEST =====
    // Constantes para servicios básicos
    const breakfastService = breakfast ?? null;
    const lunchService = lunch ?? null;
    const snackAMService = snackAM ?? null;
    const snackPMService = snackPM ?? null;
    const dinnerService = dinner ?? null;
    const snackNightService = snackNight ?? null;

    // Constantes para servicios adicionales PACNA
    const dinnerExtendedService = formValues.dinnerExtended ?? null;
    const dinnerAtRiskService = formValues.dinnerAtRisk ?? null;
    const snackExtendedService = formValues.snackExtended ?? null;
    const snackAtRiskService = formValues.snackAtRisk ?? null;

    // Crear SiteServiceRequest
    const siteServiceRequest: SiteServiceRequest = {
      childGroupId: null, // Servicio general

      // Servicios básicos
      breakfast: breakfastService,
      breakfastFrom: breakfastFrom ?? null,
      breakfastTo: breakfastTo ?? null,

      lunch: lunchService,
      lunchFrom: lunchFrom ?? null,
      lunchTo: lunchTo ?? null,

      snackAM: snackAMService,
      snackAMFrom: snackAMFrom ?? null,
      snackAMTo: snackAMTo ?? null,

      dinner: dinnerService,
      dinnerFrom: dinnerFrom ?? null,
      dinnerTo: dinnerTo ?? null,

      snackPM: snackPMService,
      snackPMFrom: snackPMFrom ?? null,
      snackPMTo: snackPMTo ?? null,

      snackNight: snackNightService,
      snackNightFrom: snackNightFrom ?? null,
      snackNightTo: snackNightTo ?? null,

      // Servicios adicionales para PACNA
      dinnerExtended: dinnerExtendedService,
      dinnerExtendedFrom: dinnerExtendedFrom ?? null,
      dinnerExtendedTo: dinnerExtendedTo ?? null,

      dinnerAtRisk: dinnerAtRiskService,
      dinnerAtRiskFrom: dinnerAtRiskFrom ?? null,
      dinnerAtRiskTo: dinnerAtRiskTo ?? null,

      snackExtended: snackExtendedService,
      snackExtendedFrom: snackExtendedFrom ?? null,
      snackExtendedTo: snackExtendedTo ?? null,

      snackAtRisk: snackAtRiskService,
      snackAtRiskFrom: snackAtRiskFrom ?? null,
      snackAtRiskTo: snackAtRiskTo ?? null,
    };

    // Agregar servicios al SiteRequest
    if (formValues.offersServiceToDifferentGroups && this.servicesByGroups.length > 0) {
      // Si ofrece servicios a diferentes grupos, crear múltiples servicios (uno por grupo)
      siteRequest.services = this.servicesByGroups.map((serviceData) => {
        const serviceRequest: SiteServiceRequest = {
          siteId: this.param.id, // ID del sitio existente
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
        return serviceRequest;
      });
    } else {
      // Servicio general (sin grupos específicos)
      siteRequest.services = [siteServiceRequest];
    }

    // Agregar grupos de niños si OffersServiceToDifferentGroups = true
    if (formValues.offersServiceToDifferentGroups && this.childGroups.length > 0) {
      siteRequest.childGroups = this.childGroups;
    }

    // Agregar información de Day Care Home
    if (this.isDayCareHome) {
      siteRequest.dayCareHome = {
        siteId: this.param.id, // ID del sitio existente
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
        administratorBirthDate: formValues.administratorBirthDate ?? null,
        offersServiceToDifferentGroups: formValues.offersServiceToDifferentGroups ?? null,
      };
    }

    this.isLoading = true;
    this.headerConfig.formGroup.disable();

    this._siteService.updateSite(siteRequest, {}).subscribe({
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
    this._customRouter.navigate(['sites/list']);
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

  // Método para obtener tipos de cocina según el tipo de grupo seleccionado
  // Get kitchen types by group type
  getKitchenTypesByGroupType(groupType: OptionSelection): void {
    if (!groupType) {
      this.kitchenTypes = [];
      this.isKitchenTypeDisabled = false; // Mantener habilitado
      return;
    }

    // Para TODOS los tipos de grupo, usar la API para obtener los tipos de cocina válidos
    this.isKitchenTypeDisabled = false;

    const queryParameters: QueryParameters = {
      groupTypeId: groupType.id,
    };

    this._kitchenTypeService.getKitchenTypesByGroupType(queryParameters).subscribe({
      next: (response) => {
        if (response) {
          this.kitchenTypes = response.body;

          // Determinar si el tipo de grupo es "Comedor" o "Satélite" dentro del callback
          const isComedor = groupType.name === 'Comedor' || groupType.nameEN === 'Dining Room';
          const isSatelite = groupType.name === 'Satélite' || groupType.nameEN === 'Satellite';

          // Si NO es "Comedor" ni "Satélite", auto-seleccionar "N/A"
          if (!isComedor && !isSatelite) {
            const naKitchenType = this.kitchenTypes.find((kt) => kt.name === 'N/A' || kt.nameEN === 'N/A');

            if (naKitchenType) {
              this.headerConfig.formGroup.patchValue({ kitchenType: naKitchenType });
            }
          } else {
            // Para "Comedor" y "Satélite", limpiar la selección para que el usuario elija
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

          // Validar que el tipo de área esté en la lista disponible
          const validAreaType = this.areaTypes.find(at => at.id === areaType.id);
          if (validAreaType) {
            this.headerConfig.formGroup.patchValue({ areaType: validAreaType });
            // Mantener el campo deshabilitado después del patchValue
            this.headerConfig.formGroup.get('areaType')?.disable();
            this._changeDetectorRef.detectChanges();
          } else {
            console.warn('Tipo de área obtenido no está en la lista disponible:', areaType);
            // Intentar encontrar por nombre como fallback
            const fallbackAreaType = this.areaTypes.find(at =>
              at.name === areaType.name || at.nameEN === areaType.nameEN
            );
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
  onClearMainSite() {
    this.headerConfig.formGroup.get('mainSite').setValue(null);
  }

  /**
   * Edita un elemento de la tabla
   * Edits an element of the table
   */
  onTableEditElement(event: Event, element: any) {
    event.stopPropagation();
    event.preventDefault();
    this._customRouterService.navigate([`sites/edit/${element.satelliteSiteId}`]);
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
   * Maneja el cambio del campo "¿Ofrece servicio a diferentes grupos de niños?"
   */
  onOffersServiceToDifferentGroupsChange(checked: boolean): void {
    this.showDifferentGroupsFields = checked;
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
  }

  /**
   * Convierte el objeto groupType a la clave usada en la configuración
   */
  private getGroupTypeKey(groupType: any): string {
    if (!groupType) return '';

    // Usar directamente el nombre del groupType
    return groupType.name || groupType.nameEN || '';
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
   * Actualiza los programas activos basado en los checkboxes de desarrollo
   */
  private updateDevPrograms(): void {
    // Actualizar validaciones y campos visibles
    this.updateValidations();
    this._changeDetectorRef.detectChanges();
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
}
