import {
  Component,
  ViewEncapsulation,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectorRef,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { RouterModule } from '@angular/router';
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
  OnGenericTableHandler,
} from 'app/shared/components/generic-table/generic-table.interface';
import { NotificationService } from 'app/shared/services/notification.service';
import { LogsService } from 'app/shared/services/logs.service';
import { Subject, takeUntil } from 'rxjs';
import { LOGS_COLUMNS_SCHEMA } from './columns-schema';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { CentralLogEntry } from 'app/shared/models/CentralLogEntry';
import { QueryParameters } from 'app/shared/models/QueryParameters';

const LOG_CATEGORIES = [
  { value: 'Audit', labelKey: 'logs.list.categories.audit' },
  { value: 'Email', labelKey: 'logs.list.categories.email' },
  { value: 'Job', labelKey: 'logs.list.categories.job' },
  { value: 'Application', labelKey: 'logs.list.categories.application' },
];

/** Fecha al inicio del día (00:00:00.000) en hora local, en ISO para la API. */
function toLogFromIso(value: Date | string | null | undefined): string | undefined {
  if (value == null) return undefined;
  const d = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(d.getTime())) return undefined;
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/** Fecha al final del día (23:59:59.999) en hora local, en ISO para la API. */
function toLogToIso(value: Date | string | null | undefined): string | undefined {
  if (value == null) return undefined;
  const d = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(d.getTime())) return undefined;
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

@Component({
  selector: 'app-list-logs',
  templateUrl: './list.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatTableModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
    RouterModule,
    GenericHeaderComponent,
    GenericTableComponent,
    TranslocoModule,
  ],
})
export class LogsListComponent implements OnInit, OnDestroy, OnGenericTableHandler, OnGenericHeaderHandlers {
  private _unsubscribeAll = new Subject<void>();
  private _logsService = inject(LogsService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _fuseConfirmationService = inject(FuseConfirmationService);
  private _notificationService = inject(NotificationService);
  private _translocoService = inject(TranslocoService);

  readonly loading = signal(false);
  readonly categoryOptions = LOG_CATEGORIES;

  headerConfig: GenericHeaderConfig = {
    title: 'logs.list.title',
    formGroup: new FormGroup({
      logCategory: new FormControl<string>('Email', { nonNullable: true }),
      logFrom: new FormControl<string | null>(null),
      logTo: new FormControl<string | null>(null),
    }),
    searchFieldShow: false,
    goToAddButtonShow: false,
    clearVisible: false,
  };

  tableConfig: GenericTableConfig<CentralLogEntry> = {
    dataSource: new MatTableDataSource<CentralLogEntry>([]),
    columnsSchema: LOGS_COLUMNS_SCHEMA,
    displayedColumns: LOGS_COLUMNS_SCHEMA.map((col) =>
      Array.isArray(col.key) ? col.key[0] : col.key
    ),
    handler: this,
    showPaginator: true,
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
    length: 0,
    fullScreen: true,
  };

  trackByFn(index: number, item: CentralLogEntry): number {
    return item.id ?? index;
  }

  ngOnInit(): void {
    this.loadLogs();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  loadLogs(): void {

    const category = this.headerConfig.formGroup?.get('logCategory')?.value;
    if (!category?.trim()) {
      this._notificationService.showWarning(
        this._translocoService.translate('logs.list.selectCategory')
      );
      return;
    }

    const logFrom = this.headerConfig.formGroup?.get('logFrom')?.value;
    const logTo = this.headerConfig.formGroup?.get('logTo')?.value;

    const params: QueryParameters = {
      logCategory: category.trim(),
      page: 1,
      pageSize: this.tableConfig.pageSize ?? 20,
    };

    const fromIso = toLogFromIso(logFrom);
    const toIso = toLogToIso(logTo);

    if (fromIso) params.logFrom = fromIso;
    if (toIso) params.logTo = toIso;

    this.loading.set(true);
    this._logsService
      .getLogsPaged(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response) => {
          this.tableConfig.dataSource.data = response.items ?? [];
          this.tableConfig.length = response.totalCount ?? 0;
          this.loading.set(false);
          this._changeDetectorRef.markForCheck();
        },
        error: () => {
          this._notificationService.showError();
          this.loading.set(false);
          this._changeDetectorRef.markForCheck();
        },
      });
  }

  onPageChange(event: PageEvent): void {
    const category = this.headerConfig.formGroup?.get('logCategory')?.value;
    if (!category?.trim()) return;

    const logFrom = this.headerConfig.formGroup?.get('logFrom')?.value;
    const logTo = this.headerConfig.formGroup?.get('logTo')?.value;

    const params: QueryParameters = {
      logCategory: category.trim(),
      page: event.pageIndex + 1,
      pageSize: event.pageSize,
    };
    const fromIso = toLogFromIso(logFrom);
    const toIso = toLogToIso(logTo);
    if (fromIso) params.logFrom = fromIso;
    if (toIso) params.logTo = toIso;

    this.loading.set(true);
    this._logsService
      .getLogsPaged(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response) => {
          this.tableConfig.dataSource.data = response.items ?? [];
          this.tableConfig.length = response.totalCount ?? 0;
          this.tableConfig.pageSize = event.pageSize;
          this.loading.set(false);
          this._changeDetectorRef.markForCheck();
        },
        error: () => {
          this._notificationService.showError();
          this.loading.set(false);
          this._changeDetectorRef.markForCheck();
        },
      });
  }

  onSubmit(): void {
    this.loadLogs();
  }

  onSearch(): void {
    this.loadLogs();
  }

  onClear(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.headerConfig.formGroup?.reset({
      logCategory: 'Email',
      logFrom: null,
      logTo: null,
    });
    this.tableConfig.dataSource.data = [];
    this.tableConfig.length = 0;
    this._changeDetectorRef.markForCheck();
  }

  onClean(event: Event): void {
    this.onClear(event);
  }

  onTableView(event: Event, id: unknown): void {
    event.stopPropagation();
    event.preventDefault();
    const item = this.tableConfig.dataSource.data.find((r) => r.id === id);
    if (item) this.showDetail(item);
  }

  onTableEdit(event: Event, id: unknown): void {
    this.onTableView(event, id);
  }

  onTableAction(event: Event, action: string, id: unknown): void {
    event.stopPropagation();
    event.preventDefault();
    if (action === 'view') {
      const item = this.tableConfig.dataSource.data.find((r) => r.id === id);
      if (item) this.showDetail(item);
    }
  }

  onTableViewRelationships(event: Event, id: unknown): void {
    event.stopPropagation();
    event.preventDefault();
    const item = this.tableConfig.dataSource.data.find((r) => r.id === id);
    if (item) this.showDetail(item);
  }

  getPaginator(event?: PageEvent): void {
    if (event) this.onPageChange(event);
  }

  onAdd(): void {}

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
}
