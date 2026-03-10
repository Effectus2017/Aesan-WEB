import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { TranslocoModule } from '@ngneat/transloco';
import { isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { CENTERS_COLUMNS_SCHEMA } from './columns-schema';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericTableConfig, GenericFilterResult } from 'app/shared/components/generic-table/generic-table.interface';
import { GenericFilterDrawerComponent } from 'app/shared/components/generic-filter-drawer/generic-filter-drawer.component';
import { OnGenericFilterHandlers } from 'app/shared/components/generic-filter-panel/generic-filter-panel.interface';
import { CENTERS_FILTERS_SCHEMA } from './filters-schema';
import { SchoolService } from 'app/shared/services/school.service';
import { School } from 'app/shared/models/school/School';
import { AuthService } from 'app/core/auth/auth.service';
import { AddCenterModalComponent } from '../add-modal/add-center-modal.component';
import { EditCenterModalComponent } from '../edit-modal/edit-center-modal.component';
import { SitesCentersModalComponent } from '../sites-centers-modal/sites-modal.component';

@Component({
  selector: 'app-list-centers',
  templateUrl: './list.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatTableModule,
    MatInputModule,
    RouterModule,
    GenericTableComponent,
    GenericHeaderComponent,
    GenericFilterDrawerComponent,
    TranslocoModule,
  ],
})
export class ListCentersComponent implements OnInit, OnDestroy, OnGenericTableHandler, OnGenericHeaderHandlers, OnGenericFilterHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _schoolService = inject(SchoolService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _authService = inject(AuthService);
  private _route = inject(ActivatedRoute);
  private _dialog = inject(MatDialog);
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  @ViewChild('filterDrawer') filterDrawer!: GenericFilterDrawerComponent;
  filtersSchema = CENTERS_FILTERS_SCHEMA;
  appliedFilters: GenericFilterResult = {};

  headerConfig: GenericHeaderConfig = {
    title: 'centers.list.title',
    formGroup: this._formBuilder.group({
      name: new FormControl(''),
      schoolCode: new FormControl(''),
    }),
    searchFieldShow: false,
    searchInputPlaceholder: 'centers.list.search.placeholder',
    submitButtonText: 'centers.list.buttons.save',
    filterButtonShow: true,
    filterButtonTooltip: 'global.tooltips.header.filter',
    customButtonShow: true,
    customButtonClass: 'bg-[#F39B1A] text-white',
    customButtonIcon: 'add',
    customButtonIconEnabled: true,
    customButtonPermission: 'school.create',
  };

  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<School>(),
    columnsSchema: CENTERS_COLUMNS_SCHEMA,
    displayedColumns: CENTERS_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 25,
    pageSizeOptions: [25, 50, 100],
    length: 0,
    fullScreen: true,
  };

  constructor() {}

  ngOnInit() {
    // Get data from resolver instead of subscribing
    const resolvedData = this._route.snapshot.data['data'];

    if (resolvedData) {
      this.tableConfig.dataSource.data = resolvedData.centers.data;
      this.tableConfig.length = resolvedData.centers.count;
      this.tableConfig.dataSourceList = resolvedData.centers.data;
      this._changeDetectorRef.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onSearch(): void {}

  onFilter(): void {
    this.filterDrawer?.toggle();
  }

  onFiltersApply(filters: GenericFilterResult): void {
    this.appliedFilters = { ...filters };
    this.filterDrawer?.close();
    this.getAll(0);
    this._changeDetectorRef.markForCheck();
  }

  onFiltersReset(): void {
    this.appliedFilters = {};
    this.getAll(0);
    this._changeDetectorRef.markForCheck();
  }

  getAll(index: number): void {
    const pageSize = this.tableConfig.pageSize;
    const agencyId = this._authService.getAgencyId();

    const requestParameters: QueryParameters = {
      take: pageSize,
      skip: index,
      alls: false,
      agencyId: agencyId,
      ...this.appliedFilters,
    };

    this._schoolService.getCentersByAgencyId(requestParameters)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response: any) => {
          this.tableConfig.dataSource.data = response.body.data;
          this.tableConfig.length = response.body.count;
          this.tableConfig.dataSourceList = response.body.data;
          this._changeDetectorRef.markForCheck();
        },
        error: (error) => {
          console.error('Error loading centers list:', error);
        }
      });
  }

  getPaginator(event?: PageEvent): void {
    const index = !isNullOrUndefinedEmptyStringNullArray(event?.pageIndex) ? event.pageIndex : 0;
    this.tableConfig.pageSize = event?.pageSize || this.tableConfig.pageSize;
    this.getAll(index * this.tableConfig.pageSize);
  }

  onClean(_event: Event): void {}

  onCustom() {
    this.openAddCenterModal();
  }

  private openAddCenterModal(): void {
    const dialogRef = this._dialog.open(AddCenterModalComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: {
        // Additional data can be passed if needed
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // If center was created successfully, reload the list
        this.getAll(0);
        this._changeDetectorRef.markForCheck();
      }
    });
  }

  onTableEditModal(event: Event, centerId: number): void {
    event.stopPropagation();
    event.preventDefault();
    this.openEditCenterModal(centerId);
  }

  private openEditCenterModal(centerId: number): void {
    const center = this.tableConfig.dataSource.data.find(s => s.id === centerId);

    const dialogRef = this._dialog.open(EditCenterModalComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: {
        centerId: centerId,
        centerName: center?.name || ''
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getAll(0);
        this._changeDetectorRef.markForCheck();
      }
    });
  }

  onTableSites(event: Event, centerId: number) {
    event.stopPropagation();
    event.preventDefault();
    this.openSitesModal(centerId);
  }

  private openSitesModal(centerId: number): void {
    // Get center name from table
    const center = this.tableConfig.dataSource.data.find(s => s.id === centerId);
    const centerName = center?.name || '';

    // Open modal - SitesModalComponent now handles data loading internally
    const dialogRef = this._dialog.open(SitesCentersModalComponent, {
      width: '80%',
      maxWidth: '1200px',
      data: {
        schoolId: centerId,
        schoolName: centerName
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      // No additional actions needed when closing the modal
    });
  }
}

