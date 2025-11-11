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
import { SiteRequest } from 'app/shared/models/Request/SiteRequest';
import { SiteEducationLevelRequest } from 'app/shared/models/Request/SiteEducationLevelRequest';
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
import { PROGRAM_IDS } from 'app/shared/const';

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
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // Form
  form = this._formBuilder.group({
    name: ['', Validators.required],
    address: ['', Validators.required],
    city: [null, Validators.required],
    region: [null, Validators.required],
    zipCode: ['', Validators.required],
    latitude: [null, Validators.required],
    longitude: [null, Validators.required],
    sameAsPhysicalAddress: [false],
    postalAddress: [''],
    postalCity: [null, Validators.required],
    postalRegion: [null, Validators.required],
    postalZipCode: [''],
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
    administratorAuthorizedName: ['', Validators.required],
    sitePhone: ['', Validators.required],
    extension: [''],
    mobilePhone: [''],
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
  kitchenTypes: OptionSelection[] = [];
  siteLocations: OptionSelection[] = [];
  groupTypes: OptionSelection[] = [];
  community: OptionSelection[] = [];
  walkers: OptionSelection[] = [];
  siteType: OptionSelection[] = [];
  experience: OptionSelection[] = [];
  reviewResult: OptionSelection[] = [];
  publicAllianceContractOptions: OptionSelection[] = [];
  areaTypes: AreaType[] = [];
  locationTypes: AreaType[] = [];
  isActive: OptionSelection[] = [];

  // Program properties
  isPDAM: boolean = false;
  isPSAV: boolean = false;
  isPACNA: boolean = false;
  isPFHF: boolean = false;
  isPDFE: boolean = false;
  isAESAN: boolean = false;
  isDayCareHome: boolean = false;
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
    const queryParameters: QueryParameters = {
      agencyId: this.agencyId,
    };
    this._optionSelectionService.getAllOptionSelections(queryParameters).subscribe();
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
      if (value === false) {
        this.form.get('inactiveDate')?.enable();
        this.form.get('inactiveJustification')?.enable();
        this.form.get('inactiveJustification')?.setValidators([Validators.required]);
      } else {
        this.form.get('inactiveDate')?.disable();
        this.form.get('inactiveJustification')?.disable();
        this.form.get('inactiveJustification')?.clearValidators();
      }
      this.form.get('inactiveDate')?.updateValueAndValidity();
      this.form.get('inactiveJustification')?.updateValueAndValidity();
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
  }

  private loadLists(): void {
    // Cities
    this._geoService.cities$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result.body)) {
        this.listCities = result.body;
      }
    });

    // Regions
    this._geoService.regions$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result.body)) {
        this.listRegions = result.body;
        this.listPostalRegions = result.body;
      }
    });

    // Organization Types
    this._organizationTypeService.organizationTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.organizationTypes = result.body;
      }
    });

    // Education Levels
    this._educationLevelService.educationLevels$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.educationLevels = result.body;
      }
    });

    // Center Types
    this._centerTypeService.centerTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.centerTypes = result.body;
      }
    });

    // Delivery Types
    this._deliveryTypeService.deliveryTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.deliveryTypes = result.body;
      }
    });

    // Sponsor Types
    this._sponsorTypeService.sponsorTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.sponsorType = result.body;
      }
    });

    // Operating Policies
    this._operatingPolicyService.operatingPolicies$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.operatingPolicies = result.body;
      }
    });

    // Area Types
    this._areaTypeService.areaTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.areaTypes = result.body;
      }
    });

    // Location Types (same as areaTypes)
    this._areaTypeService.areaTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.locationTypes = result.body;
      }
    });

    // Option Selections
    this._optionSelectionService.options$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        const options = result.body?.data || result || [];
        this.yesNoOptions = options.filter((opt: OptionSelection) => opt.optionKey === 'yesNo');
        this.typeOfApplicant = options.filter((opt: OptionSelection) => opt.optionKey === 'typeOfApplicant');
        this.typeOfResidential = options.filter((opt: OptionSelection) => opt.optionKey === 'typeOfResidential');
        this.kitchenTypes = options.filter((opt: OptionSelection) => opt.optionKey === 'kitchenType');
        this.siteLocations = options.filter((opt: OptionSelection) => opt.optionKey === 'siteLocation');
        this.groupTypes = options.filter((opt: OptionSelection) => opt.optionKey === 'groupType');
        this.community = options.filter((opt: OptionSelection) => opt.optionKey === 'community');
        this.walkers = options.filter((opt: OptionSelection) => opt.optionKey === 'walkers');
        this.siteType = options.filter((opt: OptionSelection) => opt.optionKey === 'siteType');
        this.experience = options.filter((opt: OptionSelection) => opt.optionKey === 'experience');
        this.reviewResult = options.filter((opt: OptionSelection) => opt.optionKey === 'reviewResult');
        this.publicAllianceContractOptions = options.filter((opt: OptionSelection) => opt.optionKey === 'publicAllianceContract');
        this.isActive = options.filter((opt: OptionSelection) => opt.optionKey === 'isActive');
        
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
      this.isDayCareHome = isDayCareHomeOption
        ? (isDayCareHomeOption.booleanValue === true || isDayCareHomeOption.booleanValue == null)
        : false;
    }
  }

  shouldShowDayCareFields(): boolean {
    return this.isDayCareHome && this.isPACNA;
  }

  private setFormValues(site: Site): void {
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
      locationType: site.locationType || null,
      operatingPolicy: site.operatingPolicy || null,
      hasWarehouse: site.hasWarehouse || false,
      hasDiningRoom: site.hasDiningRoom || false,
      administratorAuthorizedName: site.administratorAuthorizedName || '',
      sitePhone: site.sitePhone || '',
      extension: site.extension || '',
      mobilePhone: site.mobilePhone || '',
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
      administratorAuthorizedName: formValues.administratorAuthorizedName ?? null,
      sitePhone: formValues.sitePhone ?? null,
      extension: formValues.extension ?? null,
      mobilePhone: formValues.mobilePhone ?? null,
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
      isDayCareHome: this.isDayCareHome,
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

