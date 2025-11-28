import { ChangeDetectorRef, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { HouseholdService } from 'app/shared/services/household.service';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { GenericTableConfig, OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { MatTableDataSource } from '@angular/material/table';
import { READABILITY_MODULE_HOUSEHOLD_INCOME_CHILD_COLUMNS_SCHEMA, READABILITY_MODULE_HOUSEHOLD_INCOME_COLUMNS_SCHEMA, READABILITY_MODULE_HOUSEHOLD_MEMBERS_COLUMNS_SCHEMA } from './columns-schema';
import { MatDialog } from '@angular/material/dialog';
import { AddHouseholdIncomeDialogComponent } from '../add-household-income-dialog/add-household-income-dialog.component';
import { AddHouseholdMemberDialogComponent } from '../add-household-member-dialog/add-household-member-dialog.component';
import { optionSelectionData } from 'app/shared/common-data';
import { MatSelectModule } from '@angular/material/select';
import { City } from 'app/shared/models/City';
import { Region } from 'app/shared/models/Region';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { GeoService } from 'app/shared/services/geo.service';
import { HouseholdRequest } from 'app/shared/models/Request/HouseholdRequest';
import { PhoneFormatDirective } from 'app/shared/directives/phone-format.directive';
import { puertoRicoPhoneValidator } from 'app/shared/validators/puerto-rico-phone.validator';

@Component({
    selector: 'agency-portal-readability-module-add',
    templateUrl: './add.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCheckboxModule,
        CommonModule,
        MatSnackBarModule,
        GenericHeaderComponent,
        TranslocoModule,
        GenericTableComponent,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        PhoneFormatDirective
    ]
})
export class ReadabilityModuleComponent implements OnInit, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _householdService = inject(HouseholdService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _transloco = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);
  private _customRouterService = inject(CustomRouterService);
  private _dialog = inject(MatDialog);
  private _geoService = inject(GeoService);

  temporaryHouseholdMembers: any[] = [];
  temporaryHouseholdIncomes: any[] = [];
  temporaryHouseholdIncomesChild: any[] = [];

  listCities: City[] = [];
  listRegions: Region[] = [];

  isYesNoOptions = optionSelectionData.filter(option => option.optionKey === 'yesNo');

  headerConfig: GenericHeaderConfig = {
    title: 'readability-module.add.title',
    formGroup: this._formBuilder.group({
      street: [null, Validators.required],
      apartment: [null],
      city: [null, Validators.required],
      region: [null, Validators.required],
      zipCode: [null, Validators.required],
      phone: [null, puertoRicoPhoneValidator()],
      email: [null],
      completedBy: [null, Validators.required],
      completedDate: [null, Validators.required],
      isActive: [true],
      participationInSocialPrograms: [null, Validators.required],
      caseNumber: [null, Validators.required],
      firstName: [null, Validators.required],
      middleName: [null, Validators.required],
      fatherLastName: [null, Validators.required],
      motherLastName: [null, Validators.required],
      address: [null, Validators.required],
      todayDate: [new Date(), Validators.required],
    }),
    saveButtonShow: true,
    saveButtonText: 'global.buttons.save',
    cancelButtonShow: true,
    cancelButtonText: 'global.buttons.cancel',
    goToAddButtonShow: false,
  };

  tableHouseholdMembersConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<any>(),
    dataSourceList: [],
    columnsSchema: READABILITY_MODULE_HOUSEHOLD_MEMBERS_COLUMNS_SCHEMA,
    displayedColumns: READABILITY_MODULE_HOUSEHOLD_MEMBERS_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    addButtonShow: true,
    addButtonLabel: 'readability-module.add.buttons.addMember',
    addButtonTooltip: 'readability-module.add.buttons.addMemberTooltip',
    addButtonTooltipPosition: 'above',
    addButtonIcon: 'add',
    tableId: 'householdMembersTable',
    onAddButtonClick: (event: Event) => this.onTableAddHouseholdMembers(event, null),
  };

  tableHouseholdIncomeChildConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<any>(),
    dataSourceList: [],
    columnsSchema: READABILITY_MODULE_HOUSEHOLD_INCOME_CHILD_COLUMNS_SCHEMA,
    displayedColumns: READABILITY_MODULE_HOUSEHOLD_INCOME_CHILD_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    addButtonShow: true,
    addButtonLabel: 'readability-module.add.buttons.addIncome',
    addButtonTooltip: 'readability-module.add.buttons.addIncomeTooltip',
    addButtonTooltipPosition: 'above',
    addButtonIcon: 'add',
    tableId: 'householdIncomeChildTable',
    onAddButtonClick: (event: Event) => this.onTableAddHouseholdIncomeChild(event, null),
  };

  tableHouseholdIncomeConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<any>(),
    dataSourceList: [],
    columnsSchema: READABILITY_MODULE_HOUSEHOLD_INCOME_COLUMNS_SCHEMA,
    displayedColumns: READABILITY_MODULE_HOUSEHOLD_INCOME_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    addButtonShow: true,
    addButtonLabel: 'readability-module.add.buttons.addIncome',
    addButtonTooltip: 'readability-module.add.buttons.addIncomeTooltip',
    addButtonTooltipPosition: 'above',
    addButtonIcon: 'add',
    tableId: 'householdIncomeTable',
    onAddButtonClick: (event: Event) => this.onTableAddHouseholdIncome(event, null),
  };

  constructor() {}

  ngOnInit(): void {}

  onSave() {
    if (this.headerConfig.formGroup.valid) {
      const newHousehold = this.headerConfig.formGroup.value;

      this._householdService.insertHousehold(newHousehold, {}).subscribe(() => {
        this._snackBar.open('Módulo de legibilidad creado correctamente', 'Cerrar', { duration: 3000 });
        this._customRouterService.navigate(['agency-portal']);
      });
    } else {
      this.headerConfig.formGroup.markAllAsTouched();
    }
  }

  onCancel() {
    this._customRouterService.navigate(['agency-portal']);
  }

  onTableAddHouseholdMembers(event: Event, element: any) {
    console.log('onTableAdd', event, element);
    const dialogRef = this._dialog.open(AddHouseholdMemberDialogComponent, {
        data: {
          id: 0
        },
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
          console.log('result', result);
          this.temporaryHouseholdMembers.push(result);
          this.tableHouseholdMembersConfig.dataSource.data = this.temporaryHouseholdMembers;
          this._changeDetectorRef.markForCheck();
        }
      });
  }

  onTableAddHouseholdIncomeChild(event: Event, element: any) {
    console.log('onTableAdd', event, element);
    const dialogRef = this._dialog.open(AddHouseholdIncomeDialogComponent, {
        data: {
          id: 0,
          isChild: true,
        },
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
          console.log('result', result);
          this.temporaryHouseholdIncomesChild.push(result);
          this.tableHouseholdIncomeChildConfig.dataSource.data = this.temporaryHouseholdIncomesChild;
          this._changeDetectorRef.markForCheck();
        }
      });
  }

  onTableAddHouseholdIncome(event: Event, element: any) {
    console.log('onTableAdd', event, element);
    const dialogRef = this._dialog.open(AddHouseholdIncomeDialogComponent, {
        data: {
          id: 0,
          isChild: false,
        },
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
          console.log('result', result);
          this.temporaryHouseholdIncomes.push(result);
          this.tableHouseholdIncomeConfig.dataSource.data = this.temporaryHouseholdIncomes;
          this._changeDetectorRef.markForCheck();
        }
      });
  }

  compare(o1: any, o2: any): boolean {
    if (!isNullOrUndefinedEmptyStringNullArray(o2)) {
      return o1.Id === o2.Id;
    }
    return false;
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

        }
      },
      error: (error) => {
        console.error('Error al cargar las regiones:', error);
      },
    });
  }
}
