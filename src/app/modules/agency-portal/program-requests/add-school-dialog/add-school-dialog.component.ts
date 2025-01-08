import { ChangeDetectorRef, Component, inject, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroupDirective, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslocoModule } from '@ngneat/transloco';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { NgFor, NgIf } from '@angular/common';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoService } from '@ngneat/transloco';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DarkModeTextDirective } from 'app/shared/directives/dark-mode-text.directive';
import { EducationLevel } from 'app/shared/models/EducationLevel';
import { OperatingPeriod } from 'app/shared/models/OperatingPeriod';
import { City } from 'app/shared/models/City';
import { Region } from 'app/shared/models/Region';
import { OrganizationType } from 'app/shared/models/OrganizationType';
import { Facility } from 'app/shared/models/Facility';
import { MealType } from 'app/shared/models/MealType';
import { SchoolRequest } from 'app/shared/models/Request/SchoolRequest';
import { EducationLevelService } from 'app/shared/services/education-level.service';
import { OperatingPeriodService } from 'app/shared/services/operating-period.service';
import { GeoService } from 'app/shared/services/geo.service';
import { OrganizationTypeService } from 'app/shared/services/organization-type.service';
import { FacilityService } from 'app/shared/services/facility.service';
import { MealTypeService } from 'app/shared/services/meal-type.service';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { QueryParameters } from 'app/shared/models/QueryParameters';

@Component({
  selector: 'add-school-dialog',
  templateUrl: './add-school-dialog.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
  standalone: true,
  imports: [
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    TextFieldModule,
    TranslocoModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatSelectModule,
    DarkModeTextDirective,
    NgIf,
    NgFor,
    MatOptionModule,
  ],
})
export class AddSchoolDialogComponent implements OnInit, OnDestroy {
  @ViewChild('formDirective') formView: FormGroupDirective;
  form: UntypedFormGroup;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // Listas para los selects
  educationLevels: EducationLevel[] = [];
  operatingPeriods: OperatingPeriod[] = [];
  cities: City[] = [];
  regions: Region[] = [];
  organizationTypes: OrganizationType[] = [];
  facilities: Facility[] = [];
  mealTypes: MealType[] = [];

  public matDialogRef: MatDialogRef<AddSchoolDialogComponent> = inject(MatDialogRef<AddSchoolDialogComponent>);
  private _formBuilder: UntypedFormBuilder = inject(UntypedFormBuilder);
  private _changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
  private _fuseConfirmationService = inject(FuseConfirmationService);
  private _translocoService = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);
  private _educationLevelService = inject(EducationLevelService);
  private _operatingPeriodService = inject(OperatingPeriodService);
  private _geoService = inject(GeoService);
  private _organizationTypeService = inject(OrganizationTypeService);
  private _facilityService = inject(FacilityService);
  private _mealTypeService = inject(MealTypeService);

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      schoolId: number;
      isTemporary?: boolean;
    }
  ) {}

  ngOnInit(): void {
    this.form = this._formBuilder.group({
      Name: ['', [Validators.required, Validators.maxLength(50)]],
      EducationLevelId: ['', [Validators.required]],
      OperatingPeriodId: ['', [Validators.required]],
      Address: ['', [Validators.required]],
      CityId: ['', [Validators.required]],
      RegionId: ['', [Validators.required]],
      ZipCode: ['', [Validators.required]],
      OrganizationTypeId: ['', [Validators.required]],
      FacilityIds: [[], [Validators.required]],
      MealTypeIds: [[], [Validators.required]]
    });

    this.loadSelectData();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  loadSelectData(): void {

    var queryParams: QueryParameters = {
      take: 25,
      skip: 0,
      alls: true
    };

    // Cargar datos en paralelo usando forkJoin
    forkJoin({
      educationLevels: this._educationLevelService.getAllEducationLevelsFromDb(queryParams).pipe(takeUntil(this._unsubscribeAll)),
      operatingPeriods: this._operatingPeriodService.getAllOperatingPeriodsFromDb(queryParams).pipe(takeUntil(this._unsubscribeAll)),
      cities: this._geoService.getCitiesFromDb(queryParams).pipe(takeUntil(this._unsubscribeAll)),
      regions: this._geoService.getRegionsFromDb(queryParams).pipe(takeUntil(this._unsubscribeAll)),
      organizationTypes: this._organizationTypeService.getAllOrganizationTypesFromDb(queryParams).pipe(takeUntil(this._unsubscribeAll)),
      facilities: this._facilityService.getAllFacilitiesFromDb(queryParams).pipe(takeUntil(this._unsubscribeAll)),
      mealTypes: this._mealTypeService.getAllMealTypesFromDb(queryParams).pipe(takeUntil(this._unsubscribeAll))
    }).subscribe({
      next: (responses) => {
        this.educationLevels = responses.educationLevels.body.data;
        this.operatingPeriods = responses.operatingPeriods.body.data;
        this.cities = responses.cities.body.data;
        this.regions = responses.regions.body.data;
        this.organizationTypes = responses.organizationTypes.body.data;
        this.facilities = responses.facilities.body.data;
        this.mealTypes = responses.mealTypes.body.data;
        this._changeDetectorRef.markForCheck();
      },
      error: (error) => {
        console.error('Error al cargar los datos:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.form.disable();

      const schoolRequest: SchoolRequest = {
        name: this.form.get('Name').value,
        educationLevelId: this.form.get('EducationLevelId').value,
        operatingPeriodId: this.form.get('OperatingPeriodId').value,
        address: this.form.get('Address').value,
        cityId: this.form.get('CityId').value,
        regionId: this.form.get('RegionId').value,
        zipCode: this.form.get('ZipCode').value,
        organizationTypeId: this.form.get('OrganizationTypeId').value,
        facilityIds: this.form.get('FacilityIds').value,
        mealTypeIds: this.form.get('MealTypeIds').value
      };

      if (this.data.isTemporary) {
        this.matDialogRef.close(schoolRequest);
      }
    }
  }

  onCancel(): void {
    this.matDialogRef.close();
  }
}
