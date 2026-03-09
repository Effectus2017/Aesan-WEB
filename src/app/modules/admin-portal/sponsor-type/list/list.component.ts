import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { fuseAnimations } from '@fuse/animations';
import { TranslocoModule } from '@ngneat/transloco';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { SPONSOR_TYPE_COLUMNS_SCHEMA } from './columns-schema';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { GenericFilterPanelComponent } from 'app/shared/components/generic-filter-panel/generic-filter-panel.component';
import { OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericTableConfig, GenericFilterResult } from 'app/shared/components/generic-table/generic-table.interface';
import { SponsorTypeService } from 'app/shared/services/sponsor-type.service';
import { SponsorType } from 'app/shared/models/catalog/SponsorType';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'app-admin-sponsor-type-list',
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
        GenericFilterPanelComponent,
        FuseDrawerComponent,
        TranslocoModule,
    ]
})
export class SponsorTypeListComponent implements OnInit, OnDestroy, OnGenericTableHandler, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _sponsorTypeService = inject(SponsorTypeService);
  private _customRouterService = inject(CustomRouterService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _authService = inject(AuthService);
  private _route = inject(ActivatedRoute);
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  @ViewChild('filterDrawer') filterDrawer!: FuseDrawerComponent;

  appliedFilters: GenericFilterResult = {};

  headerConfig: GenericHeaderConfig = {
    title: 'sponsor-type.list.title',
    formGroup: this._formBuilder.group({
      name: new FormControl(''),
    }),
    searchFieldShow: false,
    searchInputPlaceholder: 'sponsor-type.list.search.placeholder',
    submitButtonText: 'sponsor-type.list.buttons.save',
    goToAddButtonShow: true,
    // Configuración de tooltips y permisos directamente en cada botón
    searchButtonTooltip: 'global.tooltips.header.search',
    goToAddButtonTooltip: 'global.tooltips.header.add',
    goToAddButtonPermission: 'sponsor-type.create',
    // Configuración de botón de filtro
    filterButtonShow: true,
    filterButtonTooltip: 'global.tooltips.header.filter',
  };

  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<SponsorType>(),
    dataSourceList: [],
    columnsSchema: SPONSOR_TYPE_COLUMNS_SCHEMA,
    displayedColumns: SPONSOR_TYPE_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 15,
    pageSizeOptions: [15, 50, 100],
    length: 0,
    fullScreen: true,
  };

  constructor() {}

  ngOnInit() {
    // Obtener datos del resolver en lugar de suscribirse
    const resolvedData = this._route.snapshot.data['data'];

    if (resolvedData) {
      const dataWithOrder = resolvedData.sponsorTypes.data.map((item, idx) => ({ ...item, displayOrderUI: idx + 1 }));
      this.tableConfig.dataSource.data = dataWithOrder;
      this.tableConfig.length = resolvedData.sponsorTypes.count;
      this._changeDetectorRef.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

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
    const requestParameters: QueryParameters = {
      take: this.tableConfig.pageSize,
      skip: index,
      userId: this._authService.getUserId(),
      ...this.appliedFilters,
    };
    this._sponsorTypeService.getAllSponsorTypesFromDb(requestParameters).subscribe();
  }

  onTableEdit(event: Event, id: number) {
    event.stopPropagation();
    event.preventDefault();
    this._customRouterService.navigate([`sponsor-type/edit/${id}`]);
  }

  onAdd() {
    this._customRouterService.navigate(['sponsor-type/add']);
  }

  getPaginator(event?: PageEvent): void {
    const index = event && event.pageIndex !== undefined ? event.pageIndex : 0;
    this.tableConfig.pageSize = event?.pageSize ?? this.tableConfig.pageSize;
    this.getAll(index * this.tableConfig.pageSize);
  }
}
