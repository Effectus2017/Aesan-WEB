import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
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
import { OperatingPeriodService } from 'app/shared/services/operating-period.service';
import { FacilityService } from 'app/shared/services/facility.service';
import { OperatingPolicyService } from 'app/shared/services/operating-policy.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { NgForOf, NgIf } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

// Importar servicios de catálogos cuando existan
// import { CityService, RegionService, ... } from 'app/shared/services/...';

@Component({
  selector: 'app-schools-add',
  templateUrl: './add.component.html',
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

  ],
})
export class AddSchoolComponent implements OnInit, OnGenericHeaderHandlers {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _formBuilder = inject(UntypedFormBuilder);
  private _schoolService = inject(SchoolService);
  private _geoService = inject(GeoService);
  private _organizationTypeService = inject(OrganizationTypeService);
  private _educationLevelService = inject(EducationLevelService);
  private _operatingPeriodService = inject(OperatingPeriodService);
  private _facilityService = inject(FacilityService);
  private _operatingPolicyService = inject(OperatingPolicyService);
  private _snackBar = inject(MatSnackBar);
  private _customRouter = inject(CustomRouterService);

  // catálogos
  cities = [];
  regions = [];
  organizationTypes = [];
  educationLevels = [];
  operatingPeriods = [];
  kitchenTypes = [];
  groupTypes = [];
  deliveryTypes = [];
  sponsorTypes = [];
  applicantTypes = [];
  operatingPolicies = [];
  facilities = [];
  schools = [];
  isLoading = false;

  headerConfig: GenericHeaderConfig = {
    title: 'Agregar Escuela',
    formGroup: this._formBuilder.group({
      name: ['', Validators.required],
      startDate: [null],
      address: ['', Validators.required],
      postalAddress: [''],
      zipCode: ['', Validators.required],
      cityId: [null, Validators.required],
      regionId: [null, Validators.required],
      areaCode: [''],
      adminFullName: [''],
      phone: [''],
      phoneExtension: [''],
      mobile: [''],
      baseYear: [null],
      nextRenewalYear: [null],
      organizationTypeId: [null, Validators.required],
      educationLevelId: [null, Validators.required],
      operatingPeriodId: [null, Validators.required],
      kitchenTypeId: [null],
      groupTypeId: [null],
      deliveryTypeId: [null],
      sponsorTypeId: [null],
      applicantTypeId: [null],
      operatingPolicyId: [null],
      facilityIds: [[]], // multi-select
      satelliteSchoolIds: [[]], // multi-select
    }),
    saveButtonShow: true,
    saveButtonText: 'Crear',
    cancelButtonShow: true,
    cancelButtonText: 'Cancelar',
  };

  constructor() {}

  ngOnInit(): void {
    this.isLoading = true;

    this._geoService.cities$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
      this.cities = res.body?.data || [];
    });

    this._geoService.regions$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
      this.regions = res.body?.data || [];
    });

    this._organizationTypeService.organizationTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
      this.organizationTypes = res.body?.data || [];
    });

    this._educationLevelService.educationLevels$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
      this.educationLevels = res.body?.data || [];
    });

    this._operatingPeriodService.operatingPeriods$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
      this.operatingPeriods = res.body?.data || [];
    });

    this._facilityService.facilities$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
      this.facilities = res.body?.data || [];
    });

    this._operatingPolicyService.operatingPolicies$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
      this.operatingPolicies = res.body?.data || [];
    });
    // Cargar catálogos opcionales si existen
    // this.kitchenTypeService.getAllKitchenTypesFromDb({ take: 1000, skip: 0 }).subscribe((res: any) => {
    //   this.kitchenTypes = res.body?.data || [];
    // });
    // this.groupTypeService.getAllGroupTypesFromDb({ take: 1000, skip: 0 }).subscribe((res: any) => {
    //   this.groupTypes = res.body?.data || [];
    // });
    // this.deliveryTypeService.getAllDeliveryTypesFromDb({ take: 1000, skip: 0 }).subscribe((res: any) => {
    //   this.deliveryTypes = res.body?.data || [];
    // });
    // this.sponsorTypeService.getAllSponsorTypesFromDb({ take: 1000, skip: 0 }).subscribe((res: any) => {
    //   this.sponsorTypes = res.body?.data || [];
    // });
    // this.applicantTypeService.getAllApplicantTypesFromDb({ take: 1000, skip: 0 }).subscribe((res: any) => {
    //   this.applicantTypes = res.body?.data || [];
    // });
    this.isLoading = false;
  }

  onSubmit() {
    if (this.headerConfig.formGroup.invalid) return;
    this.isLoading = true;
    this._schoolService.insertSchool(this.headerConfig.formGroup.value, {}).subscribe({
      next: () => {
        this._snackBar.open('Escuela creada correctamente', 'Cerrar', { duration: 3000 });
        this._customRouter.navigate(['schools/list']);
      },
      error: (err) => {
        this._snackBar.open('Error al crear la escuela: ' + (err?.error?.message || err), 'Cerrar', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  onCancel() {
    this._customRouter.navigate(['schools/list']);
  }
}
