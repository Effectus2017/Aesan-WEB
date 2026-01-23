import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
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
import { SiteServiceRequest } from 'app/shared/models/Request/SiteServiceRequest';
import { SiteEducationLevelRequest } from 'app/shared/models/Request/SiteEducationLevelRequest';
import { SiteChildGroupRequest } from 'app/shared/models/Request/SiteChildGroupRequest';
import { AuthService } from 'app/core/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
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
  TimeOption
} from 'app/shared/utils';
import { Site } from 'app/shared/models/Site';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { NotificationService } from 'app/shared/services/notification.service';
import { GenericTableConfig, OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { MatTableDataSource } from '@angular/material/table';
import { SATELLITE_SCHOOLS_COLUMNS_SCHEMA } from './columns-schema';
import { SERVICES_COLUMNS_SCHEMA } from '../../../../shared/components/add-service-by-group-modal/services-columns-schema';
import { AddServiceByGroupModalComponent, ServiceByGroupDialogData } from '../../../../shared/components/add-service-by-group-modal/add-service-by-group-modal.component';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { AreaType } from 'app/shared/models/AreaType';
import { DayOfWeekResponse } from 'app/shared/models/DayOfWeekResponse';
import { MatDialog } from '@angular/material/dialog';
import { AreaTypeService } from 'app/shared/services/area-type.service';
import { AgencyService } from 'app/shared/services/agency.service';
import { Agency } from 'app/shared/models/Agency';
import { NumericOnlyDirective } from 'app/shared/directives/numeric-only.directive';
import { PhoneFormatDirective } from 'app/shared/directives/phone-format.directive';
import { SiteStatusModalComponent, SiteStatusModalData } from 'app/shared/components/site-status-modal/site-status-modal.component';

import { puertoRicoPhoneValidator } from 'app/shared/validators/puerto-rico-phone.validator';
import { puertoRicoZipCodeValidator } from 'app/shared/validators/puerto-rico-zip-code.validator';
import { operatingHoursRangeValidator } from 'app/shared/validators/operating-hours-range.validator';
import { PuertoRicoZipCodeDirective } from 'app/shared/directives/puerto-rico-zip-code.directive';
import { LatitudeDirective } from 'app/shared/directives/latitude.directive';
import { LongitudeDirective } from 'app/shared/directives/longitude.directive';
import { validateAndCleanSiteService } from 'app/shared/utils/site-service-validator';
import { DateCalculationsUtil } from 'app/shared/utils/date-calculations.util';
import { TimeValidationUtil } from 'app/shared/utils/time-validation.util';

@Component({
  selector: 'app-edit-sites-home',
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
    LongitudeDirective
],
})
export class EditSitePacnaHomeComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers, OnGenericTableHandler {
  // Subject para suscribirse a todos los observables al destruir el componente
  // Subject to unsubscribe from all observables on component destroy
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // Inyección de dependencias y servicios
  // Dependency injection and services
  private _formBuilder = inject(UntypedFormBuilder);
  private _siteService = inject(SiteService);
  private _geoService = inject(GeoService);
  private _customRouter = inject(CustomRouterService);
  private _translocoService = inject(TranslocoService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _areaTypeService = inject(AreaTypeService);
  private _authService = inject(AuthService);
  private _route = inject(ActivatedRoute);
  private _notificationService = inject(NotificationService);
  private _customRouterService = inject(CustomRouterService);
  private _agencyService = inject(AgencyService);
  private _dialog = inject(MatDialog);

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

  // Estatus
  // Status
  isActive: OptionSelection[] = [];

  // Lista de sitios
  // List of sites

  isDayCareHome: boolean = false;
  isDayCareHomeId: number | null = null;


  // Propiedades para manejar grupos de niños específicos
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
        icon: 'mat_outline:add',
      },
    ],
    handler: this,
    showPaginator: true,
    pageSizeOptions: [5, 10, 25, 50],
    pageSize: 10,
    fullScreen: false,
    viewMode: 'cards'
  };

  // Lista de servicios por grupos (en memoria hasta el envío)
  servicesByGroups: ServiceByGroupDialogData[] = [];

  // Configuración de tabla requerida por OnGenericTableHandler
  tableConfig: GenericTableConfig = this.servicesTableConfig;


  /**
   * Determina si se deben mostrar campos adicionales para diferentes grupos
   * Se muestra cuando:
   * 1. Es Day Care Home y offersServiceToDifferentGroups es true, O
   * 2. Tiene salón comedor y la capacidad es menor que la matrícula general
   */
  shouldShowDifferentGroupsFields(): boolean {
    return true; // Tabla siempre habilitada
  }


  currentLang: string = 'es';


  // Tipo de área
  // Type of area
  areaTypes: AreaType[] = [];

  // Tipo de localización
  // Type of location
  locationTypes: AreaType[] = [];

  // Propiedades para controlar visibilidad según programa
  isPDAM: boolean = false;
  isPSAV: boolean = false;
  isPACNA: boolean = false;
  isPFHF: boolean = false;
  isPDFE: boolean = false;
  isAESAN: boolean = false;

  // Opciones de hora para los campos "hasta" - se filtran dinámicamente
  timeOptions: TimeOption[] = [];

  // Días de la semana disponibles para selección (filtrados según programa)
  // Available days of the week for selection (filtered by program)
  availableDaysOfWeek: DayOfWeekResponse[] = [];


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
      // Tipo de área - Tipo de área del sitio
      // Type of area - Type of area of the site
      // (tipo select-SOLO DISABLED - se auto-selecciona según ciudad)
      areaType: [{ value: null, disabled: true }],
      // Localización - Tipo de localización del sitio
      // Location - Type of location of the site
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
      // Comedor - Campo para indicar si el sitio tiene un comedor
      // Dining room - Field indicating if the site has a dining room
      hasDiningRoom: [null],
      // Capacidad de Salón Comedor - Solo visible cuando hasDiningRoom es true
      // Dining room capacity - Only visible when hasDiningRoom is true
      diningRoomCapacity: [null, [Validators.min(1)]],
      // Matrícula General - Para comparar con la capacidad del salón comedor
      // General Enrollment - To compare with dining room capacity
      generalEnrollment: [null, [Validators.pattern(/^\d+$/)]],
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
    this.timeOptions = generateTimeOptions();

    // Obtener Agencia desde local storage desde AuthService
    this.agencyId = this._authService.getAgencyId();

    // Obtener datos del resolver en lugar de suscribirse
    // Combinar datos de resolvers comunes y específicos del programa
    const commonData = this._route.snapshot.data['commonData'];
    const programData = this._route.snapshot.data['programData'];
    const resolvedData = commonData && programData ? { ...commonData, ...programData } : null;

    if (resolvedData) {
      // Yes No Options
      this.yesNoOptions = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'yesNo');
      // Opciones de Day Care Home
      this.relationshipTypeOptions = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'relationshipType');
      this.homeTypeOptions = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'homeType');
      this.participantTypeOptions = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'participantType');
      // Estatus
      this.isActive = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'isActive');
      // Política de operación - NO USAR ESTA LÍNEA, se usa la de abajo desde operatingPolicies
      this.listCities = resolvedData.cities;
      this.listRegions = resolvedData.regions;
      this.listPostalRegions = resolvedData.regions;
      this.areaTypes = resolvedData.areaTypes;
      this.locationTypes = resolvedData.areaTypes; // Usar los mismos valores que AreaType

      // Cargar días permitidos desde el resolver
      this.availableDaysOfWeek = resolvedData.allowedOperatingDays || [];

      // Usar la sitio del resolver
      // Use site from resolver
      this.onSetForm(resolvedData.site);

      this._changeDetectorRef.markForCheck();
    }

    // Obtener datos de la agencia desde el resolver padre
    const parentData = this._route.snapshot.parent?.data['initialData'];
    if (parentData?.agency) {
      this.agency = parentData.agency;
      const programs = this.agency.programs || [];

      // Obtener el valor de isDayCareHome de la inscripción o del sitio
      // Si el sitio tiene isDayCareHomeId, usarlo; si no, usar el de la agencia
      if (resolvedData?.site?.isDayCareHomeId) {
        this.isDayCareHomeId = resolvedData.site.isDayCareHomeId;
        const isDayCareHomeOption = resolvedData.site.isDayCareHome;
        this.isDayCareHome = isDayCareHomeOption
          ? (isDayCareHomeOption.booleanValue === true || isDayCareHomeOption.booleanValue == null)
          : false;
      } else {
        // Convertir OptionSelection a boolean:
        // - Si booleanValue === true (Sí) → true
        // - Si booleanValue === null/undefined pero existe OptionSelection (Ambos) → true
        // - Si booleanValue === false (No) o no existe → false
        const isDayCareHomeOption = this.agency?.inscription?.isDayCareHome;
        this.isDayCareHomeId = isDayCareHomeOption?.id || null;
        this.isDayCareHome = isDayCareHomeOption
          ? (isDayCareHomeOption.booleanValue === true || isDayCareHomeOption.booleanValue == null)
          : false;
      }

      // IMPORTANTE: Re-ejecutar updateValidations después de establecer isDayCareHome
      // para asegurar que las validaciones se apliquen correctamente
      this.updateValidations();
    }

    // Transloco
    this._translocoService.langChanges$.pipe(takeUntil(this._unsubscribeAll)).subscribe((lang: string) => {
      this.currentLang = lang;
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

    // Escuchar cambios en los días seleccionados para recalcular los días operativos
    this.headerConfig.formGroup.get('operatingDaysOfWeek')?.valueChanges
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

    // Campos isActive, inactiveDate e inactiveJustification ahora se manejan desde el modal de Settings
    // No se necesita suscripción a cambios de isActive ya que se gestiona desde el modal

    // Configurar validaciones condicionales para servicios
    this.setupServiceValidations();

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
        this.calculateGroupsFromDiningRoomCapacity();
        this._changeDetectorRef.detectChanges();
      });

    this.headerConfig.formGroup.get('generalEnrollment')?.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.validateDiningRoomCapacity();
        this.calculateGroupsFromDiningRoomCapacity();
        this._changeDetectorRef.detectChanges();
      });

    // Listener para calcular grupos automáticamente cuando cambia hasDiningRoom
    this.headerConfig.formGroup.get('hasDiningRoom')?.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.calculateGroupsFromDiningRoomCapacity();
      });
  }

  /**
   * Configura validaciones condicionales para todos los servicios
   * Cuando un servicio está en "Sí" (true), los campos "Hora desde" y "Hora hasta" son requeridos
   * Si hay horarios seleccionados, el campo si/no del servicio es requerido
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
        this.updateServiceTimeValidations(serviceControl.value, fromControl, toControl, serviceControl);
        this.updateServiceRequiredValidation(serviceControl, fromControl, toControl);

        // Suscribirse a cambios en el campo de servicio
        serviceControl.valueChanges
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((value: boolean | null) => {
            this.updateServiceTimeValidations(value, fromControl, toControl, serviceControl);
            this.updateServiceRequiredValidation(serviceControl, fromControl, toControl);
          });

        // Suscribirse a cambios en "Hora desde" para validar y ajustar "Hora hasta"
        fromControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
          TimeValidationUtil.validateAndAdjustTimeRange(fromControl, toControl);
          TimeValidationUtil.validateTimeRange(fromControl, toControl);
          this.updateServiceRequiredValidation(serviceControl, fromControl, toControl);
          // Forzar detección de cambios para actualizar las opciones en el template
          this._changeDetectorRef.detectChanges();
        });

        // Suscribirse a cambios en "Hora hasta" para validar y ajustar si es necesario
        toControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
          TimeValidationUtil.validateAndAdjustTimeRange(fromControl, toControl);
          TimeValidationUtil.validateTimeRange(fromControl, toControl);
          this.updateServiceRequiredValidation(serviceControl, fromControl, toControl);
        });
      }
    });
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
   * Actualiza la validación requerida del campo servicio basado en si hay horarios seleccionados
   * Si hay un horario "desde" o "hasta", el campo si/no del servicio es requerido
   */
  private updateServiceRequiredValidation(
    serviceControl: AbstractControl,
    fromControl: AbstractControl,
    toControl: AbstractControl
  ): void {
    const fromTime = fromControl.value;
    const toTime = toControl.value;
    // Verificar si hay horarios (pueden ser Date, string, o null/undefined)
    const hasFromTime = fromTime !== null && fromTime !== undefined && fromTime !== '';
    const hasToTime = toTime !== null && toTime !== undefined && toTime !== '';

    if (hasFromTime || hasToTime) {
      // Si hay algún horario seleccionado, el campo si/no es requerido
      serviceControl.setValidators([Validators.required]);
      serviceControl.updateValueAndValidity({ emitEvent: false });
    } else {
      // Si no hay horarios, remover la validación requerida solo si el servicio no está en "Sí"
      const serviceValue = serviceControl.value;
      if (serviceValue !== true) {
        serviceControl.clearValidators();
        serviceControl.updateValueAndValidity({ emitEvent: false });
      }
    }

    // Actualizar el estado del botón después de cambiar las validaciones
    this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;
    this._changeDetectorRef.detectChanges();
  }

  /**
   * Actualiza las validaciones de los campos de hora según el estado del servicio
   * @param serviceValue Valor del servicio (true = Sí, false/null = No)
   * @param fromControl Control del campo "Hora desde"
   * @param toControl Control del campo "Hora hasta"
   * @param serviceControl Control del campo servicio (opcional, para actualizar validación del servicio)
   */
  private updateServiceTimeValidations(
    serviceValue: boolean | null,
    fromControl: AbstractControl,
    toControl: AbstractControl,
    serviceControl?: AbstractControl
  ): void {
    const operatingStartTime = this.headerConfig.formGroup.get('operatingStartTime')?.value;
    const operatingEndTime = this.headerConfig.formGroup.get('operatingEndTime')?.value;

    if (serviceValue === true) {
      // Si el servicio está en "Sí", hacer requeridos los campos de hora y agregar validación de rango
      const fromValidators = [Validators.required];
      const toValidators = [Validators.required];

      // Agregar validador de rango si hay horas de funcionamiento configuradas
      if (operatingStartTime && operatingEndTime) {
        fromValidators.push(operatingHoursRangeValidator(operatingStartTime, operatingEndTime, true));
        toValidators.push(operatingHoursRangeValidator(operatingStartTime, operatingEndTime, false));
      }

      fromControl.setValidators(fromValidators);
      toControl.setValidators(toValidators);
    } else {
      // Si el servicio está en "No" o null, remover validaciones requeridas
      fromControl.clearValidators();
      toControl.clearValidators();
      // Limpiar valores si el servicio está en "No"
      if (serviceValue === false) {
        fromControl.setValue(null, { emitEvent: false });
        toControl.setValue(null, { emitEvent: false });
        // Si el servicio está en "No", remover también la validación requerida del servicio
        if (serviceControl) {
          serviceControl.clearValidators();
          serviceControl.updateValueAndValidity({ emitEvent: false });
        }
      }
    }

    fromControl.updateValueAndValidity({ emitEvent: false });
    toControl.updateValueAndValidity({ emitEvent: false });

    // Actualizar el estado del botón de guardar después de cambiar las validaciones
    // (necesario porque usamos emitEvent: false para evitar bucles infinitos)
    this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;
    this._changeDetectorRef.detectChanges();
  }

  /**
   * Revalida todos los campos de hora de servicios cuando cambian las horas de funcionamiento
   */
  private revalidateAllServiceTimes(): void {
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

    services.forEach(({ service, from, to }) => {
      const serviceControl = this.headerConfig.formGroup.get(service);
      const fromControl = this.headerConfig.formGroup.get(from);
      const toControl = this.headerConfig.formGroup.get(to);

      if (serviceControl && fromControl && toControl) {
        const serviceValue = serviceControl.value;
        this.updateServiceTimeValidations(serviceValue, fromControl, toControl, serviceControl);
      }
    });
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
   * Actualiza las validaciones de personInCharge
   * Para PACNA, se requieren validaciones de personInCharge
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

  onSetForm(param: Site): void {
    this.param = param;

    // Obtener las ciudades y regiones
    // Get cities and regions
    const city = param.city;
    const region = param.region;
    const postalCity = param.postalCity;
    const postalRegion = param.postalRegion;

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

    // Días y horas de funcionamiento
    const operatingDaysOfWeek: DayOfWeekResponse[] = param.operatingDaysOfWeek || [];
    const operatingStartTime: Date | null = param.operatingStartTime ? toTimeDate(param.operatingStartTime) : null;
    const operatingEndTime: Date | null = param.operatingEndTime ? toTimeDate(param.operatingEndTime) : null;
    // Fechas de funcionamiento
    const operatingFromDate: Date | null = param.operatingFromDate ? new Date(param.operatingFromDate) : null;
    const operatingToDate: Date | null = param.operatingToDate ? new Date(param.operatingToDate) : null;
    const operatingDaysCalculated: number | null = param.operatingDaysCalculated ?? null;

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
      personInCharge: param.personInCharge ? {
        firstName: param.personInCharge.firstName || '',
        middleName: param.personInCharge.middleName || '',
        fatherLastName: param.personInCharge.fatherLastName || '',
        motherLastName: param.personInCharge.motherLastName || '',
        birthDate: param.dayCareHome?.administratorBirthDate || null,
        sitePhone: param.personInCharge.sitePhone || '',
        extension: param.personInCharge.extension || '',
        mobilePhone: param.personInCharge.mobilePhone || '',
      } : {
        firstName: '',
        middleName: '',
        fatherLastName: '',
        motherLastName: '',
        birthDate: null,
        sitePhone: '',
        extension: '',
        mobilePhone: '',
      },
      // Servicios básicos
      breakfast: siteService?.breakfast ?? false,
      breakfastFrom: breakfastFrom,
      breakfastTo: breakfastTo,
      lunch: siteService?.lunch ?? false,
      lunchFrom: lunchFrom,
      lunchTo: lunchTo,
      snackAM: siteService?.snackAM ?? false,
      snackAMFrom: snackAMFrom,
      snackAMTo: snackAMTo,
      snackPM: siteService?.snackPM ?? false,
      snackPMFrom: snackPMFrom,
      snackPMTo: snackPMTo,
      dinner: siteService?.dinner ?? false,
      dinnerFrom: dinnerFrom,
      dinnerTo: dinnerTo,
      snackNight: siteService?.snackNight ?? false,
      snackNightFrom: snackNightFrom,
      snackNightTo: snackNightTo,
      // Servicios adicionales para PACNA
      dinnerExtended: siteService?.dinnerExtended ?? false,
      dinnerExtendedFrom: dinnerExtendedFrom,
      dinnerExtendedTo: dinnerExtendedTo,
      dinnerAtRisk: siteService?.dinnerAtRisk ?? false,
      dinnerAtRiskFrom: dinnerAtRiskFrom,
      dinnerAtRiskTo: dinnerAtRiskTo,
      snackExtended: siteService?.snackExtended ?? false,
      snackExtendedFrom: snackExtendedFrom,
      snackExtendedTo: snackExtendedTo,
      snackAtRisk: siteService?.snackAtRisk ?? false,
      snackAtRiskFrom: snackAtRiskFrom,
      snackAtRiskTo: snackAtRiskTo,
      // Fechas de funcionamiento
      operatingFromDate: operatingFromDate,
      operatingToDate: operatingToDate,
      operatingDaysCalculated: operatingDaysCalculated,
      // Días y horas de funcionamiento
      operatingDaysOfWeek: operatingDaysOfWeek,
      operatingStartTime: operatingStartTime,
      operatingEndTime: operatingEndTime,
      isActive: param.isActive,
      inactiveJustification: param.inactiveJustification || null,
      inactiveDate: param.inactiveDate,
      areaType: areaType,
      locationType: param.locationType,
      siteCode: param.siteCode || '',
    });

    // Establecer isDayCareHomeId del sitio si existe
    if (param.isDayCareHomeId) {
      this.isDayCareHomeId = param.isDayCareHomeId;
      if (param.isDayCareHome) {
        this.isDayCareHome = param.isDayCareHome.booleanValue === true || param.isDayCareHome.booleanValue == null;
      }
    }

    // Auto-seleccionar areaType si es null y hay una ciudad seleccionada
    // Auto-select areaType if it's null and there's a city selected
    if (!areaType && city) {
      this.getAreaTypeByCity(city);
    }

    // Asegurar que el campo areaType permanezca deshabilitado
    // Ensure areaType field remains disabled
    this.headerConfig.formGroup.get('areaType')?.disable();

    // Satélites
    this.satellitesTableConfig.dataSource.data = param.satellites || [];
    this.satellitesTableConfig.length = param.satellites?.length || 0;

    // Cargar datos de Day Care Home si existen
    if (param.dayCareHome) {
      // Mapear participants a participantTypes (array de IDs)
      const participantTypeIds = param.participants
        ?.filter(p => p.isActive)
        .map(p => p.participantType?.id)
        .filter((id): id is number => id != null) || [];

      this.headerConfig.formGroup.patchValue({
        isAuthorizedToOperate: param.dayCareHome.isAuthorizedToOperate,
        hasFamilyDepartmentLicense: param.dayCareHome.hasFamilyDepartmentLicense,
        numberOfEnrolledChildren: param.dayCareHome.numberOfEnrolledChildren,
        numberOfProviderChildren: param.dayCareHome.numberOfProviderChildren,
        numberOfParticipantsWithBloodTies: param.dayCareHome.numberOfParticipantsWithBloodTies,
        numberOfParticipantsWithoutBloodTies: param.dayCareHome.numberOfParticipantsWithoutBloodTies,
        minorsLiveWithProvider: param.dayCareHome.minorsLiveWithProvider,
        relationshipType: param.dayCareHome.relationshipType,
        offersServiceToImmigrantChildren: param.dayCareHome.offersServiceToImmigrantChildren,
        homeType: param.dayCareHome.homeType,
        participantTypes: participantTypeIds,
        offersServiceToDifferentGroups: param.dayCareHome.offersServiceToDifferentGroups,
        hasDiningRoom: param.hasDiningRoom,
        diningRoomCapacity: param.diningRoomCapacity,
        generalEnrollment: param.generalEnrollment,
      }, { emitEvent: false });

      // Si offersServiceToDifferentGroups es true, deshabilitar servicios principales
      if (param.dayCareHome.offersServiceToDifferentGroups === true) {
        this.toggleMainSiteServices(true);

        // Cargar servicios por grupos si existen
        if (param.services && param.services.length > 0) {
          // Filtrar servicios que tienen childGroup (servicios por grupos)
          const servicesByGroups = param.services.filter(service => service.childGroup != null);
          if (servicesByGroups.length > 0) {
            // Obtener grupos únicos desde los servicios
            // Intentar obtener numberOfChildren desde los servicios si está disponible
            // Nota: childGroup es OptionSelection en el frontend, pero el backend puede tener más información
            const uniqueGroups = new Map<number, { groupName: string; numberOfChildren: number }>();
            servicesByGroups.forEach(service => {
              if (service.childGroup?.id) {
                // Usar el nombre del grupo desde childGroup (OptionSelection)
                // numberOfChildren se obtendrá desde los servicios mapeados si está disponible
                if (!uniqueGroups.has(service.childGroup.id)) {
                  uniqueGroups.set(service.childGroup.id, {
                    groupName: service.childGroup.name || `Grupo ${service.childGroup.id}`,
                    numberOfChildren: 0 // Se actualizará desde los servicios mapeados
                  });
                }
              }
            });

            // Intentar obtener numberOfChildren desde los servicios mapeados
            // Si un servicio tiene información de numberOfChildren en el groupName o en otra propiedad,
            // se puede extraer aquí. Por ahora, usamos el valor desde servicesByGroups después de mapearlos

            // Cargar grupos únicos
            this.childGroups = Array.from(uniqueGroups.values()).map(group => ({
              siteId: this.param.id,
              groupName: group.groupName,
              groupNameEN: group.groupName, // Usar el mismo nombre por ahora (se puede mejorar obteniendo nameEN del OptionSelection)
              numberOfChildren: group.numberOfChildren
            }));
            this.nextGroupNumber = this.childGroups.length + 1;

            // Mapear servicios a ServiceByGroupDialogData
            // Los campos de tiempo ya vienen como string desde el backend
            this.servicesByGroups = servicesByGroups.map((service, index) => {
              const childGroup = uniqueGroups.get(service.childGroup?.id || 0);
              const groupName = childGroup?.groupName || service.childGroup?.name || `Grupo ${index + 1}`;

              return {
                id: index + 1,
                groupName: groupName,
                numberOfChildren: childGroup?.numberOfChildren || 0,
                breakfast: service.breakfast ?? false,
                breakfastFrom: service.breakfastFrom || undefined,
                breakfastTo: service.breakfastTo || undefined,
                lunch: service.lunch ?? false,
                lunchFrom: service.lunchFrom || undefined,
                lunchTo: service.lunchTo || undefined,
                snackAM: service.snackAM ?? false,
                snackAMFrom: service.snackAMFrom || undefined,
                snackAMTo: service.snackAMTo || undefined,
                snackPM: service.snackPM ?? false,
                snackPMFrom: service.snackPMFrom || undefined,
                snackPMTo: service.snackPMTo || undefined,
                dinner: service.dinner ?? false,
                dinnerFrom: service.dinnerFrom || undefined,
                dinnerTo: service.dinnerTo || undefined,
                snackNight: service.snackNight ?? false,
                snackNightFrom: service.snackNightFrom || undefined,
                snackNightTo: service.snackNightTo || undefined,
                dinnerExtended: service.dinnerExtended ?? false,
                dinnerExtendedFrom: service.dinnerExtendedFrom || undefined,
                dinnerExtendedTo: service.dinnerExtendedTo || undefined,
                dinnerAtRisk: service.dinnerAtRisk ?? false,
                dinnerAtRiskFrom: service.dinnerAtRiskFrom || undefined,
                dinnerAtRiskTo: service.dinnerAtRiskTo || undefined,
                snackExtended: service.snackExtended ?? false,
                snackExtendedFrom: service.snackExtendedFrom || undefined,
                snackExtendedTo: service.snackExtendedTo || undefined,
                snackAtRisk: service.snackAtRisk ?? false,
                snackAtRiskFrom: service.snackAtRiskFrom || undefined,
                snackAtRiskTo: service.snackAtRiskTo || undefined,
              };
            });
            this.updateServicesTableDataSource();

            // Actualizar numberOfChildren en uniqueGroups desde los servicios mapeados
            // Esto asegura que childGroups tenga la información correcta
            // Si hay múltiples servicios con el mismo grupo, usar el mayor numberOfChildren
            this.servicesByGroups.forEach(service => {
              if (service.groupName && service.numberOfChildren) {
                const groupId = Array.from(uniqueGroups.entries()).find(([_, g]) => g.groupName === service.groupName)?.[0];
                if (groupId) {
                  const group = uniqueGroups.get(groupId);
                  if (group && (service.numberOfChildren || 0) > group.numberOfChildren) {
                    group.numberOfChildren = service.numberOfChildren || 0;
                  }
                }
              }
            });

            // Actualizar childGroups con la información correcta de numberOfChildren
            this.childGroups = Array.from(uniqueGroups.values()).map(group => ({
              siteId: this.param.id,
              groupName: group.groupName,
              groupNameEN: group.groupName, // Usar el mismo nombre por ahora
              numberOfChildren: group.numberOfChildren
            }));

            // Sincronizar grupos desde servicios para asegurar consistencia
            this.syncChildGroupsFromServices();
          }
        }
      }
    }

    // Actualizar el estado del botón después de cargar todos los datos
    this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;
    this._changeDetectorRef.detectChanges();

    // Revalidar todos los servicios para aplicar validadores de rango de horarios
    this.revalidateAllServiceTimes();
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

    // Usar getRawValue() para obtener todos los valores, incluyendo campos deshabilitados
    const formValues = this.headerConfig.formGroup.getRawValue();
    // Obtener y mapear los valores del formulario
    // Get and map form values
    const cityId: number = formValues.city?.id;
    const regionId: number = formValues.region?.id;
    const postalCityId: number = formValues.postalCity?.id;
    const postalRegionId: number = formValues.postalRegion?.id;
    const areaTypeId: number = formValues.areaType?.id;
    const locationTypeId: number = formValues.locationType?.id;
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

    // Días de operación
    const operatingDaysCalculated: number = formValues.operatingDaysCalculated;
    // Obtener los días permitidos de la agencia
    const operatingDaysOfWeekIds: number[] = formValues.operatingDaysOfWeek?.map((day: DayOfWeekResponse) => day.id) || [];
    // Horas de funcionamiento
    const operatingStartTime: string | null = toTimeString(formValues.operatingStartTime);
    const operatingEndTime: string | null = toTimeString(formValues.operatingEndTime);

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
      areaTypeId: areaTypeId,
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
      personInCharge: formValues.personInCharge ? {
        firstName: formValues.personInCharge.firstName ?? null,
        middleName: formValues.personInCharge.middleName ?? null,
        fatherLastName: formValues.personInCharge.fatherLastName ?? null,
        motherLastName: formValues.personInCharge.motherLastName ?? null,
        sitePhone: formValues.personInCharge.sitePhone ?? null,
        extension: formValues.personInCharge.extension ?? null,
        mobilePhone: formValues.personInCharge.mobilePhone ?? null,
      } : null,
      isActive: formValues.isActive ?? true,
      inactiveJustification: formValues.inactiveJustification ?? null,
      inactiveDate: formValues.inactiveDate ?? null,
      hasDiningRoom: formValues.hasDiningRoom ?? null,
      diningRoomCapacity: formValues.diningRoomCapacity ?? null,
      generalEnrollment: formValues.generalEnrollment ?? null,
      // Indica si la agencia es Day Care Home
      // Indicates if the agency is Day Care Home
      isDayCareHomeId: this.isDayCareHomeId,
    };

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
    const siteService = this.param.services && this.param.services.length > 0 ? this.param.services[0] : null;
    const siteServiceRequest: SiteServiceRequest = {
      id: siteService?.id, // ID del servicio existente para actualizar
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

    // Validar y limpiar el servicio antes de agregarlo
    const cleanedServiceRequest = validateAndCleanSiteService(siteServiceRequest);

    // Validar y sincronizar grupos si hay servicios por grupos
    if (formValues.offersServiceToDifferentGroups && this.servicesByGroups.length > 0) {
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

    // Agregar servicios al SiteRequest
    if (formValues.offersServiceToDifferentGroups && this.servicesByGroups.length > 0) {
      // Si ofrece servicios a diferentes grupos, crear múltiples servicios (uno por grupo)
      siteRequest.services = this.servicesByGroups.map((serviceData) => {
        const serviceRequest: SiteServiceRequest = {
          siteId: this.param.id, // ID del sitio existente
          childGroupId: null, // Se asignará cuando se cree el grupo
          // Servicios básicos
          breakfast: serviceData.breakfast ?? false,
          breakfastFrom: serviceData.breakfastFrom || null,
          breakfastTo: serviceData.breakfastTo || null,
          lunch: serviceData.lunch ?? false,
          lunchFrom: serviceData.lunchFrom || null,
          lunchTo: serviceData.lunchTo || null,
          snackAM: serviceData.snackAM ?? false,
          snackAMFrom: serviceData.snackAMFrom || null,
          snackAMTo: serviceData.snackAMTo || null,
          dinner: serviceData.dinner ?? false,
          dinnerFrom: serviceData.dinnerFrom || null,
          dinnerTo: serviceData.dinnerTo || null,
          snackPM: serviceData.snackPM ?? false,
          snackPMFrom: serviceData.snackPMFrom || null,
          snackPMTo: serviceData.snackPMTo || null,
          snackNight: serviceData.snackNight ?? false,
          snackNightFrom: serviceData.snackNightFrom || null,
          snackNightTo: serviceData.snackNightTo || null,
          // Servicios PACNA
          dinnerExtended: serviceData.dinnerExtended ?? false,
          dinnerExtendedFrom: serviceData.dinnerExtendedFrom || null,
          dinnerExtendedTo: serviceData.dinnerExtendedTo || null,
          dinnerAtRisk: serviceData.dinnerAtRisk ?? false,
          dinnerAtRiskFrom: serviceData.dinnerAtRiskFrom || null,
          dinnerAtRiskTo: serviceData.dinnerAtRiskTo || null,
          snackExtended: serviceData.snackExtended ?? false,
          snackExtendedFrom: serviceData.snackExtendedFrom || null,
          snackExtendedTo: serviceData.snackExtendedTo || null,
          snackAtRisk: serviceData.snackAtRisk ?? false,
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

    // Agregar tipos de participantes
    if (formValues.participantTypes && formValues.participantTypes.length > 0) {
      siteRequest.participants = formValues.participantTypes.map((id: number) => ({
        participantTypeId: id
      }));
    }

    // Agregar información de Day Care Home
    // Este formulario es exclusivo para Day Care Home
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
      administratorBirthDate: formValues.personInCharge?.birthDate ?? null,
      offersServiceToDifferentGroups: formValues.offersServiceToDifferentGroups ?? null,
    };

    this.isLoading = true;
    this.headerConfig.formGroup.disable();

    this._siteService.updateSite(siteRequest, {}).subscribe({
      next: (result: any) => {
        switch (result.body) {
          case true:
            this._notificationService.showSuccessDialogWithCallback(
              'sites.edit.success',
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
    const targetRoute = this.getTargetRoute();
    this._customRouter.navigate(targetRoute);
  }

  /**
   * Determina la ruta de navegación según el programa activo
   * Determines navigation route based on active program
   * @returns Array con la ruta de navegación
   */
  private getTargetRoute(): string[] {
    return ['sites-pacna'];
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
    const currentProvidedRationsService = this.param?.providedRationsService ?? null;

    const dialogRef = this._dialog.open(SiteStatusModalComponent, {
      data: {
        siteId: this.param.id,
        isActive: currentIsActive,
        inactiveDate: currentInactiveDate,
        inactiveJustification: currentInactiveJustification,
        providedRationsService: currentProvidedRationsService,
        isActiveOptions: this.isActive,
        yesNoOptions: this.yesNoOptions
      } as SiteStatusModalData,
      disableClose: false,
      width: '600px',
      maxWidth: '90vw',
      panelClass: ['mat-dialog-container', 'dialog-responsive']
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action === 'redirect-to-changes-form') {
        // Por ahora, mostrar mensaje de que el formulario está en desarrollo
        this._notificationService.showInfo('sites.edit.status-modal.changes-form-not-implemented');
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
      this._customRouter.navigate([...targetRoute, 'calendar', siteId.toString()]);
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
              const isValidCurrentRegion = currentPostalRegion &&
                this.listPostalRegions.some(r => r.id === currentPostalRegion.id);

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


  /**
   * Actualiza la visibilidad del campo Tipo de Centro y Tipo de Institución Residencial basado en el tipo de organización seleccionado
   */

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

  /**
   * Maneja el cambio del campo "¿Ofrece servicio a diferentes grupos de niños?"
   */
  onOffersServiceToDifferentGroupsChange(checked: boolean): void {
    // Deshabilitar/habilitar servicios del sitio principal según el estado
    this.toggleMainSiteServices(checked);

    // Si no ofrece servicio a diferentes grupos, limpiar campos adicionales
    if (!checked) {
      this.clearDifferentGroupsFields();
    } else {
      // Si ofrece servicio a diferentes grupos, limpiar los servicios principales
      this.clearMainSiteServices();
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
   * Deshabilita o habilita los campos de servicios del sitio principal
   * @param disabled true para deshabilitar (cuando hay múltiples grupos), false para habilitar
   */
  private toggleMainSiteServices(disabled: boolean): void {
    const serviceFields = [
      'breakfast', 'breakfastFrom', 'breakfastTo',
      'lunch', 'lunchFrom', 'lunchTo',
      'snackAM', 'snackAMFrom', 'snackAMTo',
      'snackPM', 'snackPMFrom', 'snackPMTo',
      'dinner', 'dinnerFrom', 'dinnerTo',
      'snackNight', 'snackNightFrom', 'snackNightTo',
      'dinnerExtended', 'dinnerExtendedFrom', 'dinnerExtendedTo',
      'dinnerAtRisk', 'dinnerAtRiskFrom', 'dinnerAtRiskTo',
      'snackExtended', 'snackExtendedFrom', 'snackExtendedTo',
      'snackAtRisk', 'snackAtRiskFrom', 'snackAtRiskTo'
    ];

    serviceFields.forEach(field => {
      const control = this.headerConfig.formGroup.get(field);
      if (control) {
        if (disabled) {
          control.disable({ emitEvent: false });
        } else {
          control.enable({ emitEvent: false });
        }
      }
    });
  }

  /**
   * Limpia los campos de servicios del sitio principal
   */
  private clearMainSiteServices(): void {
    this.headerConfig.formGroup.patchValue({
      breakfast: false,
      breakfastFrom: null,
      breakfastTo: null,
      lunch: false,
      lunchFrom: null,
      lunchTo: null,
      snackAM: false,
      snackAMFrom: null,
      snackAMTo: null,
      snackPM: false,
      snackPMFrom: null,
      snackPMTo: null,
      dinner: false,
      dinnerFrom: null,
      dinnerTo: null,
      snackNight: false,
      snackNightFrom: null,
      snackNightTo: null,
      dinnerExtended: false,
      dinnerExtendedFrom: null,
      dinnerExtendedTo: null,
      dinnerAtRisk: false,
      dinnerAtRiskFrom: null,
      dinnerAtRiskTo: null,
      snackExtended: false,
      snackExtendedFrom: null,
      snackExtendedTo: null,
      snackAtRisk: false,
      snackAtRiskFrom: null,
      snackAtRiskTo: null
    }, { emitEvent: false });
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
    const operatingStartTime = this.headerConfig.formGroup.get('operatingStartTime')?.value;
    const operatingEndTime = this.headerConfig.formGroup.get('operatingEndTime')?.value;
    
    const dialogRef = this._dialog.open(AddServiceByGroupModalComponent, {
      data: {
        isEdit: false,
        yesNoOptions: this.yesNoOptions,
        isPDAM: false,
        isPACNA: true,
        isPSAV: false,
        operatingStartTime: operatingStartTime,
        operatingEndTime: operatingEndTime,
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
        this.syncChildGroupsFromServices(); // Sincronizar grupos
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
    
    const dialogRef = this._dialog.open(AddServiceByGroupModalComponent, {
      data: {
        ...serviceToEdit,
        isEdit: true,
        yesNoOptions: this.yesNoOptions,
        isPDAM: false,
        isPACNA: true,
        isPSAV: false,
        operatingStartTime: operatingStartTime,
        operatingEndTime: operatingEndTime,
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
          this.syncChildGroupsFromServices(); // Sincronizar grupos
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
          this.syncChildGroupsFromServices(); // Sincronizar grupos

        }
      }
    });
  }

  /**
   * Actualiza el dataSource de la tabla de servicios
   */
  private updateServicesTableDataSource(): void {
    this.servicesTableConfig.dataSource.data = [...this.servicesByGroups];
  }

  /**
   * Extrae grupos únicos desde servicesByGroups y los sincroniza a childGroups
   * Si un grupo ya existe (mismo groupName), actualiza numberOfChildren si es mayor
   */
  private syncChildGroupsFromServices(): void {
    const uniqueGroups = new Map<string, { groupName: string; numberOfChildren: number }>();

    // Extraer grupos únicos desde servicesByGroups
    this.servicesByGroups.forEach(service => {
      if (service.groupName) {
        const existingGroup = uniqueGroups.get(service.groupName);
        if (!existingGroup) {
          uniqueGroups.set(service.groupName, {
            groupName: service.groupName,
            numberOfChildren: service.numberOfChildren || 0
          });
        } else {
          // Si el grupo ya existe, usar el mayor numberOfChildren
          if ((service.numberOfChildren || 0) > existingGroup.numberOfChildren) {
            existingGroup.numberOfChildren = service.numberOfChildren || 0;
          }
        }
      }
    });

    // Sincronizar a childGroups
    this.childGroups = Array.from(uniqueGroups.values()).map(group => ({
      siteId: this.param?.id || 0,
      groupName: group.groupName,
      groupNameEN: group.groupName, // Por ahora usar el mismo nombre
      numberOfChildren: group.numberOfChildren
    }));
  }

  /**
   * Calcula y crea automáticamente los grupos necesarios en servicesByGroups
   * cuando la capacidad del comedor es menor que la matrícula
   */
  private calculateGroupsFromDiningRoomCapacity(): void {
    const hasDiningRoom = this.headerConfig.formGroup.get('hasDiningRoom')?.value === true;
    const capacity = this.headerConfig.formGroup.get('diningRoomCapacity')?.value;
    const enrollment = this.headerConfig.formGroup.get('generalEnrollment')?.value;

    // Solo calcular si se cumplen las condiciones
    if (!hasDiningRoom || !capacity || !enrollment || capacity >= enrollment) {
      // Si ya no se cumple la condición, limpiar grupos automáticos si existen
      this.cleanAutoCalculatedGroups();
      return;
    }

    // No sobrescribir si es Day Care Home con diferentes grupos manuales
    if (this.isDayCareHome && this.headerConfig.formGroup.get('offersServiceToDifferentGroups')?.value === true) {
      return;
    }

    // Calcular número de grupos necesarios
    const numberOfGroups = Math.ceil(enrollment / capacity);
    
    // Distribuir niños: primeros grupos con capacidad máxima, último con el resto
    let remainingChildren = enrollment;
    const calculatedGroups: Array<{ groupName: string; numberOfChildren: number }> = [];
    
    for (let i = 1; i <= numberOfGroups; i++) {
      const childrenInGroup = i === numberOfGroups 
        ? remainingChildren  // Último grupo toma el resto
        : Math.min(capacity, remainingChildren);  // Otros grupos con capacidad máxima
      
      calculatedGroups.push({
        groupName: `Grupo ${i}`,
        numberOfChildren: childrenInGroup
      });
      
      remainingChildren -= childrenInGroup;
    }

    // Crear o actualizar grupos en servicesByGroups
    calculatedGroups.forEach((calculatedGroup) => {
      const existingService = this.servicesByGroups.find(
        s => s.groupName === calculatedGroup.groupName
      );

      if (existingService) {
        // Actualizar numberOfChildren si es diferente
        if (existingService.numberOfChildren !== calculatedGroup.numberOfChildren) {
          existingService.numberOfChildren = calculatedGroup.numberOfChildren;
        }
      } else {
        // Crear nuevo grupo en servicesByGroups (sin servicios configurados)
        const newId = this.servicesByGroups.length > 0 
          ? Math.max(...this.servicesByGroups.map((s) => s.id || 0)) + 1 
          : 1;

        this.servicesByGroups.push({
          id: newId,
          groupName: calculatedGroup.groupName,
          numberOfChildren: calculatedGroup.numberOfChildren,
          // Todos los servicios en false/null (el usuario los configurará editando)
          breakfast: false,
          lunch: false,
          snackAM: false,
          snackPM: false,
          dinner: false,
          snackNight: false,
          dinnerExtended: false,
          dinnerAtRisk: false,
          snackExtended: false,
          snackAtRisk: false,
        } as ServiceByGroupDialogData);
      }
    });

    // Eliminar grupos automáticos que ya no son necesarios
    this.servicesByGroups = this.servicesByGroups.filter(service => {
      // Mantener grupos que no son automáticos (no empiezan con "Grupo ")
      if (!service.groupName || !service.groupName.startsWith('Grupo ')) {
        return true;
      }
      // Mantener solo los grupos que están en calculatedGroups
      return calculatedGroups.some(cg => cg.groupName === service.groupName);
    });

    // Actualizar tabla y sincronizar childGroups
    this.updateServicesTableDataSource();
    this.syncChildGroupsFromServices();
    this.nextGroupNumber = numberOfGroups + 1;
  }

  /**
   * Limpia los grupos automáticos cuando ya no se cumple la condición
   */
  private cleanAutoCalculatedGroups(): void {
    // Solo limpiar si no es Day Care Home con diferentes grupos
    if (this.isDayCareHome && this.headerConfig.formGroup.get('offersServiceToDifferentGroups')?.value === true) {
      return;
    }

    // Eliminar grupos que empiezan con "Grupo " (grupos automáticos)
    const beforeLength = this.servicesByGroups.length;
    this.servicesByGroups = this.servicesByGroups.filter(
      service => !service.groupName || !service.groupName.startsWith('Grupo ')
    );

    // Si se eliminaron grupos, actualizar tabla
    if (this.servicesByGroups.length !== beforeLength) {
      this.updateServicesTableDataSource();
      this.syncChildGroupsFromServices();
    }
  }

  // Método para obtener Site Location según el tipo de grupo seleccionado
  // Get site location by group type
}
