import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Validators, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { SchoolService } from 'app/shared/services/school.service';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GeoService } from 'app/shared/services/geo.service';
import { OrganizationTypeService } from 'app/shared/services/organization-type.service';
import { EducationLevelService } from 'app/shared/services/education-level.service';
import { OperatingPolicyService } from 'app/shared/services/operating-policy.service';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { NgForOf, NgIf } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Agency } from 'app/shared/models/Agency';
import { OptionSelection } from 'app/shared/models/OptionSelection';
import { GroupTypeService } from 'app/shared/services/group-type.service';
import { SponsorTypeService } from 'app/shared/services/sponsor-type.service';
import { compare, compareById, comparePostal, isNullOrUndefinedEmptyStringNullArray, toTimeString } from 'app/shared/utils';
import { City } from 'app/shared/models/City';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { Region } from 'app/shared/models/Region';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { SchoolRequest } from 'app/shared/models/Request/SchoolRequest';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
import { KitchenTypeService } from 'app/shared/services/kitchen-type.service';
import { DeliveryTypeService } from 'app/shared/services/delivery-type.service';
import { DeliveryType } from 'app/shared/models/DeliveryType';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { CenterType } from 'app/shared/models/CenterType';
import { CenterTypeService } from 'app/shared/services/center-type.service';
import { OrganizationType } from 'app/shared/models/OrganizationType';
import { SponsorType } from 'app/shared/models/SponsorType';
import { EducationLevel } from 'app/shared/models/EducationLevel';
import { AuthService } from 'app/core/auth/auth.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { AreaTypeService } from 'app/shared/services/area-type.service';
import { AreaType } from 'app/shared/models/AreaType';
import { AgencyService } from 'app/shared/services/agency.service';
import { PROGRAM_IDS } from 'app/shared/const';

@Component({
  selector: 'app-schools-add',
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
  ],
})
export class AddSchoolComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _formBuilder = inject(UntypedFormBuilder);
  private _schoolService = inject(SchoolService);
  private _geoService = inject(GeoService);
  private _notificationService = inject(NotificationService);
  private _customRouter = inject(CustomRouterService);
  private _translocoService = inject(TranslocoService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _authService = inject(AuthService);
  private _agencyService = inject(AgencyService);
  private _kitchenTypeService = inject(KitchenTypeService);
  private _route = inject(ActivatedRoute);

  // catálogos
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

  // Tipo de Organización Escuela (1), Satélite (2), Institución Residencial (3), Otros (4)
  // Organization type - Required field for school classification
  organizationTypes: OrganizationType[] = [];

  // Nivel educativo - Campo requerido para tipo de escuela (MÚLTIPLE SELECCIÓN)
  // Education level - Required field for school type (MULTIPLE SELECTION)
  educationLevels: EducationLevel[] = [];

  // Centro - Campo requerido para clasificación de la escuela
  // Center - Required field for school classification
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
  operatingPolicies: OptionSelection[] = [];

  // Tipo de cocina
  // Type of kitchen
  kitchenTypes: OptionSelection[] = [];
  isKitchenTypeDisabled: boolean = false;

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

  // Tipos de área (nuevo catálogo)
  // Type of area (new catalog)
  // Rural (1), Urbana (2)
  areaTypes: AreaType[] = [];

  // Header config and reactive form
  // Configuración del header y formulario reactivo
  // Header config and reactive form
  headerConfig: GenericHeaderConfig = {
    title: 'schools.add.title',
    formGroup: this._formBuilder.group({
      // Información General / General Information
      // Nombre de la escuela - Campo requerido para identificar la escuela
      // School name - Required field for identifying the school
      name: ['', Validators.required],
      // Dirección física - Campo requerido para la ubicación de la escuela
      // Physical address - Required field for school location
      address: ['', Validators.required],
      // Ciudad - Campo requerido para la ubicación de la escuela
      // City - Required field for school location
      city: [null, Validators.required],
      // Región - Campo requerido para la ubicación de la escuela
      // Region - Required field for school location
      region: [null, Validators.required],
      // Código postal - Campo requerido para la ubicación de la escuela
      // ZIP code - Required field for school location
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
      postalZipCode: [''],
      // Información Administrativa / Administrative Information
      // Estado sin fines de lucro - Campo requerido que indica si la escuela es sin fines de lucro
      // Non-profit status - Required field indicating if the school is non-profit
      nonProfit: [null, Validators.required],
      // Fecha de inicio - Cuando la escuela comenzó operaciones
      // School start date - When the school began operations
      startDate: [null],
      // Año base - Año de referencia para operaciones de la escuela
      // Base year - Reference year for school operations
      // (tipo text-SOLO DISABLED)
      baseYear: [{ value: null, disabled: true }, [Validators.pattern(/^\d{4}$/)]],
      // Año de renovación - Año de renovación del contrato
      // Renewal year - Year of contract renewal
      // (tipo text-SOLO DISABLED)
      renewalYear: [{ value: null, disabled: true }, [Validators.pattern(/^\d{4}$/)]],
      // Tipo de organización - Campo requerido para clasificación de la escuela
      // Organization type - Required field for school classification
      organizationType: [null, Validators.required],
      // Centro - Campo requerido para clasificación de la escuela
      // Center - Required field for school classification
      centerType: [null, Validators.required],
      // Nivel educativo - Campo requerido para tipo de escuela (MÚLTIPLE SELECCIÓN)
      // Education level - Required field for school type (MULTIPLE SELECTION)
      educationLevels: [[], Validators.required],
      // Fechas de funcionamiento - Fechas desde y hasta cuando opera la escuela
      // Operating dates - Dates from and to when the school operates
      operatingFromDate: [null],
      operatingToDate: [null],
      operatingDaysCalculated: [{ value: null, disabled: true }],
      // Datos Operativos / Operational Data
      // Tipo de cocina - Tipo de instalación de cocina
      // Kitchen type - Type of kitchen facility
      kitchenType: [null],
      // Tipo de grupo - Clasificación de grupos de estudiantes
      // Group type - Classification of student groups
      groupType: [null],
      // Tipo de entrega - Método de entrega de servicio
      // Delivery type - Method of service delivery
      deliveryType: [null],
      // Tipo de auspiciador - Tipo de patrocinio de la escuela
      // Sponsor type - Type of school sponsorship
      sponsorType: [null],
      // Tipo de solicitante - Tipo de solicitante de la escuela
      // Type of applicant - Type of school applicant
      // Laico (15), Base de fe (16)
      typeOfApplicant: [null],
      // Tipo de área - Campo requerido para clasificación de la escuela
      // Type of area - Required field for school classification
      // Rural (23), Urbana (24)
      areaType: [null],
      // Tipo de residencial - Campo requerido para clasificación RCCI (Pernoctan/No Pernoctan)
      // Residential type - Required field for RCCI classification (Residential/Non-residential)
      // Pernoctan (17), No Pernoctan (18)
      typeOfResidential: [null],
      // Política de operación - Directrices operativas de la escuela
      // Operating policy - School's operational guidelines
      operatingPolicy: [null],
      // Disponibilidad de almacén - Indica si la escuela tiene instalaciones de almacenamiento
      // Warehouse availability - Indicates if school has storage facilities
      hasWarehouse: [false],
      // Disponibilidad de comedor - Indica si la escuela tiene instalaciones de comedor
      // Dining room availability - Indicates if school has dining facilities
      hasDiningRoom: [false],
      // Administrador/Representante Autorizado
      // Administrator/Authorized Representative
      // Nombre Completo del Administrador o Representante
      // Full name of the administrator or representative
      administratorAuthorizedName: [''],
      // Teléfono del Sitio
      // Site phone
      sitePhone: [''],
      // Extensión
      // Extension
      extension: [''],
      // Teléfono Móvil
      // Mobile phone
      mobilePhone: [''],
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
      // Merienda (si, no)
      // Snack (yes, no)
      snack: [false],
      // Horario desde para la merienda
      // Snack schedule from
      snackFrom: [null],
      // Horario hasta para la merienda
      // Snack schedule to
      snackTo: [null],
      // Comunidad
      // Community
      community: [null],
      // Caminantes / Walkers
      // Walkers
      walkers: [null],
      // Tipo de distribución / Distribution type
      // Distribution type
      distributionType: [null],
      // Tipo de sitio / Site type
      // Site type
      siteType: [null],
      // Experiencia / Experience
      // Experience
      experience: [null],
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
    }),
    // Cancel button
    cancelButtonShow: true,
    cancelButtonText: 'schools.add.buttons.cancel',
    // Submit button
    submitButtonShow: true,
    submitButtonText: 'schools.add.buttons.submit',
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

  // Si la escuela es la principal
  isMainSchool: boolean = true;

  // Propiedades para controlar visibilidad según programa
  isPDAM: boolean = false;
  isPSAV: boolean = false;
  isPACNA: boolean = false;
  isPFHF: boolean = false;
  isPDFE: boolean = false;
  isAESAN: boolean = false;

  // Propiedad para controlar visibilidad cuando es Day Care Home
  isDayCareHome: boolean = false;

  // Función helper para determinar si un campo debe mostrarse
  shouldShowField(): boolean {
    if (this.isDayCareHome) {
      // Por ahora, ocultar TODOS los campos cuando es Day Care Home
      // TODO: Cuando se especifiquen campos específicos para Day Care Home,
      // agregar lógica aquí para mostrar solo esos campos
      return false;
    }
    // Cuando no es Day Care Home, mostrar todos los campos normalmente
    return true;
  }

  // Función para mostrar campos específicos de Day Care Home (PACNA + isDayCareHome)
  shouldShowDayCareFields(): boolean {
    return this.isDayCareHome && this.isPACNA;
  }

  constructor() {}

  ngOnInit(): void {
    this.currentLang = this._translocoService.getActiveLang();

    // Obtener Agencia desde local storage desde AuthService
    this.agencyId = this._authService.getAgencyId();

    // Obtener datos del resolver en lugar de suscribirse
    const resolvedData = this._route.snapshot.data['data'];

    if (resolvedData) {
      // Yes No Options
      this.yesNoOptions = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'yesNo');
      this.typeOfResidential = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'typeOfResidential');
      this.typeOfApplicant = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'typeOfApplicant');
      this.community = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'community');
      this.relationshipTypeOptions = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'relationshipType');
      this.homeTypeOptions = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'homeType');
      this.participantTypeOptions = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'participantType');
      this.walkers = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'walkers');
      this.distributionType = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'distributionType');
      this.siteType = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'siteType');
      this.experience = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'experience');

      // Catálogos
      this.centerTypes = resolvedData.centerTypes;
      this.organizationTypes = resolvedData.organizationTypes;
      this.educationLevels = resolvedData.educationLevels;
      this.kitchenTypes = resolvedData.kitchenTypes;
      this.groupTypes = resolvedData.groupTypes;
      this.sponsorType = resolvedData.sponsorTypes;
      this.operatingPolicies = resolvedData.operatingPolicies;
      this.deliveryTypes = resolvedData.deliveryTypes;
      this.listCities = resolvedData.cities;
      this.listRegions = resolvedData.regions;
      this.areaTypes = resolvedData.areaTypes;

      // Verificar escuela principal
      this.isMainSchool = !resolvedData.hasMainSchool;

      // Inicializar estado del tipo de cocina
      this.isKitchenTypeDisabled = false; // Siempre habilitado

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
  }

  private calculateOperatingDays(): void {
    const fromDate = this.headerConfig.formGroup.get('operatingFromDate')?.value;
    const toDate = this.headerConfig.formGroup.get('operatingToDate')?.value;

    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);

      // Calcular días laborables (excluyendo fines de semana)
      const workingDays = this.calculateWorkingDays(from, to);

      this.headerConfig.formGroup.patchValue({
        operatingDaysCalculated: workingDays,
      });
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
    // Asegurar que las fechas estén en el orden correcto
    const start = new Date(Math.min(startDate.getTime(), endDate.getTime()));
    const end = new Date(Math.max(startDate.getTime(), endDate.getTime()));

    let workingDays = 0;
    const currentDate = new Date(start);

    // Iterar día por día desde la fecha de inicio hasta la fecha de fin
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();

      // Contar solo días laborables (lunes = 1, martes = 2, ..., viernes = 5)
      // Excluir sábado (6) y domingo (0)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        workingDays++;
      }

      // Avanzar al siguiente día
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDays;
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

    this.updateValidations();
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

  // Método para enviar el formulario
  onSubmit() {
    // Validar formulario
    if (this.headerConfig.formGroup.invalid) {
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
    // Horario de merienda
    const snackFrom: string = toTimeString(formValues.snackFrom);
    const snackTo: string = toTimeString(formValues.snackTo);

    // Horario de cena
    const dinnerFrom: string = toTimeString(formValues.dinnerFrom);
    const dinnerTo: string = toTimeString(formValues.dinnerTo);
    // Horario de merienda nocturna
    const snackNightFrom: string = toTimeString(formValues.snackNightFrom);
    const snackNightTo: string = toTimeString(formValues.snackNightTo);

    // Niveles educativos (MÚLTIPLE SELECCIÓN)
    const educationLevelIds: number[] = formValues.educationLevels?.map((level: any) => level.id) || [];
    // Tipo de organización
    const organizationTypeId: number = formValues.organizationType?.id;
    // Días de operación
    // Tipo de cocina
    const kitchenTypeId: number = formValues.kitchenType?.id;
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

    // Obtener los valores del formulario
    const schoolRequest: SchoolRequest = {
      // Agencia Id
      agencyId: this.agencyId,
      // Información General / General Information
      // Nombre de la escuela - Campo requerido para identificar la escuela
      // School name - Required field for identifying the school
      name: formValues.name,
      // Dirección física - Campo requerido para la ubicación de la escuela
      // Physical address - Required field for school location
      address: formValues.address,
      // Ciudad - Campo requerido para la ubicación de la escuela
      // City - Required field for school location
      cityId: cityId,
      // Región - Campo requerido para la ubicación de la escuela
      // Region - Required field for school location
      regionId: regionId,
      // Código postal - Campo requerido para la ubicación de la escuela
      // ZIP code - Required field for school location
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
      // Información Administrativa / Administrative Information
      // Niveles educativos - Campo requerido para tipo de escuela (MÚLTIPLE SELECCIÓN)
      // Education levels - Required field for school type (MULTIPLE SELECTION)
      //educationLevelIds: educationLevelIds,
      // Tipo de organización - Campo requerido para clasificación de la escuela
      // Organization type - Required field for school classification
      organizationTypeId: organizationTypeId,
      // Tipo de centro - Campo requerido para clasificación de la escuela (Orfanato/Centro de tratamiento residencial para salud mental/Centro Correccional Juvenil)
      // Center type - Required field for school classification
      centerTypeId: centerTypeId,
      // Fechas de funcionamiento - Fechas desde y hasta cuando opera la escuela
      // Operating dates - Dates from and to when the school operates
      operatingFromDate: formValues.operatingFromDate ?? null,
      operatingToDate: formValues.operatingToDate ?? null,
      operatingDaysCalculated: formValues.operatingDaysCalculated ?? null,
      // Información Operacional / Operational Information
      // Tipo de cocina - Campo requerido para servicio de alimentos
      // Kitchen type - Required field for food service
      kitchenTypeId: kitchenTypeId,
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

      // Información de Contacto / Contact Information
      // Nombre del administrador autorizado - Campo para contacto
      // Authorized administrator name - Contact field
      administratorAuthorizedName: formValues.administratorAuthorizedName ?? null,
      // Teléfono del sitio - Campo para contacto
      // Site phone - Contact field
      sitePhone: formValues.sitePhone ?? null,
      // Extensión - Campo para contacto
      // Extension - Contact field
      extension: formValues.extension ?? null,
      // Teléfono móvil - Campo para contacto
      // Mobile phone - Contact field
      mobilePhone: formValues.mobilePhone ?? null,
      // Servicios y Horarios / Services and Schedules
      // Desayuno - Indicador de servicio
      // Breakfast - Service indicator
      //breakfast: formValues.breakfast ?? null,
      // Horario desde para el desayuno
      // Breakfast schedule from
      //breakfastFrom: breakfastFrom ?? null,
      // Horario hasta para el desayuno
      // Breakfast schedule to
      //breakfastTo: breakfastTo ?? null,
      // Almuerzo - Indicador de servicio
      // Lunch - Service indicator
      //lunch: formValues.lunch ?? null,
      // Horario desde para el almuerzo
      // Lunch schedule from
      //lunchFrom: lunchFrom ?? null,
      // Horario hasta para el almuerzo
      // Lunch schedule to
      //lunchTo: lunchTo ?? null,
      // Merienda - Indicador de servicio
      // Snack - Service indicator
      //snack: formValues.snack ?? null,
      // Horario desde para la merienda
      // Snack schedule from
      //snackFrom: snackFrom ?? null,
      // Horario hasta para la merienda
      // Snack schedule to
      //snackTo: snackTo ?? null,

      // Cena - Indicador de servicio
      // Dinner - Service indicator
      //dinner: formValues.dinner ?? null,
      // Horario desde para la cena
      // Dinner schedule from
      //dinnerFrom: dinnerFrom ?? null,
      // Horario hasta para la cena
      // Dinner schedule to
      //dinnerTo: dinnerTo ?? null,
      // Merienda nocturna - Indicador de servicio
      // Snack night - Service indicator
      //snackNight: formValues.snackNight ?? null,
      // Horario desde para la merienda nocturna
      // Snack night schedule from
      //snackNightFrom: snackNightFrom ?? null,
      // Horario hasta para la merienda nocturna
      // Snack night schedule to
      //snackNightTo: snackNightTo ?? null,

      // Comunidad
      // Community
      communityId: formValues.communityId ?? null,
      // Caminantes
      // Walkers
      walkersId: formValues.walkersId ?? null,
      // Tipo de sitio
      // Site type
      siteTypeId: formValues.siteTypeId ?? null,
      // Experiencia
      // Experience
      experienceId: formValues.experienceId ?? null,
      // Resultado de revisión
      // Review result
      reviewResultId: formValues.reviewResultId ?? null,
      // Fecha de revisión
      // Review date
      reviewDate: formValues.reviewDate ?? null,
      // Justificación de revisión
      // Review justification
      reviewJustification: formValues.reviewJustification ?? null,

      // Si la escuela es la principal
      // If the school is the main school
      isMainSchool: this.isMainSchool,
    };

    this.isLoading = true;

    // Disable the form
    this.headerConfig.formGroup.disable();

    this._schoolService.insertSchool(schoolRequest, {}).subscribe({
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
      error: () => {
        this._notificationService.showErrorDialog();
        this.headerConfig.formGroup.enable();
      },
      complete: () => {
        this.isLoading = false;
        // Enable the form
        this.headerConfig.formGroup.enable();
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
  onCancel() {
    this._customRouter.navigate(['schools/list']);
  }

  // Método para agregar una escuela satélite
  onTableAddSatelliteSchool(event: Event, element: any) {
    console.log('onTableAddSatelliteSchool', event, element);
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
            const naKitchenType = this.kitchenTypes.find(kt =>
              kt.name === 'N/A' || kt.nameEN === 'N/A'
            );

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
              if (this.listPostalRegions.length === 1) {
                // Asignar automáticamente la única región encontrada para Dirección Postal
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
}
