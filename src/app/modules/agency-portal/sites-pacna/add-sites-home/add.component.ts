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
import {
  compare,
  compareById,
  comparePostal,
  isNullOrUndefinedEmptyStringNullArray,
  toTimeString,
  logFormValidationErrors,
  generateTimeOptions,
  filterEndTimeOptions,
  filterStartTimeOptions,
  getEndTimeOptions,
  timeStringToDate,
  dateToTimeString,
  timeToMinutes,
  dateToMinutes,
  compareByTime,
  TimeOption
} from 'app/shared/utils';
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
import { DayOfWeekResponse } from 'app/shared/models/DayOfWeekResponse';
import { AgencyService } from 'app/shared/services/agency.service';
import { PROGRAM_IDS, isPDAMProgram } from 'app/shared/const';
import { CfrInfoDialogComponent } from 'app/shared/components/cfr-info-dialog/cfr-info-dialog.component';

import { FieldVisibilityService } from 'app/shared/services/field-visibility.service';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { GenericTableConfig, OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';

import { MatTableDataSource } from '@angular/material/table';
import { NumericOnlyDirective } from 'app/shared/directives/numeric-only.directive';
import { PhoneFormatDirective } from 'app/shared/directives/phone-format.directive';
import { DynamicGridDirective } from 'app/shared/directives/dynamic-grid.directive';
import { puertoRicoPhoneValidator } from 'app/shared/validators/puerto-rico-phone.validator';
import { puertoRicoZipCodeValidator } from 'app/shared/validators/puerto-rico-zip-code.validator';
import { operatingHoursRangeValidator } from 'app/shared/validators/operating-hours-range.validator';
import { PuertoRicoZipCodeDirective } from 'app/shared/directives/puerto-rico-zip-code.directive';
import { LatitudeDirective } from 'app/shared/directives/latitude.directive';
import { LongitudeDirective } from 'app/shared/directives/longitude.directive';
import { validateAndCleanSiteService } from 'app/shared/utils/site-service-validator';
import { SiteStatusModalComponent, SiteStatusModalData } from 'app/shared/components/site-status-modal/site-status-modal.component';
import { AddServiceByGroupModalComponent, ServiceByGroupDialogData } from 'app/shared/components/add-service-by-group-modal/add-service-by-group-modal.component';
import { SERVICES_COLUMNS_SCHEMA } from 'app/shared/components/add-service-by-group-modal/services-columns-schema';
import { DateCalculationsUtil } from 'app/shared/utils/date-calculations.util';
import { TimeValidationUtil, ServiceConfig } from 'app/shared/utils/time-validation.util';
import { FieldVisibilityUtil } from 'app/shared/utils/field-visibility.util';

@Component({
  selector: 'app-add-sites-home',
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
export class AddSitePacnaHomeComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers, OnGenericTableHandler {
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
  private _areaTypeService = inject(AreaTypeService);
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


  // Tipo de área
  // Type of area
  areaTypes: AreaType[] = [];

  // Tipo de localización
  // Type of location
  locationTypes: AreaType[] = [];


  // Comunidad
  // Community
  community: OptionSelection[] = [];

  // Caminantes / Walkers
  // Walkers
  walkers: OptionSelection[] = [];


  // Tipo de sitio / Site type
  // Site type
  siteType: OptionSelection[] = [];

  // Experiencia / Experience
  // Experience
  experience: OptionSelection[] = [];

  // Lenguaje actual
  currentLang: string = 'es';


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
      // Persona a Cargo (Day Care Home)
      // Person in Charge (Day Care Home)
      personInCharge: this._formBuilder.group({
        firstName: ['', Validators.required],
        middleName: [''],
        fatherLastName: ['', Validators.required],
        motherLastName: [''],
        birthDate: [null, Validators.required],
        sitePhone: ['', [Validators.required, puertoRicoPhoneValidator()]],
        extension: [''],
        mobilePhone: ['', puertoRicoPhoneValidator()],
      }),
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
      // Merienda AM (si, no)
      // Snack AM (yes, no)
      snackAM: [false],
      // Horario desde para la merienda AM
      // Snack AM schedule from
      snackAMFrom: [null],
      // Horario hasta para la merienda AM
      // Snack AM schedule to
      snackAMTo: [null],
      // Merienda PM (si, no)
      // Snack PM (yes, no)
      snackPM: [false],
      // Horario desde para la merienda PM
      // Snack PM schedule from
      snackPMFrom: [null],
      // Horario hasta para la merienda PM
      // Snack PM schedule to
      snackPMTo: [null],
      // Cena (si, no)
      // Dinner (yes, no)
      dinner: [false],
      // Horario desde para la cena
      // Dinner schedule from
      dinnerFrom: [null],
      // Horario hasta para la cena
      // Dinner schedule to
      dinnerTo: [null],
      // Merienda nocturna (si, no)
      // Snack night (yes, no)
      snackNight: [false],
      // Horario desde para la merienda nocturna
      // Snack night schedule from
      snackNightFrom: [null],
      // Horario hasta para la merienda nocturna
      // Snack night schedule to
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

      // Fecha desde que opera el sitio
      // Date from which the site operates
      operatingFromDate: [null, Validators.required],
      // Fecha hasta que opera el sitio
      // Date until which the site operates
      operatingToDate: [null, Validators.required],
      // Días calculados automáticamente
      // Calculated days (automatically calculated)
      operatingDaysCalculated: [{ value: null, disabled: true }],
      // Días de la semana en que opera el sitio (selección múltiple)
      // Days of the week the site operates (multiple selection)
      operatingDaysOfWeek: [[], Validators.required],
      // Hora de inicio de funcionamiento
      // Operating start time
      operatingStartTime: [null, Validators.required],
      // Hora de fin de funcionamiento
      // Operating end time
      operatingEndTime: [null, Validators.required],

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
  agency: Agency = null;


  // Propiedades para controlar visibilidad según programa
  isPDAM: boolean = false;
  isPSAV: boolean = false;
  isPACNA: boolean = false;
  isPFHF: boolean = false;
  isPDFE: boolean = false;
  isAESAN: boolean = false;


  // Propiedad para controlar visibilidad cuando es Day Care Home
  isDayCareHome: boolean = false;
  isDayCareHomeId: number | null = null;
  showDifferentGroupsFields: boolean = false;

  // Opciones de hora para los campos "hasta" - se filtran dinámicamente
  timeOptions: TimeOption[] = [];

  // Días de la semana disponibles para selección (filtrados según programa)
  // Available days of the week for selection (filtered by program)
  // Se cargan desde el backend, no hardcodeados
  availableDaysOfWeek: DayOfWeekResponse[] = [];

  // School-related properties
  schoolId: number | null = null;
  childGroups: SiteChildGroupRequest[] = [];
  nextGroupNumber: number = 1;

  // Tabla de servicios por grupos
  servicesTableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<any>(),
    columnsSchema: SERVICES_COLUMNS_SCHEMA,
    displayedColumns: SERVICES_COLUMNS_SCHEMA.map((col) => col.key as string),
    addMenuShow: true,
    addMenuItems: [
      {
        id: 'add',
        label: 'sites.add.services.add-service',
      },
    ],
    handler: this,
    showPaginator: true,
    pageSizeOptions: [5, 10, 25, 50],
    pageSize: 10,
    fullScreen: true,
  };

  // Lista de servicios por grupos (en memoria hasta el envío)
  servicesByGroups: ServiceByGroupDialogData[] = [];

  // Configuración de tabla requerida por OnGenericTableHandler
  tableConfig: GenericTableConfig = this.servicesTableConfig;


  /**
   * Determina si se deben mostrar campos adicionales para diferentes grupos
   */
  shouldShowDifferentGroupsFields(): boolean {
    return this.showDifferentGroupsFields;
  }

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
    // Combinar datos de resolvers comunes y específicos del programa
    const commonData = this._route.snapshot.data['commonData'];
    const programData = this._route.snapshot.data['programData'];
    const resolvedData = commonData && programData ? { ...commonData, ...programData } : null;

    if (resolvedData) {
      // Yes No Options
      this.yesNoOptions = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'yesNo');
      // Estatus Options
      this.isActiveOptions = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'isActive');
      this.community = this.sortOptionsAlphabetically(
        resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'community')
      );
      this.relationshipTypeOptions = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'relationshipType');
      this.homeTypeOptions = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'homeType');
      this.participantTypeOptions = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'participantType');
      this.walkers = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'walkers');
      this.siteType = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'siteType');
      this.experience = this.sortOptionsAlphabetically(
        resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'experience')
      );
      this.listCities = resolvedData.cities;
      this.listRegions = resolvedData.regions;
      this.areaTypes = resolvedData.areaTypes;
      this.locationTypes = resolvedData.areaTypes; // Usar los mismos valores que AreaType

      // Cargar días permitidos desde el resolver
      this.availableDaysOfWeek = resolvedData.allowedOperatingDays || [];

      this._changeDetectorRef.markForCheck();
    }

    // Obtener datos de la agencia desde el resolver padre
    // Los datos ya están disponibles desde initialDataAgencyPortalResolver
    const parentData = this._route.parent?.snapshot.data['initialData'];
    const agencyFromResolver = parentData?.agency;

    if (agencyFromResolver) {
      this.agency = agencyFromResolver;
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

      // Configurar validaciones y listeners
      this.updateValidations();
    }

    // Transloco
    this._translocoService.langChanges$.pipe(takeUntil(this._unsubscribeAll)).subscribe((lang: string) => {
      this.currentLang = lang;
      this.community = this.sortOptionsAlphabetically(this.community);
      this.experience = this.sortOptionsAlphabetically(this.experience);
    });

    this.setupFormListeners();

    // Escuchar cambios en las fechas para calcular automáticamente los días
    this.headerConfig.formGroup.get('operatingFromDate')?.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        DateCalculationsUtil.calculateOperatingDays(this.headerConfig.formGroup);
      });

    this.headerConfig.formGroup.get('operatingToDate')?.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        DateCalculationsUtil.calculateOperatingDays(this.headerConfig.formGroup);
      });

    // Suscribirse a cambios de validación del formulario para actualizar el estado del botón de guardar
    this.headerConfig.formGroup.statusChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;
        this._changeDetectorRef.detectChanges();
      });
  }

  private setupFormListeners(): void {
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

        // Suscribirse a cambios en "Hora desde" para validar y ajustar "Hora hasta"
        fromControl.valueChanges
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe(() => {
            TimeValidationUtil.validateAndAdjustTimeRange(fromControl, toControl);
            TimeValidationUtil.validateTimeRange(fromControl, toControl);
            // Forzar detección de cambios para actualizar las opciones en el template
            this._changeDetectorRef.detectChanges();
          });

        // Suscribirse a cambios en "Hora hasta" para validar y ajustar si es necesario
        toControl.valueChanges
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe(() => {
            TimeValidationUtil.validateAndAdjustTimeRange(fromControl, toControl);
            TimeValidationUtil.validateTimeRange(fromControl, toControl);
          });
      }
    });
  }

  /**
   * Genera todas las opciones de hora (cada 30 minutos)
   */
  private initializeTimeOptions(): void {
    this.timeOptions = generateTimeOptions();
  }

  /**
   * Obtiene las opciones filtradas para un campo "hasta" basado en la hora "desde"
   */
  /**
   * Obtiene las opciones filtradas para un campo "desde" basado en las horas de funcionamiento
   */
  getStartTimeOptions(): TimeOption[] {
    const operatingStartTime = this.headerConfig.formGroup.get('operatingStartTime')?.value;
    const operatingEndTime = this.headerConfig.formGroup.get('operatingEndTime')?.value;

    return filterStartTimeOptions(
      this.timeOptions,
      operatingStartTime,
      operatingEndTime
    );
  }

  getEndTimeOptions(fromField: string): TimeOption[] {
    const fromControl = this.headerConfig.formGroup.get(fromField);
    if (!fromControl) return this.timeOptions;

    const fromTime = fromControl.value;

    return getEndTimeOptions(
      this.timeOptions,
      fromTime,
      '23:59',
      null,
      null
    );
  }

  /**
   * Convierte string HH:mm a objeto Date (wrapper para usar en template)
   */
  timeStringToDateWrapper(timeString: string): Date | null {
    return timeStringToDate(timeString);
  }


  /**
   * Verifica si un campo de hora "hasta" es inválido (menor o igual a "desde")
   */
  isEndTimeInvalid(fromField: string, toField: string): boolean {
    const fromControl = this.headerConfig.formGroup.get(fromField);
    const toControl = this.headerConfig.formGroup.get(toField);

    if (!fromControl || !toControl) return false;

    const fromTime = fromControl.value;
    const toTime = toControl.value;

    if (!fromTime || !toTime) return false;

    const fromMinutes = dateToMinutes(fromTime);
    const toMinutes = dateToMinutes(toTime);

    return toMinutes <= fromMinutes;
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
    TimeValidationUtil.updateServiceTimeValidations(
      this.headerConfig.formGroup,
      serviceValue,
      fromControl,
      toControl,
      null,
      null,
      this._changeDetectorRef,
      (disabled) => { this.headerConfig.submitDisabled = disabled; }
    );
  }



  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }



  private updateValidations(): void {
    // Este formulario es exclusivo para Day Care Home, configurar validaciones requeridas
    const requiredFields = {
      name: [Validators.required],
      address: [Validators.required],
      city: [Validators.required],
      region: [Validators.required],
      zipCode: [Validators.required, puertoRicoZipCodeValidator()],
      latitude: [Validators.required],
      longitude: [Validators.required],
      postalAddress: [Validators.required],
      postalCity: [Validators.required],
      postalRegion: [Validators.required],
      postalZipCode: [Validators.required, puertoRicoZipCodeValidator()],
      areaType: [Validators.required],
      locationType: [Validators.required],
      // Campos específicos de Day Care Home
      isAuthorizedToOperate: [Validators.required],
      hasFamilyDepartmentLicense: [Validators.required],
      numberOfEnrolledChildren: [Validators.required],
      numberOfProviderChildren: [Validators.required],
      numberOfParticipantsWithBloodTies: [Validators.required],
      numberOfParticipantsWithoutBloodTies: [Validators.required],
      minorsLiveWithProvider: [Validators.required],
      relationshipType: [Validators.required],
      offersServiceToImmigrantChildren: [Validators.required],
      homeType: [Validators.required],
    };

    Object.keys(requiredFields).forEach((fieldName) => {
      const control = this.headerConfig.formGroup.get(fieldName);
      if (control) {
        control.setValidators(requiredFields[fieldName]);
        control.updateValueAndValidity();
      }
    });

    // Configurar validaciones de personInCharge
    this.updatePersonInChargeValidations();
  }


  /**
   * Actualiza las validaciones de personInCharge para Day Care Home
   */
  private updatePersonInChargeValidations(): void {
    const personInChargeGroup = this.headerConfig.formGroup.get('personInCharge') as FormGroup;

    if (!personInChargeGroup) {
      return;
    }

    // Configurar validaciones requeridas para Day Care Home
    const firstNameControl = personInChargeGroup.get('firstName');
    const fatherLastNameControl = personInChargeGroup.get('fatherLastName');
    const birthDateControl = personInChargeGroup.get('birthDate');
    const sitePhoneControl = personInChargeGroup.get('sitePhone');
    const mobilePhoneControl = personInChargeGroup.get('mobilePhone');

    if (firstNameControl) {
      firstNameControl.setValidators([Validators.required]);
      firstNameControl.updateValueAndValidity();
    }

    if (fatherLastNameControl) {
      fatherLastNameControl.setValidators([Validators.required]);
      fatherLastNameControl.updateValueAndValidity();
    }

    if (birthDateControl) {
      birthDateControl.setValidators([Validators.required]);
      birthDateControl.updateValueAndValidity();
    }

    if (sitePhoneControl) {
      sitePhoneControl.setValidators([Validators.required, puertoRicoPhoneValidator()]);
      sitePhoneControl.updateValueAndValidity();
    }

    // mobilePhone solo tiene validación de formato, no requerido
    if (mobilePhoneControl) {
      mobilePhoneControl.setValidators([puertoRicoPhoneValidator()]);
      mobilePhoneControl.updateValueAndValidity();
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

    // Tipo de área
    const areaTypeId: number = formValues.areaType?.id;

    // Tipo de localización
    const locationTypeId: number = formValues.locationType?.id;

    // Días de operación
    const operatingDaysCalculated: number = formValues.operatingDaysCalculated;
    // Obtener los días permitidos de la agencia
    const operatingDaysOfWeekIds: number[] = formValues.operatingDaysOfWeek?.map((day: DayOfWeekResponse) => day.id) || [];
    // Horas de funcionamiento
    const operatingStartTime: string | null = toTimeString(formValues.operatingStartTime);
    const operatingEndTime: string | null = toTimeString(formValues.operatingEndTime);

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
      // Tipo de área - Campo requerido para clasificación
      // Type of area - Required field for classification
      areaTypeId: areaTypeId,
      // Tipo de localización - Campo requerido para clasificación
      // Location type - Required field for classification
      locationTypeId: locationTypeId,
      // Fechas de funcionamiento
      // Operating dates
      operatingFromDate: formValues.operatingFromDate ?? null,
      operatingToDate: formValues.operatingToDate ?? null,
      operatingDaysCalculated: operatingDaysCalculated ?? null,
      // Días de la semana en que opera el sitio
      // Days of the week the site operates
      operatingDaysOfWeek: operatingDaysOfWeekIds,
      // Horas de funcionamiento - Horas de inicio y fin para los días de funcionamiento
      // Operating hours - Start and end times for operating days
      operatingStartTime: operatingStartTime ?? null,
      operatingEndTime: operatingEndTime ?? null,
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
    // Este formulario es exclusivo para Day Care Home
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
      administratorBirthDate: formValues.personInCharge?.birthDate ?? null,
      offersServiceToDifferentGroups: formValues.offersServiceToDifferentGroups ?? null,
    };

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
    // Este componente es específico para PACNA
    return ['sites-pacna'];
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



  // ===== MÉTODOS PARA DESARROLLO - CONTROL MANUAL DE PROGRAMAS =====

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
  /**
   * Maneja las acciones del menú de agregar
   */
  onAddMenuAction(menuItemId: string): void {
    if (menuItemId === 'add') {
      this.onTableAdd();
    }
  }

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




}
