/* cspell:disable */
import {
  Component,
  ViewEncapsulation,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import {
  GenericHeaderConfig,
  OnGenericHeaderHandlers,
} from 'app/shared/components/generic-header/generic-header.interface';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import {
  GenericTableConfig,
  GenericFilterResult,
  OnGenericTableHandler,
} from 'app/shared/components/generic-table/generic-table.interface';
import { GenericFilterDrawerComponent } from 'app/shared/components/generic-filter-drawer/generic-filter-drawer.component';
import { OnGenericFilterHandlers } from 'app/shared/components/generic-filter-panel/generic-filter-panel.interface';
import { NotificationService } from 'app/shared/services/notification.service';
import { LogsService } from 'app/shared/services/logs.service';
import { Subject, takeUntil } from 'rxjs';
import { LOGS_COLUMNS_SCHEMA } from './columns-schema';
import { LOGS_FILTERS_SCHEMA } from './filters-schema';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { CentralLogEntry } from 'app/shared/models/log/CentralLogEntry';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';

@Component({
  selector: 'app-list-logs',
  templateUrl: './list.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatTableModule,
    RouterModule,
    GenericHeaderComponent,
    GenericTableComponent,
    GenericFilterDrawerComponent,
    TranslocoModule,
  ],
})
export class LogsListComponent implements OnInit, OnDestroy, OnGenericTableHandler, OnGenericHeaderHandlers, OnGenericFilterHandlers {
  // -----------------------------------------------------------------------------------------------------
  // @ Subject de desuscripción
  // -----------------------------------------------------------------------------------------------------
  private _unsubscribeAll = new Subject<any>();

  // -----------------------------------------------------------------------------------------------------
  // @ Inyecciones privadas
  // -----------------------------------------------------------------------------------------------------
  private _logsService = inject(LogsService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _fuseConfirmationService = inject(FuseConfirmationService);
  private _notificationService = inject(NotificationService);
  private _translocoService = inject(TranslocoService);
  private _route = inject(ActivatedRoute);

  // -----------------------------------------------------------------------------------------------------
  // @ Variables
  // -----------------------------------------------------------------------------------------------------
  headerConfig: GenericHeaderConfig = {
    title: 'logs.list.title',
    formGroup: new FormGroup({}),
    searchFieldShow: false,
    goToAddButtonShow: false,
    clearVisible: true,
    filterButtonShow: true,
    filterButtonTooltip: 'global.tooltips.header.filter',
  };

  tableConfig: GenericTableConfig<CentralLogEntry> = {
    dataSource: new MatTableDataSource<CentralLogEntry>([]),
    dataSourceList: [],
    columnsSchema: LOGS_COLUMNS_SCHEMA,
    displayedColumns: LOGS_COLUMNS_SCHEMA.map((col) =>
      Array.isArray(col.key) ? col.key[0] : col.key
    ),
    handler: this,
    showPaginator: true,
    pageSize: 25,
    pageSizeOptions: [25, 50, 100],
    length: 0,
    fullScreen: true,
  };

  @ViewChild('filterDrawer') filterDrawer!: GenericFilterDrawerComponent;
  filtersSchema = LOGS_FILTERS_SCHEMA;
  appliedFilters: GenericFilterResult = {};

  // -----------------------------------------------------------------------------------------------------
  // @ Constructor
  // -----------------------------------------------------------------------------------------------------
  constructor() {}

  // -----------------------------------------------------------------------------------------------------
  // @ ngOnInit / ngOnDestroy
  // -----------------------------------------------------------------------------------------------------

  /** Inicializa el componente con los datos del resolver. */
  ngOnInit(): void {
    const resolvedData = this._route.snapshot.data['data'];
    if (resolvedData?.logs) {
      this.tableConfig.dataSource.data = resolvedData.logs.data ?? [];
      this.tableConfig.length = resolvedData.logs.count ?? 0;
      this.tableConfig.dataSourceList = resolvedData.logs.data ?? [];
      this._changeDetectorRef.markForCheck();
    }
  }

  /** Limpia las suscripciones al destruir el componente. */
  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Funciones On (componentes genéricos)
  // -----------------------------------------------------------------------------------------------------

  /** Ejecuta la búsqueda recargando con la primera página. */
  onSubmit(): void {
    this.getAll(0);
  }

  /** Recarga los datos con la primera página (equivalente a búsqueda). */
  onSearch(): void {
    this.getAll(0);
  }

  /** Abre o cierra el drawer de filtros. */
  onFilter(): void {
    this.filterDrawer?.toggle();
  }

  /** Recibe filtros aplicados desde el panel y recarga la lista. */
  onFiltersApply(filters: GenericFilterResult): void {
    this.appliedFilters = { ...filters };
    this.filterDrawer?.close();
    this.getAll(0);
    this._changeDetectorRef.markForCheck();
  }

  /** Restablecer filtros del panel y recargar sin filtros adicionales. */
  onFiltersReset(): void {
    this.appliedFilters = {};
    this.getAll(0);
    this._changeDetectorRef.markForCheck();
  }

  /** Limpia filtros (categoría por defecto Email) y recarga. */
  onClear(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.appliedFilters = { logCategory: 'Email' };
    this.getAll(0);
    this._changeDetectorRef.markForCheck();
  }

  /** Delega en onClear para limpiar el formulario y recargar. */
  onClean(event: Event): void {
    this.onClear(event);
  }

  /** Navega a la fila o abre detalle al hacer clic en la tabla. */
  onTableView(event: Event, id: unknown): void {
    event.stopPropagation();
    event.preventDefault();
    const item = this.tableConfig.dataSource.data.find((r) => r.id === id);
    if (item) this.showDetail(item);
  }

  /** Delega en onTableView para edición/visualización desde la tabla. */
  onTableEdit(event: Event, id: unknown): void {
    this.onTableView(event, id);
  }

  /** Gestiona la acción 'view' de la tabla abriendo el detalle. */
  onTableAction(event: Event, action: string, id: unknown): void {
    event.stopPropagation();
    event.preventDefault();
    if (action === 'view') {
      const item = this.tableConfig.dataSource.data.find((r) => r.id === id);
      if (item) this.showDetail(item);
    }
  }

  /** Abre detalle desde el enlace de relaciones de la tabla. */
  onTableViewRelationships(event: Event, id: unknown): void {
    event.stopPropagation();
    event.preventDefault();
    const item = this.tableConfig.dataSource.data.find((r) => r.id === id);
    if (item) this.showDetail(item);
  }

  /** Maneja el evento de paginación y recarga la página correspondiente. */
  getPaginator(event?: PageEvent): void {
    if (event) {
      if (event.pageSize != null) this.tableConfig.pageSize = event.pageSize;
      this.getAll(event.pageIndex, event.pageSize);
    }
  }

  /** Handler de botón agregar (no usado en logs). */
  onAdd(): void {}

  // -----------------------------------------------------------------------------------------------------
  // @ Otras funciones públicas
  // -----------------------------------------------------------------------------------------------------

  /** Obtiene los logs paginados según appliedFilters y actualiza la tabla (como sites-psav: getAll usa this.appliedFilters). */
  getAll(index: number, pageSize?: number): void {
    const category = (this.appliedFilters['logCategory'] as string)?.trim() ?? 'Email';
    if (!category) {
      this._notificationService.showWarning(
        this._translocoService.translate('logs.list.selectCategory')
      );
      return;
    }

    const params: QueryParameters = {
      logCategory: category,
      page: index + 1,
      pageSize: pageSize ?? this.tableConfig.pageSize ?? 25,
    };
    const logFrom = this.appliedFilters['logFrom'];
    const logTo = this.appliedFilters['logTo'];
    if (logFrom != null && logFrom !== '') params.logFrom = String(logFrom);
    if (logTo != null && logTo !== '') params.logTo = String(logTo);

    this._logsService
      .getLogsPaged(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response) => {
          this.tableConfig.dataSource.data = response.data ?? [];
          this.tableConfig.length = response.count ?? 0;
          this.tableConfig.dataSourceList = response.data ?? [];
          if (pageSize != null) this.tableConfig.pageSize = pageSize;
          this._changeDetectorRef.markForCheck();
        },
        error: () => {
          this._notificationService.showError();
          this._changeDetectorRef.markForCheck();
        },
      });
  }

  /** Muestra el detalle de una entrada de log en un diálogo. */
  showDetail(item: CentralLogEntry): void {
    const message = `
      <div style="text-align: left; white-space: pre-wrap; max-height: 400px; overflow-y: auto;">
        <p><strong>${this._translocoService.translate('logs.list.details.category')}:</strong> ${item.category}</p>
        <p><strong>${this._translocoService.translate('logs.list.details.id')}:</strong> ${item.id}</p>
        <p><strong>${this._translocoService.translate('logs.list.details.timestamp')}:</strong> ${item.timestamp ? new Date(item.timestamp).toLocaleString() : '-'}</p>
        <p><strong>${this._translocoService.translate('logs.list.details.summary')}:</strong> ${item.summary ?? '-'}</p>
        ${item.status ? `<p><strong>${this._translocoService.translate('logs.list.details.status')}:</strong> ${item.status}</p>` : ''}
        ${item.level ? `<p><strong>${this._translocoService.translate('logs.list.details.level')}:</strong> ${item.level}</p>` : ''}
        ${item.userId ? `<p><strong>${this._translocoService.translate('logs.list.details.userId')}:</strong> ${item.userId}</p>` : ''}
        ${item.payload ? `<p><strong>${this._translocoService.translate('logs.list.details.payload')}:</strong></p><pre style="background: #f5f5f5; padding: 8px; border-radius: 4px;">${item.payload}</pre>` : ''}
      </div>
    `;
    this._fuseConfirmationService.open({
      title: this._translocoService.translate('logs.list.details.title'),
      message,
      actions: {
        confirm: {
          label: this._translocoService.translate('logs.list.details.close'),
          color: 'primary',
        },
      },
      dismissible: true,
    });
  }

  /** trackBy para la tabla por id de entrada. */
  trackByFn(index: number, item: CentralLogEntry): number {
    return item.id ?? index;
  }
}
