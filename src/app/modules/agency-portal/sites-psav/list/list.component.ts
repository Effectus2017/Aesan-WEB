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
import { fuseAnimations } from '@fuse/animations';
import { TranslocoModule } from '@ngneat/transloco';
import { isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { SITES_PSAV_COLUMNS_SCHEMA } from './columns-schema';
import { SITES_PSAV_FILTERS_SCHEMA } from './filters-schema';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericTableConfig, GenericFilterResult } from 'app/shared/components/generic-table/generic-table.interface';
import { GenericFilterDrawerComponent } from 'app/shared/components/generic-filter-drawer/generic-filter-drawer.component';
import { OnGenericFilterHandlers } from 'app/shared/components/generic-filter-panel/generic-filter-panel.interface';
import { SiteService } from 'app/shared/services/site.service';
import { SiteTableResponse } from 'app/shared/models/response/SiteTableResponse';
import { AuthService } from 'app/core/auth/auth.service';
import { PROGRAM_IDS } from 'app/shared/const';

@Component({
  selector: 'app-sites-psav-list',
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
export class SitesPsavListComponent implements OnInit, OnDestroy, OnGenericTableHandler, OnGenericHeaderHandlers, OnGenericFilterHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _siteService = inject(SiteService);
  private _customRouterService = inject(CustomRouterService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _authService = inject(AuthService);
  private _route = inject(ActivatedRoute);
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  @ViewChild('filterDrawer') filterDrawer!: GenericFilterDrawerComponent;
  filtersSchema = SITES_PSAV_FILTERS_SCHEMA;
  appliedFilters: GenericFilterResult = {};

  headerConfig: GenericHeaderConfig = {
    title: 'sites.list.title',
    formGroup: this._formBuilder.group({
      name: new FormControl(''),
    }),
    searchFieldShow: false,
    filterButtonShow: true,
    filterButtonTooltip: 'global.tooltips.header.filter',
    submitButtonText: 'sites.list.buttons.save',
    goToAddButtonShow: true,
    goToAddButtonPermission: 'site.create',
  };

  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<SiteTableResponse>(),
    columnsSchema: SITES_PSAV_COLUMNS_SCHEMA,
    displayedColumns: SITES_PSAV_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 15,
    pageSizeOptions: [15, 50, 100],
    length: 0,
    fullScreen: true,
  };

  constructor() {}

  ngOnInit() {
    // Obtener datos del resolver
    const resolvedData = this._route.snapshot.data['data'];

    if (resolvedData) {
      this.tableConfig.dataSource.data = resolvedData.sites.data;
      this.tableConfig.length = resolvedData.sites.count;
      this.tableConfig.dataSourceList = resolvedData.sites.data;
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
      programId: PROGRAM_IDS.PSAV,
      ...this.appliedFilters,
    };

    this._siteService.getAllSitesFromDb(requestParameters)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response: any) => {
          if (response && response.body) {
            this.tableConfig.dataSource.data = response.body.data || [];
            this.tableConfig.length = response.body.count || 0;
            this.tableConfig.dataSourceList = response.body.data || [];
            this._changeDetectorRef.markForCheck();
          }
        },
        error: (error) => {
          console.error('Error al obtener sitios:', error);
        }
      });
  }

  getPaginator(event?: PageEvent): void {
    const index = !isNullOrUndefinedEmptyStringNullArray(event?.pageIndex) ? event.pageIndex : 0;
    this.tableConfig.pageSize = event?.pageSize || this.tableConfig.pageSize;
    this.getAll(index * this.tableConfig.pageSize);
  }

  onClean(_event: Event): void {}

  onTableEdit(event: Event, id: number) {
    event.stopPropagation();
    event.preventDefault();
    this._customRouterService.navigate([`sites-psav/edit/${id}`]);
  }

  onTableCalendar(event: Event, id: number) {
    event.stopPropagation();
    event.preventDefault();
    this._customRouterService.navigate([`sites-psav/calendar/${id}`]);
  }

  onAdd() {
    this._customRouterService.navigate(['sites-psav/add']);
  }
}

