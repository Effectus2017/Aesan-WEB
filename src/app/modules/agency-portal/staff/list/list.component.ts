import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { ViewEncapsulation } from '@angular/core';
import { StaffService } from 'app/shared/services/staff.service';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { AuthService } from 'app/core/auth/auth.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { StaffList } from 'app/shared/models/Staff';
import { STAFF_COLUMNS_SCHEMA } from './columns-schema';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericTableConfig, OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';

@Component({
  selector: 'app-staff-list',
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers, OnGenericTableHandler {
  private _formBuilder = inject(UntypedFormBuilder);
  private _staffService = inject(StaffService);
  private _customRouterService = inject(CustomRouterService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _authService = inject(AuthService);
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  headerConfig: GenericHeaderConfig = {
    title: 'staff.list.title',
    formGroup: this._formBuilder.group({
      name: new FormControl('')
    }),
    searchFieldShow: true,
    goToAddButtonShow: true,
    searchInputPlaceholder: 'staff.list.search.placeholder'
  };

  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<StaffList>(),
    columnsSchema: STAFF_COLUMNS_SCHEMA,
    displayedColumns: STAFF_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 15,
    pageSizeOptions: [15, 50, 100],
    length: 0,
  };

  ngOnInit(): void {
    this._staffService.staff$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.tableConfig.dataSource.data = result.body.data;
        this.tableConfig.length = result.body.count;
      }
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onSearch(): void {
    this.getAll(0, this.headerConfig.formGroup.value);
  }

  getAll(index: number, form: any): void {
    const queryParams: QueryParameters = {
      take: this.tableConfig.pageSize,
      skip: index * this.tableConfig.pageSize,
      name: form.name || null
    };

    this._staffService.getAllStaffFromDb(queryParams).subscribe({
      next: (response) => {
        this.tableConfig.dataSource.data = response.body.data;
        this.tableConfig.length = response.body.count;
        this._changeDetectorRef.markForCheck();
      },
      error: (error) => {
        console.error('Error loading staff:', error);
      }
    });
  }

  onAdd(): void {
    this._customRouterService.navigate(['staff/add']);
  }

  onEdit(id: number): void {
    this._customRouterService.navigate(['staff/edit', id]);
  }

  onDelete(id: number): void {
    const queryParams: QueryParameters = {
      id: id
    };

    this._staffService.deleteStaff(queryParams).subscribe({
      next: (response) => {
        if (response.body) {
          // Recargar la lista después de eliminar
          this.getAll(0, this.headerConfig.formGroup.value);
        }
      },
      error: (error) => {
        console.error('Error deleting staff:', error);
      }
    });
  }

  onPageChange(event: any): void {
    this.getAll(event.pageIndex, this.headerConfig.formGroup.value);
  }
}
