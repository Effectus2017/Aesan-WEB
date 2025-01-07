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
import { School } from 'app/shared/models/School';
import { EducationLevel } from 'app/shared/models/EducationLevel';
import { OperatingPeriod } from 'app/shared/models/OperatingPeriod';
import { City } from 'app/shared/models/City';
import { Region } from 'app/shared/models/Region';
import { OrganizationType } from 'app/shared/models/OrganizationType';
import { Facility } from 'app/shared/models/Facility';
import { MealType } from 'app/shared/models/MealType';
import { SchoolRequest } from 'app/shared/models/Request/SchoolRequest';

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

  // Listas para los selects
  educationLevels: EducationLevel[] = [
    { id: 1, name: 'Kinder' },
    { id: 2, name: 'Elementar' },
    { id: 3, name: 'Intermedio' },
    { id: 4, name: 'Superior' }
  ];

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

    // TODO: Cargar datos de los selects desde el servicio
    this.loadSelectData();
  }

  ngOnDestroy(): void {}

  loadSelectData(): void {
    // TODO: Implementar llamadas al servicio para cargar los datos de los selects
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.form.disable();

      const schoolRequest: SchoolRequest = {
        Name: this.form.get('Name').value,
        EducationLevelId: this.form.get('EducationLevelId').value,
        OperatingPeriodId: this.form.get('OperatingPeriodId').value,
        Address: this.form.get('Address').value,
        CityId: this.form.get('CityId').value,
        RegionId: this.form.get('RegionId').value,
        ZipCode: this.form.get('ZipCode').value,
        OrganizationTypeId: this.form.get('OrganizationTypeId').value,
        FacilityIds: this.form.get('FacilityIds').value,
        MealTypeIds: this.form.get('MealTypeIds').value
      };

      if (this.data.isTemporary) {
        this.matDialogRef.close(schoolRequest);
      }
    }
  }

  discard(): void {
    this.matDialogRef.close();
  }
}
