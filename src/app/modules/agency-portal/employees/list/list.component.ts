import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { ViewEncapsulation } from '@angular/core';
import { EmployeeService } from 'app/shared/services/employee.service';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { AuthService } from 'app/core/auth/auth.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { EmployeeList } from 'app/shared/models/Employee';
import { EMPLOYEES_COLUMNS_SCHEMA } from './columns-schema';
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
  selector: 'app-employee-list',
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
export class ListComponent implements OnInit, OnDestroy, OnGenericTableHandler, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _employeeService = inject(EmployeeService);
  private _customRouterService = inject(CustomRouterService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _authService = inject(AuthService);
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  headerConfig: GenericHeaderConfig = {
    title: 'employees.list.title',
    formGroup: this._formBuilder.group({
      name: new FormControl('')
    }),
    searchFieldShow: true,
    goToAddButtonShow: true,
    searchInputPlaceholder: 'employees.list.searchPlaceholder'
  };

  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<EmployeeList>(),
    columnsSchema: EMPLOYEES_COLUMNS_SCHEMA,
    displayedColumns: EMPLOYEES_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 15,
    pageSizeOptions: [15, 50, 100],
    length: 0,
  };

  ngOnInit(): void {
    this._employeeService.employees$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
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
      name: form.name || undefined
    };

    this._employeeService.getAll(queryParams).subscribe({
      next: (response) => {
        this.tableConfig.dataSource = response.body;
        this.tableConfig.length = response.total;
        this._changeDetectorRef.markForCheck();
      },
      error: (error) => {
        console.error('Error loading employees:', error);
      }
    });
  }

  onAdd(): void {
    this._customRouterService.navigate(['employees/add']);
  }

  onTableEdit(event: Event, id: number): void {
    this._customRouterService.navigate(['employees/edit', id]);
  }

  onTableDelete(event: Event, id: number): void {
    // Implementar lógica de eliminación
    if (confirm('¿Está seguro de que desea eliminar este empleado?')) {
      this._employeeService.delete({ id }).subscribe({
        next: () => {
          this.getAll(0, this.headerConfig.formGroup.value);
        },
        error: (error) => {
          console.error('Error deleting employee:', error);
        }
      });
    }
  }

  onTableConvertToUser(event: Event, id: number): void {
    // Implementar lógica de conversión a usuario
    if (confirm('¿Está seguro de que desea convertir este empleado en usuario?')) {
      this._employeeService.convertToUser(id, '').subscribe({
        next: () => {
          this.getAll(0, this.headerConfig.formGroup.value);
        },
        error: (error) => {
          console.error('Error converting employee to user:', error);
        }
      });
    }
  }
}
