import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { Subject } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { GenericFilterDrawerComponent } from 'app/shared/components/generic-filter-drawer/generic-filter-drawer.component';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { AGENCY_STATUS_HISTORY_COLUMNS_SCHEMA } from './columns-schema';
import { AGENCY_STATUS_HISTORY_FILTERS_SCHEMA } from './filters-schema';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { OnGenericFilterHandlers } from 'app/shared/components/generic-filter-panel/generic-filter-panel.interface';
import { OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericTableConfig, GenericFilterResult } from 'app/shared/components/generic-table/generic-table.interface';
import { TranslocoModule } from '@ngneat/transloco';
import { AgencyStatusHistoryService } from 'app/shared/services/agency-status-history.service';
import { AgencyStatusHistory } from 'app/shared/models/agency/AgencyStatusHistory';

@Component({
  selector: 'app-agency-status-history-list',
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
export class AgencyStatusHistoryListComponent implements OnInit, OnDestroy, OnGenericTableHandler, OnGenericHeaderHandlers, OnGenericFilterHandlers {
  // -----
  // @ Subject de desuscripción
  // -----
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // -----
  // @ Inyecciones privadas
  // -----
  private _formBuilder = inject(UntypedFormBuilder);
  private _agencyStatusHistoryService = inject(AgencyStatusHistoryService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _route = inject(ActivatedRoute);

  // -----
  // @ Variables
  // -----
  @ViewChild('filterDrawer') filterDrawer!: GenericFilterDrawerComponent;

  filtersSchema = AGENCY_STATUS_HISTORY_FILTERS_SCHEMA;
  appliedFilters: GenericFilterResult = {};

  headerConfig: GenericHeaderConfig = {
    title: 'agency-status-history.list.title',
    formGroup: this._formBuilder.group({
      name: new FormControl(''),
    }),
    searchFieldShow: false,
    goToAddButtonShow: false,
    searchInputPlaceholder: 'agency-status-history.list.search.placeholder',
    submitButtonText: 'agency-status-history.list.buttons.save',
    filterButtonTooltip: 'global.tooltips.header.filter',
  };

  // Configuración de la tabla
  tableConfig: GenericTableConfig<AgencyStatusHistory> = {
    dataSource: new MatTableDataSource<AgencyStatusHistory>([]),
    dataSourceList: [],
    columnsSchema: AGENCY_STATUS_HISTORY_COLUMNS_SCHEMA,
    displayedColumns: AGENCY_STATUS_HISTORY_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 25,
    pageSizeOptions: [25, 50, 100],
    length: 0,
    fullScreen: true,
  };

  // -----
  // @ Constructor
  // -----
  constructor() {}

  // -----
  // @ ngOnInit / ngOnDestroy
  // -----

  /** Inicializa el componente obteniendo los datos del resolver. */
  ngOnInit() {
    const resolvedData = this._route.snapshot.data['data'];

    if (resolvedData?.history) {
      const history = resolvedData.history;
      const body = history?.body ?? history;
      this.tableConfig.dataSource.data = body?.data ?? [];
      this.tableConfig.length = body?.count ?? 0;
      this.tableConfig.dataSourceList = body?.data ?? [];
      this._changeDetectorRef.markForCheck();
    }
  }

  /** Limpia las suscripciones al destruir el componente. */
  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // -----
  // @ Funciones On (componentes genéricos)
  // -----

  /** Ejecuta la búsqueda con los valores del formulario del header. */
  onSearch() {
    if (this.headerConfig.formGroup?.valid) {
      const header = this.headerConfig.formGroup?.value ?? {};
      this.appliedFilters = { ...this.appliedFilters, ...header };
      this.getAll(0);
    }
  }

  /** Abre/cierra el drawer de filtros. */
  onFilter(): void {
    this.filterDrawer?.toggle();
  }

  /** Aplica los filtros seleccionados y recarga los datos. */
  onFiltersApply(filters: GenericFilterResult): void {
    this.appliedFilters = { ...filters };
    this.getAll(0);
    this._changeDetectorRef.markForCheck();
  }

  /** Resetea todos los filtros aplicados y recarga los datos. */
  onFiltersReset(): void {
    this.appliedFilters = {};
    this.getAll(0);
    this._changeDetectorRef.markForCheck();
  }

  // -----
  // @ Otras funciones públicas
  // -----

  /** Obtiene el historial de estados con los filtros aplicados. */
  getAll(index: number) {
    const pageSize = this.tableConfig.pageSize;
    const requestParameters: QueryParameters = {
      take: pageSize,
      skip: index,
      ...this.appliedFilters,
    };
    this._agencyStatusHistoryService.getAgencyStatusHistory(requestParameters).subscribe((result: any) => {
      const body = result?.body ?? result;
      this.tableConfig.dataSource.data = body?.data ?? [];
      this.tableConfig.dataSourceList = body?.data ?? [];
      this.tableConfig.length = body?.count ?? 0;
      this._changeDetectorRef.markForCheck();
    });
  }

  /** Maneja el evento de paginación de la tabla. */
  getPaginator(event?: PageEvent) {
    const index = !isNullOrUndefinedEmptyStringNullArray(event?.pageIndex) ? event.pageIndex : 0;
    this.tableConfig.pageSize = event?.pageSize ?? this.tableConfig.pageSize;
    this.getAll(index * this.tableConfig.pageSize);
  }

  /** Limpia el formulario de búsqueda y resetea los filtros. */
  onClean(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.headerConfig.clearVisible = false;
    this.headerConfig.formGroup.reset();
    this.appliedFilters = {};
    this.getAll(0);
  }
}
