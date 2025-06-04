import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
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
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { optionSelectionData } from 'app/shared/common-data';
import { OptionSelection } from 'app/shared/models/OptionSelection';
import { GenericTableConfig } from 'app/shared/components/generic-table/generic-table.interface';
import { MatTableDataSource } from '@angular/material/table';
import { SATELLITE_SCHOOLS_COLUMNS_SCHEMA } from './columns-schema';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { GroupTypeService } from 'app/shared/services/group-type.service';
import { SponsorTypeService } from 'app/shared/services/sponsor-type.service';
import { compare, comparePostal, isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { City } from 'app/shared/models/City';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { Region } from 'app/shared/models/Region';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { SchoolRequest } from 'app/shared/models/Request/SchoolRequest';

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
    TranslocoModule,
    MatDatepickerModule,
    GenericTableComponent,
    MatTooltipModule,
    MatIconModule,
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
  private _translocoService = inject(TranslocoService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _groupTypeService = inject(GroupTypeService);
  private _sponsorTypeService = inject(SponsorTypeService);
  // catálogos
  listCities: City[] = [];
  listRegions: Region[] = [];
  listPostalRegions: Region[] = [];

  // catálogos
  organizationTypes = [];
  educationLevels = [];
  operatingPeriods = [];
  deliveryTypes: OptionSelection[] = optionSelectionData.filter((option) => option.optionKey === 'typesOfDelivery');
  sponsorTypes: OptionSelection[] = optionSelectionData.filter((option) => option.optionKey === 'typesOfSponsor');
  applicantTypes: OptionSelection[] = optionSelectionData.filter((option) => option.optionKey === 'typesOfApplicant');
  operatingPolicies: OptionSelection[] = optionSelectionData.filter((option) => option.optionKey === 'typesOfOperatingPolicy');
  facilities = [];
  schools = [];
  isLoading = false;

  kitchenTypes: OptionSelection[] = optionSelectionData.filter((option) => option.optionKey === 'typesOfKitchen');
  groupTypes: OptionSelection[] = optionSelectionData.filter((option) => option.optionKey === 'typesOfGroup');
  currentLang: string = 'es';

  headerConfig: GenericHeaderConfig = {
    title: 'schools.add.title',
    formGroup: this._formBuilder.group({
      name: ['', Validators.required], // Nombre de la escuela

      address: ['', Validators.required], // Dirección física
      zipCode: ['', Validators.required], // Código postal
      city: [null, Validators.required], // Ciudad
      region: [null, Validators.required], // Región
      latitude: [null, Validators.required], // Latitud
      longitude: [null, Validators.required], // Longitud

      // Copiar dirección física
      sameAsPhysicalAddress: [false],

      // Dirección postal
      postalAddress: [''], // Dirección postal
      postalZipCode: [''], // Código postal
      postalCity: [null, Validators.required], // Ciudad
      postalRegion: [null, Validators.required], // Región

      startDate: [null], // Fecha de inicio de la escuela
      areaCode: [''], // Código de área
      adminFullName: [''], // Nombre del administrador
      phone: [''], // Teléfono
      phoneExtension: [''], // Extensión de teléfono
      mobile: [''], // Teléfono móvil
      baseYear: [null], // Año base
      nextRenewalYear: [null], // Año de renovación
      organizationTypeId: [null, Validators.required], // Tipo de organización
      educationLevelId: [null, Validators.required], // Nivel de educación
      operatingPeriodId: [null, Validators.required], // Periodo de operación
      kitchenTypeId: [null], // Tipo de cocina
      groupTypeId: [null], // Tipo de grupo
      deliveryTypeId: [null], // Tipo de entrega
      sponsorTypeId: [null], // Tipo de patrocinador
      applicantTypeId: [null], // Tipo de solicitante
      operatingPolicyId: [null], // Política de operación
      facilityIds: [[]], // multi-select
      satelliteSchoolIds: [[]], // multi-select
    }),
    saveButtonShow: true,
    saveButtonText: 'schools.add.buttons.save',
    cancelButtonShow: true,
    cancelButtonText: 'schools.add.buttons.cancel',
  };

  satelliteSchoolsConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<any>(),
    columnsSchema: SATELLITE_SCHOOLS_COLUMNS_SCHEMA,
    displayedColumns: SATELLITE_SCHOOLS_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    addButtonShow: true,
    addButtonLabel: 'schools.add.buttons.addSatelliteSchool',
    addButtonTooltip: 'schools.add.buttons.addSatelliteSchoolTooltip',
    addButtonTooltipPosition: 'above',
    addButtonIcon: 'add',
    tableId: 'satelliteSchoolsTable',
    onAddButtonClick: (event: Event) => this.onTableAddSatelliteSchool(event, null),
  };

  // Agregar esta propiedad
  protected readonly window = window;

  // Compare methods
  compare = compare;
  comparePostal = comparePostal;

  constructor() {}

  ngOnInit(): void {
    this.isLoading = true;

    // Transloco
    this._translocoService.langChanges$.pipe(takeUntil(this._unsubscribeAll)).subscribe((lang: string) => {
      this.currentLang = lang;
    });

    // Cities
    this._geoService.cities$.pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(response)) {
        this.listCities = response.body.data;
        this._changeDetectorRef.detectChanges();
      }
    });

    // Regions
    this._geoService.regions$.pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(response)) {
        this.listRegions = response.body.data;
        this._changeDetectorRef.detectChanges();
      }
    });

    // Group types
    this._groupTypeService.groupTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(response)) {
        this.groupTypes = response.body.data;
        this._changeDetectorRef.detectChanges();
      }
    });

    // Sponsor types
    this._sponsorTypeService.sponsorTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(response)) {
        this.sponsorTypes = response.body.data;
        this._changeDetectorRef.detectChanges();
      }
    });

    // this._organizationTypeService.organizationTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
    //   this.organizationTypes = res.body?.data || [];
    // });

    // this._educationLevelService.educationLevels$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
    //   this.educationLevels = res.body?.data || [];
    // });

    // this._operatingPeriodService.operatingPeriods$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
    //   this.operatingPeriods = res.body?.data || [];
    // });

    // this._facilityService.facilities$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
    //   this.facilities = res.body?.data || [];
    // });

    // this._operatingPolicyService.operatingPolicies$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
    //   this.operatingPolicies = res.body?.data || [];
    // });
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
    if (this.headerConfig.formGroup.invalid) {
        this._snackBar.open('Por favor, complete todos los campos requeridos', 'Cerrar', { duration: 3000 });
        this.headerConfig.formGroup.markAllAsTouched();
        return;
    }

    const formValues = this.headerConfig.formGroup.value;
    const cityId: number = formValues.city?.id;
    const regionId: number = formValues.region?.id;
    const postalCityId: number = formValues.postalCity?.id;
    const postalRegionId: number = formValues.postalRegion?.id;

    // Obtener los valores del formulario
    const schoolRequest: SchoolRequest = {
      name: formValues.name,
      address: formValues.address,
      zipCode: formValues.zipCode,
      cityId: cityId,
      regionId: regionId,
      postalAddress: formValues.postalAddress || null,
      postalZipCode: formValues.postalZipCode || null,
      postalCityId: postalCityId || null,
      postalRegionId: postalRegionId || null,
      educationLevelId: formValues.educationLevelId,
      organizationTypeId: formValues.organizationTypeId,
      operatingPeriodId: formValues.operatingPeriodId,
      kitchenTypeId: formValues.kitchenTypeId,
      groupTypeId: formValues.groupTypeId,
      deliveryTypeId: formValues.deliveryTypeId,
      sponsorTypeId: formValues.sponsorTypeId,
      applicantTypeId: formValues.applicantTypeId,
      operatingPolicyId: formValues.operatingPolicyId,
    };

    this.isLoading = true;
    this._schoolService.insertSchool(this.headerConfig.formGroup.value, {}).subscribe({
      next: () => {
        this._snackBar.open('Escuela creada correctamente', 'Cerrar', { duration: 3000 });
        this._customRouter.navigate(['schools/list']);
      },
      error: (err) => {
        this._snackBar.open('Error al crear la escuela: ' + (err?.error?.message || err), 'Cerrar', { duration: 5000 });
        this.isLoading = false;
      },
    });
  }

  onCancel() {
    this._customRouter.navigate(['schools/list']);
  }

  onTableAddSatelliteSchool(event: Event, element: any) {
    console.log('onTableAddSatelliteSchool', event, element);
  }

  // Método para obtener todas las regiones según el ID de la ciudad
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
