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
import { SiteChildGroupResponse } from 'app/shared/models/Response/SiteChildGroupResponse';
import {
  normalizeServiceSlotFromResponse,
  SiteChildGroupServiceSlotResponse
} from 'app/shared/models/Response/SiteChildGroupServiceSlotResponse';
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
import { AddServiceByGroupModalComponent, ServiceByGroupDialogData, ServiceByGroupDialogResult } from '../../../../shared/components/add-service-by-group-modal/add-service-by-group-modal.component';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { AreaType } from 'app/shared/models/AreaType';
import { DayOfWeekResponse } from 'app/shared/models/DayOfWeekResponse';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AreaTypeService } from 'app/shared/services/area-type.service';
import { AgencyService } from 'app/shared/services/agency.service';
import { Agency } from 'app/shared/models/Agency';
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
import { validateAndCleanSiteService } from 'app/shared/utils/site-service-validator';
import { DateCalculationsUtil } from 'app/shared/utils/date-calculations.util';
import { TimeValidationUtil } from 'app/shared/utils/time-validation.util';
import { ServiceTypeByProgram } from 'app/shared/models/ServiceTypeByProgram';
import { ApiErrorBody } from 'app/shared/models/ApiError';

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
    LongitudeDirective,
    MatProgressSpinnerModule
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
    viewMode: 'cards',
    operatingDaysOfWeek: []
  };

  // Lista de grupos con sus slots de servicio (en memoria hasta el envío)
  servicesByGroups: ServiceByGroupDialogResult[] = [];

  servicesCardLoading = false;

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
        label: 'global.menu.calendar',
        icon: 'heroicons_outline:calendar',
        iconColor: 'text-blue-500',
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
      this.isActive = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'isActive');
      this.listCities = resolvedData.cities;
      this.listRegions = resolvedData.regions;
      this.listPostalRegions = resolvedData.regions;
      this.areaTypes = resolvedData.areaTypes;
      this.locationTypes = resolvedData.areaTypes; // Usar los mismos valores que AreaType

      // Cargar días permitidos desde el resolver
      this.availableDaysOfWeek = resolvedData.allowedOperatingDays || [];

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
      .subscribe((value: DayOfWeekResponse[] | null) => {
        DateCalculationsUtil.calculateOperatingDays(this.headerConfig.formGroup);
        this.servicesTableConfig.operatingDaysOfWeek = value ?? [];
        this._changeDetectorRef.markForCheck();
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
   * Obtiene las opciones filtradas para un campo "hasta" basado en la hora "desde".
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
    this.servicesTableConfig.operatingDaysOfWeek = param.operatingDaysOfWeek ?? [];

    // Obtener las ciudades y regiones
    // Get cities and regions
    const city = param.city;
    const region = param.region;
    const postalCity = param.postalCity;
    const postalRegion = param.postalRegion;

    const areaType = param.areaType;
    const locationType = param.locationType;

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

      // Si offersServiceToDifferentGroups es true, cargar servicios por grupos si existen
      if (param.dayCareHome.offersServiceToDifferentGroups === true) {
        // Cargar servicios por grupos si existen
        const paramGroups: SiteChildGroupResponse[] = param.childGroups ?? [];
        if (paramGroups.length > 0) {
          this.childGroups = paramGroups.map(
            (group): SiteChildGroupRequest => ({
              id: group.id,
              siteId: this.param!.id,
              groupName: group.groupName ?? '',
              groupNameEN: group.groupName ?? '',
              numberOfChildren: group.numberOfChildren ?? 0,
              serviceSlots: (group.serviceSlots ?? []).map((slot) => {
                const base = normalizeServiceSlotFromResponse(slot);
                return { ...base, serviceTypeName: slot.serviceTypeName, serviceTypeNameEN: slot.serviceTypeNameEN };
              }),
            })
          );
          this.nextGroupNumber = this.childGroups.length + 1;

          this.servicesByGroups = paramGroups.map((group, index) => ({
            id: group.id ?? index + 1,
            groupName: group.groupName ?? '',
            numberOfChildren: group.numberOfChildren ?? 0,
            serviceSlots: (group.serviceSlots ?? []).map((slot) => {
              const base = normalizeServiceSlotFromResponse(slot);
              return {
                ...base,
                serviceTypeName: slot.serviceTypeName,
                serviceTypeNameEN: slot.serviceTypeNameEN,
                operatingDates: slot.operatingDates ?? [],
              };
            }),
          }));
          this.updateServicesTableDataSource();
          this.syncChildGroupsFromServices();
        }
      }
    }

    // Actualizar el estado del botón después de cargar todos los datos
    this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;
    this._changeDetectorRef.detectChanges();

  }

  /**
   * Envía el formulario de edición de sitio (Day Care Home).
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
    const cityId: number = formValues.city?.id;
    const regionId: number = formValues.region?.id;
    const postalCityId: number = formValues.postalCity?.id;
    const postalRegionId: number = formValues.postalRegion?.id;
    const areaTypeId: number = formValues.areaType?.id;
    const locationTypeId: number = formValues.locationType?.id;
    const operatingDaysCalculated: number = formValues.operatingDaysCalculated;
    const operatingDaysOfWeekIds: number[] = formValues.operatingDaysOfWeek?.map((day: DayOfWeekResponse) => day.id) || [];
    const operatingStartTime: string | null = toTimeString(formValues.operatingStartTime);
    const operatingEndTime: string | null = toTimeString(formValues.operatingEndTime);

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
      operatingFromDate: formValues.operatingFromDate ?? null,
      operatingToDate: formValues.operatingToDate ?? null,
      operatingDaysCalculated: operatingDaysCalculated ?? null,
      operatingDaysOfWeek: operatingDaysOfWeekIds,
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
      isDayCareHomeId: this.isDayCareHomeId,
    };

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

    // En edición los grupos se persisten en el momento desde el modal; no enviar childGroups en update-site.
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
      error: (err: HttpErrorResponse) => {
        const body = err?.error as ApiErrorBody | undefined;
        if (
          err?.status === 400 &&
          body?.code === 'SiteDatesOutsideComedorRange' &&
          body?.message
        ) {
          this._notificationService.showWarningDialogWithRawMessage(body.message);
        } else if (
          err?.status === 400 &&
          (body?.code === 'MissingStrongService' || body?.code === 'InsufficientTimeBetweenServices') &&
          body?.message
        ) {
          this._notificationService.showError(body.message);
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

  private navigateToCalendar(): void {
    const targetRoute = this.getTargetRoute();
    const siteId = this.param?.id;
    if (siteId) {
      this._customRouter.navigate([...targetRoute, 'calendar', siteId.toString()]);
    }
  }

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

  /**
   * Obtiene el tipo de área según la ciudad seleccionada y lo asigna al formulario.
   */
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

  /**
   * Copia la dirección física a la postal (o limpia la postal) según el estado del checkbox.
   */
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
  }

  /**
   * Maneja las acciones del menú de agregar en la tabla de servicios.
   */
  onAddMenuAction(menuItemId: string): void {
    if (menuItemId === 'add') {
      this.onTableAdd();
    }
  }

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
        this.servicesCardLoading = true;
        this._changeDetectorRef?.markForCheck();
        const newId = this.servicesByGroups.length > 0 ? Math.max(...this.servicesByGroups.map((s) => s.id || 0)) + 1 : 1;
        this.servicesByGroups.push({ ...result, id: newId });
        this.updateServicesTableDataSource();
        this.syncChildGroupsFromServices();
        this.saveChildGroupsToBackend();
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

  /**
   * Persiste los grupos de niños en el backend (endpoint update-site-child-groups).
   */
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

  /** Mapeo serviceTypeId → clave de columna (breakfast, lunch, snackAM, etc.) desde programData.serviceTypes (resolver, datos desde BD). */
  private getServiceTypeIdToTableKey(): Record<number, string> {
    const programData = this._route.snapshot.data['programData'] as { serviceTypes?: ServiceTypeByProgram[] } | undefined;
    const serviceTypes = programData?.serviceTypes ?? [];
    const map: Record<number, string> = {};
    if (Array.isArray(serviceTypes) && serviceTypes.length > 0) {
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
  }

  private syncChildGroupsFromServices(): void {
    this.childGroups = this.servicesByGroups.map(service => ({
      id: service.id,
      siteId: this.param?.id ?? 0,
      groupName: service.groupName,
      groupNameEN: service.groupName,
      numberOfChildren: service.numberOfChildren,
      serviceSlots: service.serviceSlots ?? [],
    }));
  }
}
