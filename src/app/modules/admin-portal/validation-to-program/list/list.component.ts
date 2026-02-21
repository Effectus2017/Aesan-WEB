import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { MatInputModule } from '@angular/material/input';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { COLUMNS_SCHEMA } from './columns-schema';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { ListFilterPanelComponent } from 'app/shared/components/list-filter-panel/list-filter-panel.component';
import { OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericTableConfig, ListFilterResult } from 'app/shared/components/generic-table/generic-table.interface';
import { TranslocoModule } from '@ngneat/transloco';
import { AgencyService } from 'app/shared/services/agency.service';
import { Agency } from 'app/shared/models/Agency';
import { AuthService } from 'app/core/auth/auth.service';

// DESCRICION DEL COMPONENTE
// Este componente se encarga de mostrar la lista de validaciones de aplicación a programas.

@Component({
  selector: 'app-admin-validation-to-program-list',
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
    ListFilterPanelComponent,
    FuseDrawerComponent,
    TranslocoModule,
  ],
})
export class ValidationToProgramListComponent implements OnInit, OnDestroy, OnGenericTableHandler, OnGenericHeaderHandlers {
  // Inyeccion de servicios
  private _formBuilder = inject(UntypedFormBuilder);
  private _agencyService = inject(AgencyService);
  private _customRouterService = inject(CustomRouterService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _authService = inject(AuthService);
  // Suscripciones
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  @ViewChild('filterDrawer') filterDrawer!: FuseDrawerComponent;

  appliedFilters: ListFilterResult = {};

  // Configuración del header
  headerConfig: GenericHeaderConfig = {
    title: 'validation-to-program.list.title',
    formGroup: this._formBuilder.group({
      name: new FormControl(''),
    }),
    searchFieldShow: true,
    searchInputPlaceholder: 'validation-to-program.list.search.placeholder',
    submitButtonText: 'validation-to-program.list.buttons.save',
    filterButtonShow: true,
    filterButtonTooltip: 'global.tooltips.header.filter',
  };

  // Configuración de la tabla
  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<Agency>(),
    dataSourceList: [],
    columnsSchema: COLUMNS_SCHEMA,
    displayedColumns: COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 15,
    pageSizeOptions: [15, 50, 100],
    length: 0,
    fullScreen: true,
  };

  // Constructor
  constructor() {}

  // Lifecycle hooks
  ngOnInit() {
    // Get the agencies
    this._agencyService.agencies$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      this.tableConfig.dataSource.data = result.body.data;
      this.tableConfig.length = result.body.count;
      // Lista de datos
      this.tableConfig.dataSourceList = result.body.data;

      // Mark for check
      this._changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onSearch() {
    if (this.headerConfig.formGroup.valid) {
      this.getAll(0, this._buildFormForRequest());
    }
  }

  onFilter(): void {
    this.filterDrawer?.toggle();
  }

  onFiltersApply(filters: ListFilterResult): void {
    this.appliedFilters = { ...filters };
    this.filterDrawer?.close();
    this.getAll(0, this._buildFormForRequest());
    this._changeDetectorRef.markForCheck();
  }

  onFiltersReset(): void {
    this.appliedFilters = {};
    this.getAll(0, this._buildFormForRequest());
    this._changeDetectorRef.markForCheck();
  }

  private _buildFormForRequest(): Record<string, unknown> {
    const header = this.headerConfig.formGroup?.value ?? {};
    return { ...header, ...this.appliedFilters };
  }

  // Métodos para obtener datos
  getAll(index: number, form: any) {
    const requestParameters: QueryParameters = {
      take: this.tableConfig.pageSize,
      skip: index,
      name: (form.name ?? null) || null,
      alls: true,
      isList: false,
    };

    this._agencyService.getAllAgenciesFromDb(requestParameters).subscribe();
  }

  getPaginator(event?: PageEvent) {
    const index = !isNullOrUndefinedEmptyStringNullArray(event?.pageIndex) ? event.pageIndex : 0;
    this.tableConfig.pageSize = event?.pageSize ?? this.tableConfig.pageSize;
    this.getAll(index * this.tableConfig.pageSize, this._buildFormForRequest());
  }

  onClean(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.headerConfig.clearVisible = false;
    this.headerConfig.formGroup.reset();
    this.appliedFilters = {};
    this.getAll(0, this._buildFormForRequest());
  }

  onTableEdit(event: Event, id: number) {
    event.stopPropagation();
    event.preventDefault();
    // navega a la página de edición
    this._customRouterService.navigate([`sponsors/edit/${id}`]);
  }
}
