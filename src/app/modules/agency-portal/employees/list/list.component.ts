import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { ViewEncapsulation } from '@angular/core';
import { EmployeeService } from 'app/shared/services/employee.service';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { AuthService } from 'app/core/auth/auth.service';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { EmployeeList } from 'app/shared/models/employee/Employee';
import { EMPLOYEES_COLUMNS_SCHEMA } from './columns-schema';
import { EMPLOYEES_LIST_FILTERS_SCHEMA } from './filters-schema';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericTableConfig, GenericFilterResult, OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { GenericFilterDrawerComponent } from 'app/shared/components/generic-filter-drawer/generic-filter-drawer.component';
import { OnGenericFilterHandlers } from 'app/shared/components/generic-filter-panel/generic-filter-panel.interface';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { NotificationService } from 'app/shared/services/notification.service';

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
    GenericFilterDrawerComponent,
    TranslocoModule,
  ],
})
export class ListComponent implements OnInit, OnDestroy, OnGenericTableHandler, OnGenericHeaderHandlers, OnGenericFilterHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _employeeService = inject(EmployeeService);
  private _customRouterService = inject(CustomRouterService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _authService = inject(AuthService);
  private _route = inject(ActivatedRoute);
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _notificationService = inject(NotificationService);

  @ViewChild('filterDrawer') filterDrawer!: GenericFilterDrawerComponent;
  filtersSchema = EMPLOYEES_LIST_FILTERS_SCHEMA;
  appliedFilters: GenericFilterResult = {};

  headerConfig: GenericHeaderConfig = {
    title: 'employees.list.title',
    formGroup: this._formBuilder.group({
      name: new FormControl('')
    }),
    searchFieldShow: false,
    filterButtonShow: true,
    filterButtonTooltip: 'global.tooltips.header.filter',
    goToAddButtonShow: true,
  };

  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<EmployeeList>(),
    columnsSchema: EMPLOYEES_COLUMNS_SCHEMA,
    displayedColumns: EMPLOYEES_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 25,
    pageSizeOptions: [25, 50, 100],
    length: 0,
    fullScreen: true,
  };

  ngOnInit(): void {
    // Obtener datos del resolver en lugar de suscribirse
    const resolvedData = this._route.snapshot.data['data'];

    if (resolvedData) {
      this.tableConfig.dataSource.data = resolvedData.employees.data;
      this.tableConfig.length = resolvedData.employees.count;
      this._changeDetectorRef.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onSearch(): void {}

  onFilter(): void {
    this.filterDrawer?.toggle();
  }

  onFiltersApply(filters: GenericFilterResult): void {
    this.appliedFilters = { ...filters };
    this.filterDrawer?.close();
    this.getAll(0);
    this._changeDetectorRef.markForCheck();
  }

  onFiltersReset(): void {
    this.appliedFilters = {};
    this.getAll(0);
    this._changeDetectorRef.markForCheck();
  }

  getAll(index: number): void {
    const queryParams: QueryParameters = {
      take: this.tableConfig.pageSize,
      skip: index,
      ...this.appliedFilters,
    };

    this._employeeService.getAllEmployeesFromDb(queryParams).subscribe({
      next: (response) => {
        this.tableConfig.dataSource.data = response.body.data;
        this.tableConfig.length = response.body.count;
        this._changeDetectorRef.markForCheck();
      },
      error: (error) => {
        console.error('Error loading employees:', error);
      }
    });
  }

  getPaginator(event?: PageEvent): void {
    const pageIndex = !isNullOrUndefinedEmptyStringNullArray(event?.pageIndex) ? event.pageIndex : 0;
    this.tableConfig.pageSize = event?.pageSize ?? this.tableConfig.pageSize;
    this.getAll(pageIndex * this.tableConfig.pageSize);
  }

  onAdd(): void {
    this._customRouterService.navigate(['employees/add']);
  }

  onTableEdit(event: Event, id: number): void {
    this._customRouterService.navigate(['employees/edit', id]);
  }

  onTableDelete(event: Event, id: number): void {
    // Implementar lógica de eliminación
    const queryParams: QueryParameters = {
      employeeId: id
    };

    this._notificationService.showConfirmationDialogWithCallback({
      message: '¿Está seguro de que desea eliminar este empleado?',
      icon: {
        show: true,
        name: 'heroicons_outline:trash',
        color: 'warn'
      },
      actions: {
        confirm: {
          label: 'users.list.actions.delete',
          color: 'warn'
        }
      }
    }, (result) => {
      if (result === 'confirmed') {
        this._employeeService.deleteEmployee(queryParams).subscribe({
          next: () => {
            this.getAll(0);
          },
          error: (error) => {
            console.error('Error deleting employee:', error);
          }
        });
      }
    });
  }

  onTableConvertToUser(event: Event, id: number): void {
    // Implementar lógica de conversión a usuario
    const queryParams: QueryParameters = {
      employeeId: id,
      userId: ''
    };

    this._notificationService.showConfirmationDialogWithCallback({
      message: '¿Está seguro de que desea convertir este empleado en usuario?',
      icon: {
        show: true,
        name: 'heroicons_outline:check',
        color: 'primary'
      },
      actions: {
        confirm: {
          label: 'Aceptar',
          color: 'primary'
        }
      }
    }, (result) => {
      if (result === 'confirmed') {
        this._employeeService.convertEmployeeToUser(queryParams).subscribe({
          next: () => {
            this.getAll(0);
          },
          error: (error) => {
            console.error('Error converting employee to user:', error);
          }
        });
      }
    });
  }
}
