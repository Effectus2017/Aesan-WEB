import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { UntypedFormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { ViewEncapsulation } from '@angular/core';
import { StaffService } from 'app/shared/services/staff.service';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { AuthService } from 'app/core/auth/auth.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { StaffList } from 'app/shared/models/Staff';
import { EMPLOYEES_COLUMNS_SCHEMA } from './employees-columns-schema';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericTableConfig, GenericFilterResult, OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { GenericFilterPanelComponent } from 'app/shared/components/generic-filter-panel/generic-filter-panel.component';
import { isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';

@Component({
  selector: 'app-employees-list',
  templateUrl: './employees-list.component.html',
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
    GenericFilterPanelComponent,
    FuseDrawerComponent,
    TranslocoModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListEmployeesComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers, OnGenericTableHandler {
  private _formBuilder = inject(UntypedFormBuilder);
  private _staffService = inject(StaffService);
  private _customRouterService = inject(CustomRouterService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _authService = inject(AuthService);
  private _route = inject(ActivatedRoute);
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  @ViewChild('filterDrawer') filterDrawer!: FuseDrawerComponent;

  /** Filtros aplicados desde el panel (drawer). */
  appliedFilters: GenericFilterResult = {};

  headerConfig: GenericHeaderConfig = {
    title: 'staff.employees.list.title',
    formGroup: this._formBuilder.group({
      name: new FormControl('')
    }),
    searchFieldShow: true,
    customButtonShow: true,
    customButtonClass: 'text-white bg-[#F1A621]',
    customButtonIcon: 'mat_outline:add',
    customButtonIconEnabled: true,
    customButtonPermission: 'staff.create',
    searchInputPlaceholder: 'staff.employees.list.search.placeholder',
    filterButtonShow: true,
    filterButtonTooltip: 'global.tooltips.header.filter',
  };

  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<StaffList>(),
    columnsSchema: EMPLOYEES_COLUMNS_SCHEMA,
    displayedColumns: EMPLOYEES_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 15,
    pageSizeOptions: [15, 50, 100],
    length: 0,
    fullScreen: true,
  };

  ngOnInit(): void {
    // Obtener datos del resolver en lugar de suscribirse
    const resolvedData = this._route.snapshot.data['data'];

    if (resolvedData) {
      const staffData = this.processStaffData(resolvedData.staff.data);
      this.tableConfig.dataSource.data = staffData;
      this.tableConfig.length = resolvedData.staff.count;
      this._changeDetectorRef.markForCheck();
    }
  }

  /** Procesa los datos del staff para agregar el campo displayPosition */
  private processStaffData(staffList: StaffList[]): StaffList[] {
    return staffList.map(staff => ({
      ...staff,
      displayPosition: this.getDisplayPosition(staff)
    }));
  }

  /** Calcula el texto a mostrar en la columna Cargo según la clasificación */
  private getDisplayPosition(staff: StaffList): string {
    // Si la clasificación es "Ambos" (id 3) y tiene ambos cargos, mostrar ambos separados por " / "
    if (staff.staffClassificationId === 3 && 
        staff.administrativePositionName && 
        staff.operationalPositionName) {
      return `${staff.administrativePositionName} / ${staff.operationalPositionName}`;
    }
    // Si no, mostrar solo el cargo principal
    return staff.positionName || '';
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onSearch(): void {
    this.getAll(0, this._buildFormForRequest());
  }

  /** Abre o cierra el drawer de filtros. */
  onFilter(): void {
    this.filterDrawer?.toggle();
  }

  /** Recibe filtros aplicados desde el panel y recarga la lista. */
  onFiltersApply(filters: GenericFilterResult): void {
    this.appliedFilters = { ...filters };
    this.filterDrawer?.close();
    this.getAll(0, this._buildFormForRequest());
    this._changeDetectorRef.markForCheck();
  }

  /** Restablecer filtros del panel y recargar sin filtros adicionales. */
  onFiltersReset(): void {
    this.appliedFilters = {};
    this.getAll(0, this._buildFormForRequest());
    this._changeDetectorRef.markForCheck();
  }

  /** Construye el objeto form que usa getAll: búsqueda del header + filtros del panel. */
  private _buildFormForRequest(): Record<string, unknown> {
    const header = this.headerConfig.formGroup?.value ?? {};
    return { ...header, ...this.appliedFilters };
  }

  getAll(index: number, form: any): void {
    const queryParams: QueryParameters = {
      take: this.tableConfig.pageSize,
      skip: index * this.tableConfig.pageSize,
      name: (form.name ?? form.firstName ?? null) || null,
      staffTypeId: 1, // Filtrar solo empleados
      ...(form.isActive !== undefined && form.isActive !== null && { isActive: form.isActive }),
    };

    this._staffService.getAllStaffFromDb(queryParams).subscribe({
      next: (response) => {
        // Filtrar solo empleados en el resultado y procesar datos
        const employees = this.processStaffData(response.body.data);
        this.tableConfig.dataSource.data = employees;
        this.tableConfig.length = response.body.count;
        this._changeDetectorRef.markForCheck();
      },
      error: (error) => {
        console.error('Error loading employees:', error);
      }
    });
  }

  onCustom(): void {
    this._customRouterService.navigate(['staff/add-employee']);
  }

  onTableEdit(event: Event, id: number): void {
    event.stopPropagation();
    event.preventDefault();
    this._customRouterService.navigate(['staff/edit-employee', id]);
  }

  onDelete(id: number): void {
    const queryParams: QueryParameters = {
      id: id
    };

    this._staffService.deleteStaff(queryParams).subscribe({
      next: (response) => {
        if (response.body) {
          // Recargar la lista después de eliminar
          this.getAll(0, this._buildFormForRequest());
        }
      },
      error: (error) => {
        console.error('Error deleting employee:', error);
      }
    });
  }

  onPageChange(event: any): void {
    this.getAll(event.pageIndex, this._buildFormForRequest());
  }
}
