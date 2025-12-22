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
import { GroupTypeService } from 'app/shared/services/group-type.service';
import { KitchenTypeService } from 'app/shared/services/kitchen-type.service';
import { DeliveryType } from 'app/shared/models/DeliveryType';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { OrganizationType } from 'app/shared/models/OrganizationType';
import { AuthService } from 'app/core/auth/auth.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { AreaTypeService } from 'app/shared/services/area-type.service';
import { AreaType } from 'app/shared/models/AreaType';
import { DayOfWeekResponse } from 'app/shared/models/DayOfWeekResponse';
import { AgencyService } from 'app/shared/services/agency.service';
import { PermissionRequestDialogComponent } from '../../../../shared/components/permission-request-dialog/permission-request-dialog.component';
import { PermissionRequestFormDialogComponent } from '../../../../shared/components/permission-request-form-dialog/permission-request-form-dialog.component';

import { FieldVisibilityService } from 'app/shared/services/field-visibility.service';
import { PROGRAM_IDS } from 'app/shared/const';
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
import { DateCalculationsUtil } from 'app/shared/utils/date-calculations.util';
import { TimeValidationUtil, ServiceConfig } from 'app/shared/utils/time-validation.util';
import { SiteStatusModalComponent, SiteStatusModalData } from 'app/shared/components/site-status-modal/site-status-modal.component';

@Component({
  selector: 'app-sites-psav-add',
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
    LongitudeDirective
],
})
export class AddSitePsavComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _formBuilder = inject(UntypedFormBuilder);
  private _siteService = inject(SiteService);
  private _geoService = inject(GeoService);
  private _notificationService = inject(NotificationService);
  private _translocoService = inject(TranslocoService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _authService = inject(AuthService);
  private _agencyService = inject(AgencyService);
  private _groupTypeService = inject(GroupTypeService);
  private _kitchenTypeService = inject(KitchenTypeService);
  private _areaTypeService = inject(AreaTypeService);
  private _route = inject(ActivatedRoute);
  private _dialog = inject(MatDialog);
  private _fieldVisibilityService = inject(FieldVisibilityService);
  private _customRouterService = inject(CustomRouterService);

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

  // Tipo de entrega
  // Delivery type
  deliveryTypes: DeliveryType[] = [];

  // Tipo de solicitante
  // Type of applicant
  typeOfApplicant: OptionSelection[] = [];

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
      // Tipo de organización - Campo requerido para clasificación del sitio
      // Organization type - Required field for site classification
      organizationType: [null, Validators.required],
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
      // Disponibilidad de almacén - Indica si el sitio tiene instalaciones de almacenamiento
      // Warehouse availability - Indicates if site has storage facilities
      hasWarehouse: [null],
      // Disponibilidad de comedor - Indica si el sitio tiene instalaciones de comedor
      // Dining room availability - Indicates if site has dining facilities
      hasDiningRoom: [null],
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
      // Comunidad
      // Community
      community: [null, Validators.required],
      // Caminantes / Walkers
      // Walkers
      walkers: [null, Validators.required],
      // Tipo de sitio / Site type
      // Site type
      siteType: [null, Validators.required],
      // Experiencia / Experience
      // Experience
      experience: [null, Validators.required],
      // Cena (si, no)
      // Dinner (yes, no)
      dinner: [false],
      // Horario desde para la cena
      // Dinner schedule from
      dinnerFrom: [null],
      // Horario hasta para la cena
      // Dinner schedule to
      dinnerTo: [null],
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
      // Matrícula General
      // General Enrollment
      generalEnrollment: [null, [Validators.pattern(/^\d+$/)]],

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



  // Opciones de hora para los campos "hasta" - se filtran dinámicamente
  timeOptions: TimeOption[] = [];

  // Días de la semana disponibles para selección (filtrados según programa)
  // Available days of the week for selection (filtered by program)
  // Días de la semana disponibles para selección (filtrados según programa)
  // Available days of the week for selection (filtered by program)
  // Se cargan desde el backend, no hardcodeados
  availableDaysOfWeek: DayOfWeekResponse[] = [];

  // School-related properties
  schoolId: number | null = null;


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


    // Verificar si hay schoolId en query parameters
    this._route.queryParams.subscribe(params => {
      if (params['schoolId']) {
        this.schoolId = +params['schoolId'];
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
      this.typeOfApplicant = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'typeOfApplicant');
      this.community = this.sortOptionsAlphabetically(
        resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'community')
      );
      this.walkers = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'walkers');
      this.distributionType = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'distributionType');
      this.siteType = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'siteType');

      this.experience = this.sortOptionsAlphabetically(
        resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'experience')
      );

      this.siteLocations = resolvedData.siteLocations || [];

      // Catálogos
      this.organizationTypes = resolvedData.organizationTypes;
      this.kitchenTypes = resolvedData.kitchenTypes;
      this.groupTypes = resolvedData.groupTypes;

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

    // Actualizar validaciones de distributionType inicialmente
    this.updateDistributionTypeValidation();

    this.setupFormListeners();

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
      DateCalculationsUtil.calculateOperatingDays(this.headerConfig.formGroup);
    });

    this.headerConfig.formGroup.get('operatingToDate')?.valueChanges.subscribe(() => {
      DateCalculationsUtil.calculateOperatingDays(this.headerConfig.formGroup);
    });

    // Suscribirse a cambios en operatingStartTime y operatingEndTime para revalidar servicios
    this.headerConfig.formGroup.get('operatingStartTime')?.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.revalidateAllServiceTimes();
      });

    this.headerConfig.formGroup.get('operatingEndTime')?.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.revalidateAllServiceTimes();
      });

    // Listener para cambios en groupType que afectan distributionType, siteLocation y kitchenType
    this.headerConfig.formGroup.get('groupType')?.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((groupType) => {
        this.updateDistributionTypeValidation();
        this.getSiteLocationByGroupType(groupType);
        // Actualizar tipos de cocina según el grupo seleccionado
        this.getKitchenTypesByGroupType(groupType);
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

  /**
   * Obtiene las opciones filtradas para un campo "hasta" basado en la hora "desde"
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
      'operatingStartTime',
      'operatingEndTime',
      this._changeDetectorRef,
      (disabled) => { this.headerConfig.submitDisabled = disabled; }
    );
  }

  /**
   * Revalida todos los campos de hora de servicios cuando cambian las horas de funcionamiento
   */
  private revalidateAllServiceTimes(): void {
    const services: ServiceConfig[] = [
      { service: 'breakfast', from: 'breakfastFrom', to: 'breakfastTo' },
      { service: 'lunch', from: 'lunchFrom', to: 'lunchTo' },
      { service: 'snackAM', from: 'snackAMFrom', to: 'snackAMTo' },
      { service: 'snackPM', from: 'snackPMFrom', to: 'snackPMTo' },
      { service: 'dinner', from: 'dinnerFrom', to: 'dinnerTo' },
    ];

    TimeValidationUtil.revalidateAllServiceTimes(
      this.headerConfig.formGroup,
      services,
      (serviceValue, fromControl, toControl) => {
        this.updateServiceTimeValidations(serviceValue, fromControl, toControl);
      }
    );
  }

  // Manejar cambio de non-profit
  nonProfitChange(): void {
    // PSAV no requiere validación especial de non-profit
  }



  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
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
    // Tipo de solicitante
    // Laico (15), Base de fe (16)
    const applicantTypeId: number = formValues.typeOfApplicant?.id;

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

    // Validar operatingDaysOfWeek - debe ser un array no vacío
    const operatingDaysOfWeek: number[] = formValues.operatingDaysOfWeek;
    if (!operatingDaysOfWeek || operatingDaysOfWeek.length === 0) {
      this._notificationService.showError('Por favor, seleccione al menos un día de la semana de funcionamiento');
      this.headerConfig.formGroup.get('operatingDaysOfWeek')?.markAsTouched();
      return;
    }

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
      // Fechas de funcionamiento - Fechas desde y hasta cuando opera el sitio
      // Operating dates - Dates from and to when the site operates
      operatingFromDate: operatingFromDate ?? null,
      operatingToDate: operatingToDate ?? null,
      operatingDaysCalculated: operatingDaysCalculated ?? null,
      // Días de la semana en que opera el sitio
      // Days of the week the site operates
      operatingDaysOfWeek: operatingDaysOfWeek,
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
      // Tipo de solicitante - Campo requerido para clasificación
      // Applicant type - Required field for classification
      applicantTypeId: applicantTypeId,
      // Tipo de área - Campo requerido para clasificación
      // Type of area - Required field for classification
      areaTypeId: areaTypeId,
      // Tipo de localización - Campo requerido para clasificación
      // Location type - Required field for classification
      locationTypeId: locationTypeId,
      // Información Adicional / Additional Information
      // Sin fines de lucro - Indicador de organización
      // Non-profit - Organization indicator
      nonProfit: formValues.nonProfit ?? null,
      // Tiene almacén - Indicador de infraestructura
      // Has warehouse - Infrastructure indicator
      hasWarehouse: formValues.hasWarehouse ?? null,
      // Tiene comedor - Indicador de infraestructura
      // Has dining room - Infrastructure indicator
      hasDiningRoom: formValues.hasDiningRoom ?? null,
      // Persona a Cargo
      // Person in Charge
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
    };

    // Validar y limpiar el servicio antes de agregarlo
    const cleanedServiceRequest = validateAndCleanSiteService(siteServiceRequest);

    // Agregar servicios al SiteRequest
    siteRequest.services = [cleanedServiceRequest];


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
                  this._customRouterService.navigate(['schools']);
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
      // Si no hay grupo seleccionado, limpiar y deshabilitar
      this.kitchenTypes = [];
      this.headerConfig.formGroup.patchValue({ kitchenType: null });
      kitchenTypeControl?.disable();
      this._changeDetectorRef.detectChanges();
      return;
    }

    // Verificar si es "Comedor" - solo cargar tipos de cocina para Comedor
    const isComedor = groupType.name === 'Comedor' || groupType.nameEN === 'Dining Room';

    if (!isComedor) {
      // Si no es "Comedor", limpiar el valor y las opciones, y deshabilitar
      this.kitchenTypes = [];
      this.headerConfig.formGroup.patchValue({ kitchenType: null });
      kitchenTypeControl?.disable();
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
   * Verifica si se debe mostrar el campo de Tipo de Cocina
   * Para PSAV siempre se muestra si el grupo es "Comedor"
   */
  get shouldShowKitchenTypeField(): boolean {
    // PSAV siempre puede mostrar kitchenType si el grupo es "Comedor"

    // Verificar si el Tipo de Grupo seleccionado es "Comedor"
    const groupType = this.headerConfig.formGroup.get('groupType')?.value;
    if (groupType) {
      const isComedor = groupType.name === 'Comedor' || groupType.nameEN === 'Dining Room';
      return isComedor;
    }

    return false;
  }

}
