import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslocoModule } from '@ngneat/transloco';
import { isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { COLUMNS_SCHEMA } from './columns-schema';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericTableConfig } from 'app/shared/components/generic-table/generic-table.interface';
import { HouseholdService } from 'app/shared/services/household.service';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
  selector: 'agency-portal-household-list',
  templateUrl: './list.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
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
    TranslocoModule,
  ],
})
export class ListComponent implements OnInit, OnDestroy, OnGenericTableHandler, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _householdService = inject(HouseholdService);
  private _customRouterService = inject(CustomRouterService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _authService = inject(AuthService);
  private _route = inject(ActivatedRoute);
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  headerConfig: GenericHeaderConfig = {
    title: 'households.list.title',
    formGroup: this._formBuilder.group({
      street: new FormControl(''),
    }),
    searchFieldShow: true,
    searchInputPlaceholder: 'households.list.search.placeholder',
    submitButtonText: 'households.list.buttons.save',
    goToAddButtonShow: true,
  };

  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<any>(),
    dataSourceList: [],
    columnsSchema: COLUMNS_SCHEMA,
    displayedColumns: COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 15,
    pageSizeOptions: [15, 50, 100],
    length: 0,
  };

  constructor() {}

  ngOnInit() {
    // Usar datos del resolver
    const resolverData = this._route.snapshot.data['data']?.[0];
    if (resolverData && resolverData.body) {
      const data = resolverData.body.data || [];
      this.tableConfig.dataSource.data = data;
      this.tableConfig.length = resolverData.body.count;
      this.tableConfig.dataSourceList = data;
    }
    this._changeDetectorRef.markForCheck();
    // Suscribirse a cambios si el servicio expone observable
    // this._householdService.households$.pipe(takeUntil(this._unsubscribeAll)).subscribe(...)
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onSearch() {
    if (this.headerConfig.formGroup.valid) {
      this.getAll(0, this.headerConfig.formGroup.value);
      this.headerConfig.clearVisible = true;
    }
  }

  getAll(index: number, form: any) {
    const requestParameters: QueryParameters = {
      take: this.tableConfig.pageSize,
      skip: index,
      //street: form.street || null,
      userId: this._authService.getUserId(),
    };
    this._householdService.getAll(requestParameters).subscribe((result: any) => {
      if (result && result.body) {
        const data = result.body.data || [];
        this.tableConfig.dataSource.data = data;
        this.tableConfig.length = result.body.count;
        this.tableConfig.dataSourceList = data;
        this._changeDetectorRef.markForCheck();
      }
    });
  }

  getPaginator(event?: PageEvent) {
    const index = !isNullOrUndefinedEmptyStringNullArray(event.pageIndex) ? event.pageIndex : 0;
    this.tableConfig.pageSize = event.pageSize;
    this.getAll(index * this.tableConfig.pageSize, this.headerConfig.formGroup.value);
  }

  onClean(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.headerConfig.clearVisible = false;
    this.headerConfig.formGroup.reset();
    this.getAll(0, this.headerConfig.formGroup.value);
  }

  onTableEdit(event: Event, id: number) {
    event.stopPropagation();
    event.preventDefault();
    this._customRouterService.navigate([`agency-portal/household/edit/${id}`]);
  }

  onAdd() {
    this._customRouterService.navigate(['agency-portal/household/add']);
  }
}
