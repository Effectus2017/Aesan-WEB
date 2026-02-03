import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { HouseholdMemberIncomeService } from 'app/shared/services/household-member-income.service';
import { COLUMNS_SCHEMA } from './columns-schema';
import { GenericHeaderConfig } from 'app/shared/components/generic-header/generic-header.types';
import { GenericTableConfig } from 'app/shared/components/generic-table/generic-table.types';
import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

@Component({
  selector: 'app-household-member-income-list',
  templateUrl: './list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HouseholdMemberIncomeListComponent implements OnDestroy {
  headerConfig: GenericHeaderConfig;
  tableConfig: GenericTableConfig;
  private _destroy$ = new Subject<void>();

  constructor(
    private _formBuilder: FormBuilder,
    private _service: HouseholdMemberIncomeService,
    private _customRouterService: CustomRouterService
  ) {
    this.headerConfig = {
      title: 'household-member-income.list.title',
      formGroup: this._formBuilder.group({ search: new FormControl('') }),
      searchFieldShow: true,
      goToAddButtonShow: true,
    };
    this.tableConfig = {
      columnsSchema: COLUMNS_SCHEMA as ColumnSchema[],
      data: [],
      pageSize: 10,
      pageSizeOptions: [10, 25, 50],
      length: 0,
      loading: false,
    };
    this.initSearch();
    this.getAll();
  }

  private initSearch(): void {
    this.headerConfig.formGroup.get('search')?.valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => this.getAll());
  }

  getAll(pageIndex = 0, pageSize = 10): void {
    this.tableConfig.loading = true;
    const search = this.headerConfig.formGroup.get('search')?.value || '';
    this._service.getAll({ take: pageSize, skip: pageIndex * pageSize, search })
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          this.tableConfig.data = res.items;
          this.tableConfig.length = res.total;
          this.tableConfig.loading = false;
        },
        error: () => {
          this.tableConfig.data = [];
          this.tableConfig.length = 0;
          this.tableConfig.loading = false;
        }
      });
  }

  getPaginator(event: PageEvent): void {
    this.getAll(event.pageIndex, event.pageSize);
  }

  onAdd(): void {
    this._customRouterService.navigate(['admin-portal/household-member-income/add']);
  }

  onTableEdit(row: any): void {
    this._customRouterService.navigate(['admin-portal/household-member-income/edit', row.id]);
  }

  onClean(): void {
    this.headerConfig.formGroup.reset();
    this.getAll();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
