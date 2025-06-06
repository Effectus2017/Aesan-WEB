import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
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
import { isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { DELIVERY_TYPE_COLUMNS_SCHEMA } from './columns-schema';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericTableConfig } from 'app/shared/components/generic-table/generic-table.interface';
import { DeliveryTypeService } from 'app/shared/services/delivery-type.service';
import { DeliveryType } from 'app/shared/models/DeliveryType';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
  selector: 'app-admin-delivery-type-list',
  templateUrl: './list.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
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
export class DeliveryTypeListComponent implements OnInit, OnDestroy, OnGenericTableHandler, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _deliveryTypeService = inject(DeliveryTypeService);
  private _customRouterService = inject(CustomRouterService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _authService = inject(AuthService);
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  headerConfig: GenericHeaderConfig = {
    title: 'delivery-type.list.title',
    formGroup: this._formBuilder.group({
      name: new FormControl(''),
    }),
    searchFieldShow: true,
    searchInputPlaceholder: 'delivery-type.list.search.placeholder',
    submitButtonText: 'delivery-type.list.buttons.save',
    goToAddButtonShow: true,
  };

  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<DeliveryType>(),
    dataSourceList: [],
    columnsSchema: DELIVERY_TYPE_COLUMNS_SCHEMA,
    displayedColumns: DELIVERY_TYPE_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 15,
    pageSizeOptions: [15, 50, 100],
    length: 0,
  };

  constructor() {}

  ngOnInit() {
    this._deliveryTypeService.getAll().subscribe((result: any) => {
      if (result && result.data) {
        const dataWithOrder = result.data.map((item, idx) => ({ ...item, displayOrderUI: idx + 1 }));
        this.tableConfig.dataSource.data = dataWithOrder;
        this.tableConfig.length = result.count;
      } else {
        this.tableConfig.dataSource.data = [];
        this.tableConfig.length = 0;
      }
      this._changeDetectorRef.markForCheck();
    });
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
      name: form.name || null,
      userId: this._authService.getUserId(),
    };
    this._deliveryTypeService.getAll(requestParameters.take, requestParameters.skip, requestParameters.name, true).subscribe();
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
    this._customRouterService.navigate([`delivery-type/edit/${id}`]);
  }

  onAdd() {
    this._customRouterService.navigate(['delivery-type/add']);
  }
}
