import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { Subject, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { TranslocoModule } from '@ngneat/transloco';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericTableConfig, OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { AgencyStatusHistoryService } from 'app/shared/services/agency-status-history.service';
import { AgencyStatusHistory } from 'app/shared/models/AgencyStatusHistory';
import { AGENCY_STATUS_HISTORY_COLUMNS_SCHEMA } from './columns-schema';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { compareById } from 'app/shared/utils';

@Component({
  selector: 'app-agency-status-history-list',
  templateUrl: './list.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: fuseAnimations,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatPaginatorModule,
    MatTableModule,
    GenericTableComponent,
    GenericHeaderComponent,
    TranslocoModule,
  ],
})
export class AgencyStatusHistoryListComponent implements OnInit, OnDestroy, OnGenericTableHandler, OnGenericHeaderHandlers {
  private _agencyStatusHistoryService = inject(AgencyStatusHistoryService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _route = inject(ActivatedRoute);
  private _unsubscribeAll = new Subject<unknown>();

  agencies: { id: number; name: string }[] = [];
  filterForm = new FormGroup({
    agencyId: new FormControl<number | null>(null),
    createdAtFrom: new FormControl<string | null>(null),
    createdAtTo: new FormControl<string | null>(null),
  });

  headerConfig: GenericHeaderConfig = {
    title: 'agency-status-history.list.title',
    goToAddButtonShow: false,
    searchFieldShow: false,
  };

  tableConfig: GenericTableConfig<AgencyStatusHistory> = {
    dataSource: new MatTableDataSource<AgencyStatusHistory>([]),
    dataSourceList: [],
    columnsSchema: AGENCY_STATUS_HISTORY_COLUMNS_SCHEMA,
    displayedColumns: AGENCY_STATUS_HISTORY_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 15,
    pageSizeOptions: [15, 25, 50],
    length: 0,
    fullScreen: true,
  };

  compareById = compareById;

  ngOnInit(): void {
    const resolvedData = this._route.snapshot.data['data'];
    if (resolvedData?.agencies?.length) {
      this.agencies = resolvedData.agencies.map((a: { id: number; name: string }) => ({ id: a.id, name: a.name }));
      this._changeDetectorRef.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onSearch(): void {
    this.loadHistory(1);
  }

  loadHistory(page: number): void {
    const agencyId = this.filterForm.value.agencyId;
    if (agencyId == null || agencyId <= 0) {
      return;
    }
    const params: QueryParameters = {
      agencyId,
      page,
      pageSize: this.tableConfig.pageSize,
      createdAtFrom: this.filterForm.value.createdAtFrom ?? undefined,
      createdAtTo: this.filterForm.value.createdAtTo ?? undefined,
    };
    this._agencyStatusHistoryService
      .getAgencyStatusHistory(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (res) => {
          this.tableConfig.dataSource.data = res.data ?? [];
          this.tableConfig.dataSourceList = res.data ?? [];
          this.tableConfig.length = res.totalCount ?? 0;
          this._changeDetectorRef.markForCheck();
        },
        error: () => {
          this.tableConfig.dataSource.data = [];
          this.tableConfig.dataSourceList = [];
          this.tableConfig.length = 0;
          this._changeDetectorRef.markForCheck();
        },
      });
  }

  getPaginator(event?: PageEvent): void {
    if (!event) return;
    const page = event.pageIndex + 1;
    this.tableConfig.pageSize = event.pageSize;
    this.loadHistory(page);
  }
}
