import { ChangeDetectorRef, Component, inject, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { Subject, takeUntil } from 'rxjs';
import { provideNativeDateAdapter } from '@angular/material/core';
import { NgIf, NgForOf } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Site } from 'app/shared/models/Site';
import { SiteService } from 'app/shared/services/site.service';
import { GeoService } from 'app/shared/services/geo.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
import { OptionSelection } from 'app/shared/models/OptionSelection';
import { City } from 'app/shared/models/City';
import { Region } from 'app/shared/models/Region';
import { OrganizationType } from 'app/shared/models/OrganizationType';
import { EducationLevelResponse } from 'app/shared/models/Response/EducationLevelResponse';
import { CenterType } from 'app/shared/models/CenterType';
import { DeliveryType } from 'app/shared/models/DeliveryType';
import { SponsorType } from 'app/shared/models/SponsorType';
import { OperatingPolicy } from 'app/shared/models/OperatingPolicy';
import { AreaType } from 'app/shared/models/AreaType';
import { Agency } from 'app/shared/models/Agency';
import { KitchenType } from 'app/shared/models/KitchenType';
import { GroupType } from 'app/shared/models/GroupType';
import { SiteRequest } from 'app/shared/models/Request/SiteRequest';
import { SiteEducationLevelRequest } from 'app/shared/models/Request/SiteEducationLevelRequest';
import { SitePersonInChargeRequest } from 'app/shared/models/Request/SitePersonInChargeRequest';
import { compareById, isNullOrUndefinedEmptyStringNullArray, toTimeString } from 'app/shared/utils';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { OrganizationTypeService } from 'app/shared/services/organization-type.service';
import { EducationLevelService } from 'app/shared/services/education-level.service';
import { CenterTypeService } from 'app/shared/services/center-type.service';
import { DeliveryTypeService } from 'app/shared/services/delivery-type.service';
import { SponsorTypeService } from 'app/shared/services/sponsor-type.service';
import { OperatingPolicyService } from 'app/shared/services/operating-policy.service';
import { AreaTypeService } from 'app/shared/services/area-type.service';
import { AgencyService } from 'app/shared/services/agency.service';
import { AuthService } from 'app/core/auth/auth.service';
import { KitchenTypeService } from 'app/shared/services/kitchen-type.service';
import { GroupTypeService } from 'app/shared/services/group-type.service';
import { FieldVisibilityService } from 'app/shared/services/field-visibility.service';
import { PROGRAM_IDS } from 'app/shared/const';
import { NumericOnlyDirective } from 'app/shared/directives/numeric-only.directive';
import { PhoneFormatDirective } from 'app/shared/directives/phone-format.directive';
import { puertoRicoPhoneValidator } from 'app/shared/validators/puerto-rico-phone.validator';
import { puertoRicoZipCodeValidator } from 'app/shared/validators/puerto-rico-zip-code.validator';
import { PuertoRicoZipCodeDirective } from 'app/shared/directives/puerto-rico-zip-code.directive';
import { LatitudeDirective } from 'app/shared/directives/latitude.directive';
import { LongitudeDirective } from 'app/shared/directives/longitude.directive';

export interface SiteEditModalData {
  site: Site;
  agency?: Agency;
}

@Component({
  selector: 'app-site-edit-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatDatepickerModule,
    MatTimepickerModule,
    ReactiveFormsModule,
    TranslocoModule,
    NgIf,
    NgForOf,
    MatTooltipModule,
    NumericOnlyDirective,
    PhoneFormatDirective,
    PuertoRicoZipCodeDirective,
    LatitudeDirective,
    LongitudeDirective,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './site-edit-modal.component.html',
})
export class SiteEditModalComponent implements OnInit, OnDestroy {
  private _formBuilder = inject(UntypedFormBuilder);
  private _siteService = inject(SiteService);
  private _geoService = inject(GeoService);
  private _organizationTypeService = inject(OrganizationTypeService);
  private _educationLevelService = inject(EducationLevelService);
  private _centerTypeService = inject(CenterTypeService);
  private _deliveryTypeService = inject(DeliveryTypeService);
  private _sponsorTypeService = inject(SponsorTypeService);
  private _operatingPolicyService = inject(OperatingPolicyService);
  private _areaTypeService = inject(AreaTypeService);
  private _agencyService = inject(AgencyService);
  private _authService = inject(AuthService);
  private _notificationService = inject(NotificationService);
  private _translocoService = inject(TranslocoService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _optionSelectionService = inject(OptionSelectionService);
  private _kitchenTypeService = inject(KitchenTypeService);
  private _groupTypeService = inject(GroupTypeService);
  private _fieldVisibilityService = inject(FieldVisibilityService);
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // Form
  form = this._formBuilder.group({
    name: ['', Validators.required],
    address: ['', Validators.required],
    city: [null, Validators.required],
    region: [null, Validators.required],
    zipCode: ['', [Validators.required, puertoRicoZipCodeValidator()]],
    latitude: [null, Validators.required],
    longitude: [null, Validators.required],
    sameAsPhysicalAddress: [false],
    postalAddress: [''],
    postalCity: [null, Validators.required],
    postalRegion: [null, Validators.required],
    postalZipCode: ['', puertoRicoZipCodeValidator()],
    nonProfit: [null, Validators.required],
    startDate: [null],
    baseYear: [{ value: null, disabled: true }, [Validators.pattern(/^[\d]{4}$/)]],
    renewalYear: [{ value: null, disabled: true }, [Validators.pattern(/^[\d]{4}$/)]],
    organizationType: [null, Validators.required],
    centerType: [null, Validators.required],
    educationLevels: [[], Validators.required],
    operatingFromDate: [null],
    operatingToDate: [null],
    operatingDaysCalculated: [{ value: null, disabled: true }],
    serviceTime: [null],
    kitchenType: [null],
    siteLocation: [null],
    groupType: [null],
    deliveryType: [null],
    sponsorType: [null],
    typeOfApplicant: [null],
    typeOfResidential: [null],
    areaType: [{ value: null, disabled: true }],
    locationType: [null, Validators.required],
    operatingPolicy: [null],
    hasWarehouse: [false],
    hasDiningRoom: [false],
    personInCharge: this._formBuilder.group({
      firstName: ['', Validators.required],
      middleName: [''],
      fatherLastName: ['', Validators.required],
      motherLastName: [''],
      sitePhone: ['', [Validators.required, puertoRicoPhoneValidator()]],
      extension: [''],
      mobilePhone: ['', puertoRicoPhoneValidator()],
    }),
    community: [null],
    walkers: [null],
    siteType: [null],
    experience: [null],
    reviewResult: [null],
    reviewDate: [null],
    reviewJustification: [null],
    isActive: [true],
    inactiveJustification: [{ value: '', disabled: true }],
    inactiveDate: [{ value: null, disabled: true }],
    generalEnrollment: [null, [Validators.pattern(/^\d+$/)]],
    organizedAthleticPrograms: [null],
    atRiskService: [null],
    publicAllianceContractId: [null],
    siteCode: [{ value: '', disabled: true }],
  });

  // Lists
  listCities: City[] = [];
  listRegions: Region[] = [];
  listPostalRegions: Region[] = [];
  yesNoOptions: OptionSelection[] = [];
  organizationTypes: OrganizationType[] = [];
  educationLevels: EducationLevelResponse[] = [];
  centerTypes: CenterType[] = [];
  deliveryTypes: DeliveryType[] = [];
  sponsorType: SponsorType[] = [];
  typeOfApplicant: OptionSelection[] = [];
  typeOfResidential: OptionSelection[] = [];
  operatingPolicies: OperatingPolicy[] = [];
  kitchenTypes: KitchenType[] = [];
  siteLocations: OptionSelection[] = [];
  groupTypes: GroupType[] = [];
  community: OptionSelection[] = [];
  walkers: OptionSelection[] = [];
  siteType: OptionSelection[] = [];
  experience: OptionSelection[] = [];
  reviewResult: OptionSelection[] = [];
  publicAllianceContractOptions: OptionSelection[] = [];
  areaTypes: AreaType[] = [];
  locationTypes: AreaType[] = [];
  isActive: OptionSelection[] = [];
  // Day Care Home options
  relationshipTypeOptions: OptionSelection[] = [];
  homeTypeOptions: OptionSelection[] = [];
  participantTypeOptions: OptionSelection[] = [];
  distributionType: OptionSelection[] = [];

  // Program properties
  isPDAM: boolean = false;
  isPSAV: boolean = false;
  isPACNA: boolean = false;
  isPFHF: boolean = false;
  isPDFE: boolean = false;
  isAESAN: boolean = false;
  isDayCareHome: boolean = false;
  isDayCareHomeId: number | null = null;
  showCenterTypeField: boolean = false;
  showResidentialTypeField: boolean = false;

  currentLang: string = 'es';
  agencyId: number = 0;
  agency: Agency | null = null;
  isLoading: boolean = false;

  compareById = compareById;

  constructor(
    public dialogRef: MatDialogRef<SiteEditModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SiteEditModalData
  ) {
    this.currentLang = this._translocoService.getActiveLang();
    this.agencyId = this._authService.getAgencyId();
  }

  ngOnInit(): void {
    // Configurar FieldVisibilityService SOLO para distributionType
    this._fieldVisibilityService.setActiveConfig('sites');

    this.setupForm();
    this.loadLists();
    this.loadAgencyData();
    this.loadOptionSelections();
    // Load data after lists are loaded
    setTimeout(() => {
      this.loadData();
    }, 100);
  }

  private loadOptionSelections(): void {
    // Load options using getOptionSelectionByOptionKey like the original component
    this._optionSelectionService.getOptionSelectionByOptionKey({
      optionKey: 'yesNo,typeOfResidential,typeOfApplicant,isActive,community,walkers,services,distributionType,siteType,experience,reviewResult,relationshipType,homeType,participantType,siteLocation,publicAllianceContract',
      names: null,
    }).subscribe();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  private loadData(): void {
    if (this.data.site) {
      this.setFormValues(this.data.site);
    }
  }

  private setupForm(): void {
    // Listen to sameAsPhysicalAddress changes
    this.form.get('sameAsPhysicalAddress')?.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((value) => {
      if (value) {
        const address = this.form.get('address')?.value;
        const city = this.form.get('city')?.value;
        const region = this.form.get('region')?.value;
        const zipCode = this.form.get('zipCode')?.value;

        this.form.patchValue({
          postalAddress: address || '',
          postalCity: city || null,
          postalRegion: region || null,
          postalZipCode: zipCode || '',
        });
      }
    });

    // Listen to isActive changes
    this.form.get('isActive')?.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((value) => {
      const inactiveJustificationControl = this.form.get('inactiveJustification');

      if (value === false) {
        this.form.get('inactiveDate')?.enable();
        inactiveJustificationControl?.enable();
        inactiveJustificationControl?.setValidators([Validators.required]);
      } else {
        // Si el sitio está activo, limpiar validadores y valores
        inactiveJustificationControl?.clearValidators();
        inactiveJustificationControl?.setValue('');
        this.form.get('inactiveDate')?.setValue(null);
        this.form.get('inactiveDate')?.disable();
        inactiveJustificationControl?.disable();
      }
      this.form.get('inactiveDate')?.updateValueAndValidity();
      inactiveJustificationControl?.updateValueAndValidity();
    });

    // Listen to city changes for regions
    this.form.get('city')?.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((city) => {
      if (city) {
        this.getRegionsByCityId(city, 'region');
        this.getAreaTypeByCity(city);
      }
    });

    // Listen to postalCity changes for postal regions
    this.form.get('postalCity')?.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((city) => {
      if (city) {
        this.getRegionsByCityId(city, 'postalRegion');
      }
    });

    // Listen to operating dates changes for calculating days
    this.form.get('operatingFromDate')?.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
      this.calculateOperatingDays();
    });

    this.form.get('operatingToDate')?.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
      this.calculateOperatingDays();
    });

    // Listen to groupType changes for distributionType validation and siteLocation
    this.form.get('groupType')?.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((groupType) => {
      this.updateDistributionTypeValidation();
      this.getSiteLocationByGroupType(groupType);
      this._changeDetectorRef.detectChanges();
    });

    // Listen to organizationType changes for centerType visibility
    this.form.get('organizationType')?.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((organizationType: OrganizationType) => {
      this.updateCenterTypeFieldVisibility(organizationType);
      this._changeDetectorRef.detectChanges();
    });
  }

  private loadLists(): void {
    // Request parameters like the original component
    const requestParameters: QueryParameters = {
      take: 25,
      skip: 0,
      alls: true,
      isList: true,
    };

    // Cities - Load using getCitiesFromDb like the original component
    this._geoService.getCitiesFromDb(requestParameters).subscribe();
    this._geoService.cities$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result.body)) {
        this.listCities = result.body;
      }
    });

    // Regions - Load using getRegionsFromDb like the original component
    this._geoService.getRegionsFromDb(requestParameters).subscribe();
    this._geoService.regions$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result.body)) {
        this.listRegions = result.body;
        this.listPostalRegions = result.body;
      }
    });

    // Organization Types - Load using getAllOrganizationTypesFromDb like the original component
    this._organizationTypeService.getAllOrganizationTypesFromDb(requestParameters).subscribe();
    this._organizationTypeService.organizationTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.organizationTypes = result.body;
      }
    });

    // Education Levels - Load using getAllEducationLevelsFromDb like the original component
    this._educationLevelService.getAllEducationLevelsFromDb(requestParameters).subscribe();
    this._educationLevelService.educationLevels$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.educationLevels = result.body;
      }
    });

    // Center Types - Load using getAllCenterTypesFromDb like the original component
    this._centerTypeService.getAllCenterTypesFromDb(requestParameters).subscribe();
    this._centerTypeService.centerTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.centerTypes = result.body;
      }
    });

    // Delivery Types - Load using getAllDeliveryTypesFromDb like the original component
    this._deliveryTypeService.getAllDeliveryTypesFromDb(requestParameters).subscribe();
    this._deliveryTypeService.deliveryTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.deliveryTypes = result.body;
      }
    });

    // Sponsor Types - Load using getAllSponsorTypesFromDb like the original component
    this._sponsorTypeService.getAllSponsorTypesFromDb(requestParameters).subscribe();
    this._sponsorTypeService.sponsorTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.sponsorType = result.body;
      }
    });

    // Operating Policies - Load using getAllOperatingPoliciesFromDb like the original component
    this._operatingPolicyService.getAllOperatingPoliciesFromDb(requestParameters).subscribe();
    this._operatingPolicyService.operatingPolicies$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.operatingPolicies = result.body;
      }
    });

    // Area Types - Load using getAllAreaTypesFromDb like the original component
    this._areaTypeService.getAllAreaTypesFromDb(requestParameters).subscribe();
    this._areaTypeService.areaTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.areaTypes = result.body;
        this.locationTypes = result.body; // Location types are the same as area types
      }
    });

    // Kitchen Types - Load using getAllKitchenTypesFromDb like the original component
    this._kitchenTypeService.getAllKitchenTypesFromDb(requestParameters).subscribe();
    this._kitchenTypeService.kitchenTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        // Kitchen types come from service, but also filter from options
        if (result.body && result.body.length > 0) {
          this.kitchenTypes = result.body;
        }
      }
    });

    // Group Types - Load using getAllGroupTypesFromDb like the original component
    this._groupTypeService.getAllGroupTypesFromDb(requestParameters).subscribe();
    this._groupTypeService.groupTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        // Group types come from service, but also filter from options
        if (result.body && result.body.length > 0) {
          this.groupTypes = result.body;
        }
      }
    });

    // Option Selections - Filter from options like the original component
    this._optionSelectionService.options$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        const options = result.body?.data || result.body || [];
        this.yesNoOptions = options.filter((opt: OptionSelection) => opt.optionKey === 'yesNo');
        this.typeOfApplicant = options.filter((opt: OptionSelection) => opt.optionKey === 'typeOfApplicant');
        this.typeOfResidential = options.filter((opt: OptionSelection) => opt.optionKey === 'typeOfResidential');
        // Kitchen types and group types come from services, not from options
        // this.kitchenTypes = options.filter((opt: OptionSelection) => opt.optionKey === 'kitchenType');
        // this.groupTypes = options.filter((opt: OptionSelection) => opt.optionKey === 'groupType');
        this.siteLocations = options.filter((opt: OptionSelection) => opt.optionKey === 'siteLocation');
        this.community = options.filter((opt: OptionSelection) => opt.optionKey === 'community');
        this.walkers = options.filter((opt: OptionSelection) => opt.optionKey === 'walkers');
        this.siteType = options.filter((opt: OptionSelection) => opt.optionKey === 'siteType');
        this.experience = options.filter((opt: OptionSelection) => opt.optionKey === 'experience');
        this.reviewResult = options.filter((opt: OptionSelection) => opt.optionKey === 'reviewResult');
        this.publicAllianceContractOptions = options.filter((opt: OptionSelection) => opt.optionKey === 'publicAllianceContract');
        this.isActive = options.filter((opt: OptionSelection) => opt.optionKey === 'isActive');
        this.distributionType = options.filter((opt: OptionSelection) => opt.optionKey === 'distributionType');
        // Day Care Home options
        this.relationshipTypeOptions = options.filter((opt: OptionSelection) => opt.optionKey === 'relationshipType');
        this.homeTypeOptions = options.filter((opt: OptionSelection) => opt.optionKey === 'homeType');
        this.participantTypeOptions = options.filter((opt: OptionSelection) => opt.optionKey === 'participantType');

        // After loading options, update form values if site data exists
        if (this.data.site) {
          this.updateFormValuesWithOptions();
        }
      }
    });
  }

  private updateFormValuesWithOptions(): void {
    const site = this.data.site;
    if (!site) return;

    // Update form with option objects found by IDs
    const updates: any = {};

    if (site.communityId && this.community.length > 0) {
      updates.community = this.community.find((c) => c.id === site.communityId) || null;
    }

    if (site.walkersId && this.walkers.length > 0) {
      updates.walkers = this.walkers.find((w) => w.id === site.walkersId) || null;
    }

    if (site.siteTypeId && this.siteType.length > 0) {
      updates.siteType = this.siteType.find((st) => st.id === site.siteTypeId) || null;
    }

    if (site.experienceId && this.experience.length > 0) {
      updates.experience = this.experience.find((e) => e.id === site.experienceId) || null;
    }

    if (site.reviewResultId && this.reviewResult.length > 0) {
      updates.reviewResult = this.reviewResult.find((r) => r.id === site.reviewResultId) || null;
    }

    if (Object.keys(updates).length > 0) {
      this.form.patchValue(updates);
    }
  }

  private loadAgencyData(): void {
    if (this.data.agency) {
      this.agency = this.data.agency;
      const programs = this.agency.programs || [];
      this.determineVisibleFields(programs);
      this.setIsDayCareHome();
      // IMPORTANTE: Re-ejecutar updateValidations después de establecer isDayCareHome
      // para asegurar que las validaciones se apliquen correctamente
      this.updateValidations();
    } else if (this.data.site?.agencyId) {
      // Load agency by ID
      const queryParameters: QueryParameters = {
        agencyId: this.data.site.agencyId,
      };
      this._agencyService.getAgencyById(queryParameters).subscribe({
        next: (result: any) => {
          if (result?.body) {
            this.agency = result.body;
            const programs = this.agency.programs || [];
            this.determineVisibleFields(programs);
            this.setIsDayCareHome();
            // IMPORTANTE: Re-ejecutar updateValidations después de establecer isDayCareHome
            // para asegurar que las validaciones se apliquen correctamente
            this.updateValidations();
          }
        },
        error: (error) => {
          console.error('Error loading agency:', error);
        },
      });
    } else {
      // Load agency from service
      this._agencyService.agency$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
        if (!isNullOrUndefinedEmptyStringNullArray(result)) {
          this.agency = result.body;
          const programs = this.agency?.programs || [];
          this.determineVisibleFields(programs);
          this.setIsDayCareHome();
          // IMPORTANTE: Re-ejecutar updateValidations después de establecer isDayCareHome
          // para asegurar que las validaciones se apliquen correctamente
          this.updateValidations();
        }
      });
    }
  }

  private determineVisibleFields(programs: any[]): void {
    this.isPDAM = programs.some((p) => p.id === PROGRAM_IDS.PDAM);
    this.isPSAV = programs.some((p) => p.id === PROGRAM_IDS.PSAV);
    this.isPACNA = programs.some((p) => p.id === PROGRAM_IDS.PACNA);
    this.isPFHF = programs.some((p) => p.id === PROGRAM_IDS.PFHF);
    this.isPDFE = programs.some((p) => p.id === PROGRAM_IDS.PDFE);
    this.isAESAN = programs.some((p) => p.id === PROGRAM_IDS.AESAN);
    this._changeDetectorRef.detectChanges();
  }

  private setIsDayCareHome(): void {
    if (this.agency?.inscription?.isDayCareHome) {
      const isDayCareHomeOption = this.agency.inscription.isDayCareHome;
      this.isDayCareHomeId = isDayCareHomeOption?.id || null;
      this.isDayCareHome = isDayCareHomeOption
        ? (isDayCareHomeOption.booleanValue === true || isDayCareHomeOption.booleanValue == null)
        : false;
    } else {
      this.isDayCareHomeId = null;
      this.isDayCareHome = false;
    }
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
        const control = this.form.get(fieldName);
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
    };

    Object.keys(requiredFields).forEach((fieldName) => {
      const control = this.form.get(fieldName);
      if (control) {
        control.setValidators(requiredFields[fieldName]);
        control.updateValueAndValidity();
      }
    });

    // educationLevels solo es requerido para PDAM
    const educationLevelsControl = this.form.get('educationLevels');
    if (educationLevelsControl) {
      if (this.isPDAM) {
        educationLevelsControl.setValidators([Validators.required]);
      } else {
        educationLevelsControl.clearValidators();
      }
      educationLevelsControl.updateValueAndValidity();
    }

    // Campos específicos de PACNA - requeridos solo cuando es PACNA y no es Day Care Home
    if (this.isPACNA && !this.isDayCareHome) {
      const pacnaFields = {
        organizedAthleticPrograms: [Validators.required],
        atRiskService: [Validators.required],
        publicAllianceContractId: [Validators.required],
      };

      Object.keys(pacnaFields).forEach((fieldName) => {
        const control = this.form.get(fieldName);
        if (control) {
          control.setValidators(pacnaFields[fieldName]);
          control.updateValueAndValidity();
        }
      });
    } else {
      // Limpiar validadores de campos PACNA si no es PACNA o es Day Care Home
      const pacnaFieldsToClear = ['organizedAthleticPrograms', 'atRiskService', 'publicAllianceContractId'];
      pacnaFieldsToClear.forEach((fieldName) => {
        const control = this.form.get(fieldName);
        if (control) {
          control.clearValidators();
          control.updateValueAndValidity();
        }
      });
    }

    // Restaurar validación de centerType solo si el organizationType actual lo requiere
    const organizationType = this.form.get('organizationType')?.value as OrganizationType;
    const centerTypeControl = this.form.get('centerType');
    if (centerTypeControl) {
      if (organizationType?.requiresCenterType) {
        centerTypeControl.setValidators([Validators.required]);
      } else {
        centerTypeControl.clearValidators();
      }
      centerTypeControl.updateValueAndValidity();
    }
  }

  shouldShowDayCareFields(): boolean {
    return this.isDayCareHome && this.isPACNA;
  }

  private setFormValues(site: Site): void {
    // Establecer isDayCareHomeId del sitio si existe
    if (site.isDayCareHomeId) {
      this.isDayCareHomeId = site.isDayCareHomeId;
      if (site.isDayCareHome) {
        this.isDayCareHome = site.isDayCareHome.booleanValue === true || site.isDayCareHome.booleanValue == null;
      }
    }

    this.form.patchValue({
      name: site.name || '',
      address: site.address || '',
      city: site.city || null,
      region: site.region || null,
      zipCode: site.zipCode || '',
      latitude: site.latitude || null,
      longitude: site.longitude || null,
      sameAsPhysicalAddress: site.sameAsPhysicalAddress || false,
      postalAddress: site.postalAddress || '',
      postalCity: site.postalCity || null,
      postalRegion: site.postalRegion || null,
      postalZipCode: site.postalZipCode || '',
      nonProfit: site.nonProfit || null,
      startDate: site.startDate || null,
      baseYear: site.baseYear || null,
      renewalYear: site.renewalYear || null,
      organizationType: site.organizationType || null,
      centerType: site.centerType || null,
      educationLevels: site.educationLevels || [],
      operatingFromDate: site.operatingFromDate || null,
      operatingToDate: site.operatingToDate || null,
      operatingDaysCalculated: site.operatingDaysCalculated || null,
      serviceTime: site.serviceTime || null,
      kitchenType: site.kitchenType || null,
      siteLocation: site.siteLocation || null,
      groupType: site.groupType || null,
      deliveryType: site.deliveryType || null,
      sponsorType: site.sponsorType || null,
      typeOfApplicant: site.typeOfApplicant || null,
      typeOfResidential: site.residentialType || null,
      areaType: site.areaType || null,
      locationType: site.locationType || null,
      operatingPolicy: site.operatingPolicy || null,
      hasWarehouse: site.hasWarehouse || false,
      hasDiningRoom: site.hasDiningRoom || false,
      personInCharge: site.personInCharge ? {
        firstName: site.personInCharge.firstName || '',
        middleName: site.personInCharge.middleName || '',
        fatherLastName: site.personInCharge.fatherLastName || '',
        motherLastName: site.personInCharge.motherLastName || '',
        sitePhone: site.personInCharge.sitePhone || '',
        extension: site.personInCharge.extension || '',
        mobilePhone: site.personInCharge.mobilePhone || '',
      } : {
        firstName: '',
        middleName: '',
        fatherLastName: '',
        motherLastName: '',
        sitePhone: '',
        extension: '',
        mobilePhone: '',
      },
      community: null, // Will be set in updateFormValuesWithOptions
      walkers: null, // Will be set in updateFormValuesWithOptions
      siteType: null, // Will be set in updateFormValuesWithOptions
      experience: null, // Will be set in updateFormValuesWithOptions
      reviewResult: null, // Will be set in updateFormValuesWithOptions
      reviewDate: site.reviewDate || null,
      reviewJustification: site.reviewJustification || null,
      isActive: site.isActive ?? true,
      inactiveJustification: site.inactiveJustification || '',
      inactiveDate: site.inactiveDate || null,
      generalEnrollment: site.generalEnrollment || null,
      organizedAthleticPrograms: site.organizedAthleticPrograms || null,
      atRiskService: site.atRiskService || null,
      publicAllianceContractId: site.publicAllianceContractId || null,
      siteCode: site.siteCode || '',
    });

    // Update validations based on isActive
    if (site.isActive === false) {
      this.form.get('inactiveDate')?.enable();
      this.form.get('inactiveJustification')?.enable();
      this.form.get('inactiveJustification')?.setValidators([Validators.required]);
    }

    // Si hay una ciudad, obtener el tipo de área automáticamente
    if (site.city) {
      this.getAreaTypeByCity(site.city);
    }

    // Asegurar que el campo areaType permanezca deshabilitado
    this.form.get('areaType')?.disable();

    // Actualizar validaciones dinámicas después de cargar los datos
    const groupType = this.form.get('groupType')?.value;
    if (groupType) {
      this.updateDistributionTypeValidation();
      this.getSiteLocationByGroupType(groupType);
    }

    const organizationType = this.form.get('organizationType')?.value as OrganizationType;
    if (organizationType) {
      this.updateCenterTypeFieldVisibility(organizationType);
    }

    // Calcular días operativos automáticamente si es necesario
    this.calculateOperatingDaysIfNeeded();
  }

  private calculateOperatingDaysIfNeeded(): void {
    const operatingDaysCalculated = this.form.get('operatingDaysCalculated')?.value;
    const operatingFromDate = this.form.get('operatingFromDate')?.value;
    const operatingToDate = this.form.get('operatingToDate')?.value;

    // Si operatingDaysCalculated es null, 0 o undefined, pero existen las fechas, calcular automáticamente
    if ((operatingDaysCalculated === null || operatingDaysCalculated === 0 || operatingDaysCalculated === undefined) &&
        operatingFromDate && operatingToDate) {
      this.calculateOperatingDays();
    }
  }

  private calculateOperatingDays(): void {
    const fromDateValue = this.form.get('operatingFromDate')?.value;
    const toDateValue = this.form.get('operatingToDate')?.value;

    if (fromDateValue && toDateValue) {
      try {
        // Convert form values to Date objects if they aren't already
        const fromDate = fromDateValue instanceof Date ? fromDateValue : new Date(fromDateValue);
        const toDate = toDateValue instanceof Date ? toDateValue : new Date(toDateValue);

        // Validate that the conversion was successful
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
          console.warn('Invalid date values provided for operating days calculation');
          this.form.patchValue({
            operatingDaysCalculated: null,
          });
          return;
        }

        const workingDays = this.calculateWorkingDays(fromDate, toDate);

        this.form.patchValue({
          operatingDaysCalculated: workingDays,
        });
      } catch (error) {
        console.error('Error calculating working days:', error);
        this.form.patchValue({
          operatingDaysCalculated: null,
        });
      }
    } else {
      this.form.patchValue({
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

  private updateDistributionTypeValidation(): void {
    const groupType = this.form.get('groupType')?.value;
    const distributionTypeControl = this.form.get('distributionType');

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

  /**
   * Actualiza la visibilidad del campo Tipo de Centro y Tipo de Institución Residencial basado en el tipo de organización seleccionado
   */
  private updateCenterTypeFieldVisibility(organizationType: OrganizationType): void {
    const centerTypeControl = this.form.get('centerType');

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

      // Habilitar Tipo de Institución Residencial cuando el tipo de organización es "Institución Residencial"
      this.showResidentialTypeField = organizationType.name === 'Institución Residencial' || organizationType.nameEN === 'Residential Institution';

      // Si no es Institución Residencial, limpiar el valor del campo
      if (!this.showResidentialTypeField) {
        this.form.get('typeOfResidential')?.setValue(null);
      }
    } else {
      this.showCenterTypeField = false;
      this.showResidentialTypeField = false;
      centerTypeControl?.clearValidators();
      centerTypeControl?.updateValueAndValidity();
    }
  }

  getSiteLocationByGroupType(groupType: GroupType): void {
    if (!groupType) {
      this.siteLocations = [];
      return;
    }

    const queryParameters: QueryParameters = {
      groupTypeId: groupType.id,
    };

    this._groupTypeService.getSiteLocationByGroupType(queryParameters).subscribe({
      next: (response) => {
        if (response) {
          this.siteLocations = response.body;

          // Auto-seleccionar el Site Location obtenido (solo hay uno por Group Type)
          if (this.siteLocations && this.siteLocations.length > 0) {
            this.form.patchValue({ siteLocation: this.siteLocations[0] });
          }

          this._changeDetectorRef.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error al cargar Site Location:', error);
      },
    });
  }

  getRegionsByCityId(city: City, fieldName: 'region' | 'postalRegion'): void {
    if (city?.id) {
      const queryParameters: QueryParameters = {
        cityId: city.id,
        isList: true,
      };
      this._geoService.getRegionsByCityId(queryParameters).subscribe({
        next: (result: any) => {
          if (!isNullOrUndefinedEmptyStringNullArray(result.body)) {
            if (fieldName === 'region') {
              this.listRegions = result.body;
            } else {
              this.listPostalRegions = result.body;
            }
            this._changeDetectorRef.detectChanges();
          }
        },
        error: (error) => {
          console.error('Error loading regions:', error);
        },
      });
    }
  }

  getAreaTypeByCity(city: City): void {
    if (city?.id) {
      const queryParameters: QueryParameters = {
        cityId: city.id,
      };
      this._areaTypeService.getAreaTypeByCity(queryParameters).subscribe({
        next: (result: any) => {
          if (result?.body) {
            this.form.patchValue({ areaType: result.body });
          }
        },
        error: (error) => {
          console.error('Error loading area type:', error);
        },
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSave(): void {
    if (this.form.invalid) {
      this._notificationService.showError('Por favor, complete todos los campos requeridos');
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValues = this.form.value;

    const siteRequest: SiteRequest = {
      id: this.data.site.id,
      agencyId: this.agencyId,
      name: formValues.name || '',
      address: formValues.address || '',
      cityId: formValues.city?.id || 0,
      regionId: formValues.region?.id || 0,
      zipCode: formValues.zipCode || '',
      sameAsPhysicalAddress: formValues.sameAsPhysicalAddress ?? null,
      postalAddress: formValues.postalAddress || null,
      postalCityId: formValues.postalCity?.id || null,
      postalRegionId: formValues.postalRegion?.id || null,
      postalZipCode: formValues.postalZipCode || null,
      latitude: formValues.latitude ?? null,
      longitude: formValues.longitude ?? null,
      organizationTypeId: formValues.organizationType?.id || 0,
      centerTypeId: formValues.centerType?.id || null,
      educationLevels: (formValues.educationLevels || []).map((level: any) => ({
        siteId: this.data.site.id,
        educationLevelId: level.id,
      })) as SiteEducationLevelRequest[],
      operatingFromDate: formValues.operatingFromDate ?? null,
      operatingToDate: formValues.operatingToDate ?? null,
      operatingDaysCalculated: formValues.operatingDaysCalculated ?? null,
      serviceTime: formValues.serviceTime ?? null,
      kitchenTypeId: formValues.kitchenType?.id || null,
      siteLocationId: formValues.siteLocation?.id || null,
      groupTypeId: formValues.groupType?.id || null,
      deliveryTypeId: formValues.deliveryType?.id || null,
      sponsorTypeId: formValues.sponsorType?.id ?? null,
      applicantTypeId: formValues.typeOfApplicant?.id || null,
      operatingPolicyId: formValues.operatingPolicy?.id || null,
      residentialTypeId: formValues.typeOfResidential?.id || null,
      areaTypeId: formValues.areaType?.id || null,
      locationTypeId: formValues.locationType?.id || 0,
      nonProfit: formValues.nonProfit ?? null,
      startDate: formValues.startDate ?? null,
      baseYear: formValues.baseYear ?? null,
      renewalYear: formValues.renewalYear ?? null,
      hasWarehouse: formValues.hasWarehouse ?? null,
      hasDiningRoom: formValues.hasDiningRoom ?? null,
      personInCharge: formValues.personInCharge ? {
        firstName: formValues.personInCharge.firstName ?? null,
        middleName: formValues.personInCharge.middleName ?? null,
        fatherLastName: formValues.personInCharge.fatherLastName ?? null,
        motherLastName: formValues.personInCharge.motherLastName ?? null,
        sitePhone: formValues.personInCharge.sitePhone ?? null,
        extension: formValues.personInCharge.extension ?? null,
        mobilePhone: formValues.personInCharge.mobilePhone ?? null,
      } : null,
      communityId: formValues.community?.id ?? null,
      walkersId: formValues.walkers?.id ?? null,
      siteTypeId: formValues.siteType?.id ?? null,
      experienceId: formValues.experience?.id ?? null,
      reviewResultId: formValues.reviewResult?.id ?? null,
      reviewDate: formValues.reviewDate ?? null,
      reviewJustification: formValues.reviewJustification ?? null,
      isActive: formValues.isActive ?? true,
      inactiveJustification: formValues.inactiveJustification ?? null,
      inactiveDate: formValues.inactiveDate ?? null,
      generalEnrollment: formValues.generalEnrollment ?? null,
      organizedAthleticPrograms: formValues.organizedAthleticPrograms ?? null,
      atRiskService: formValues.atRiskService ?? null,
      publicAllianceContractId: formValues.publicAllianceContractId ?? null,
      isDayCareHomeId: this.isDayCareHomeId,
    };

    const queryParameters: QueryParameters = {
      agencyId: this.agencyId,
    };

    this._siteService.updateSite(siteRequest, queryParameters).subscribe({
      next: () => {
        this.isLoading = false;
        this._notificationService.showSuccess('Sitio actualizado exitosamente');
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.isLoading = false;
        this._notificationService.showError('Error al actualizar el sitio');
        console.error('Error updating site:', error);
      },
    });
  }
}

