import { Component, OnDestroy, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { TranslocoModule } from '@ngneat/transloco';
import { isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { SCHOOLS_COLUMNS_SCHEMA } from './columns-schema';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericTableConfig } from 'app/shared/components/generic-table/generic-table.interface';
import { SchoolService } from 'app/shared/services/school.service';
import { School } from 'app/shared/models/school/School';
import { AuthService } from 'app/core/auth/auth.service';
import { AddSchoolModalComponent } from '../add-modal/add-school-modal.component';
import { EditSchoolModalComponent } from '../edit-modal/edit-school-modal.component';
import { SitesModalComponent } from '../sites-modal/sites-modal.component';
import { ViewChild } from '@angular/core';
import { GenericFilterDrawerComponent } from 'app/shared/components/generic-filter-drawer/generic-filter-drawer.component';
import { GenericFilterResult } from 'app/shared/components/generic-table/generic-table.interface';
import { OnGenericFilterHandlers } from 'app/shared/components/generic-filter-panel/generic-filter-panel.interface';
import { SCHOOLS_FILTERS_SCHEMA } from './schools-filters-schema';

@Component({
  selector: 'app-schools-list',
  templateUrl: './list.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
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
  private _schoolService = inject(SchoolService);
  private _authService = inject(AuthService);
  private _route = inject(ActivatedRoute);
  private _dialog = inject(MatDialog);
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  @ViewChild('filterDrawer') filterDrawer!: GenericFilterDrawerComponent;

  filtersSchema = SCHOOLS_FILTERS_SCHEMA;
  appliedFilters: GenericFilterResult = {};

  headerConfig: GenericHeaderConfig = {
    title: 'schools.list.title',
    formGroup: this._formBuilder.group({
      name: new FormControl(''),
    }),
    searchFieldShow: false,
    searchInputPlaceholder: 'schools.list.search.placeholder',
    submitButtonText: 'schools.list.buttons.save',
    customButtonShow: true,
    customButtonClass: 'bg-[#F39B1A] text-white',
    customButtonIcon: 'add',
    customButtonIconEnabled: true,
    customButtonPermission: 'school.create',
    filterButtonShow: true,
    filterButtonTooltip: 'global.tooltips.header.filter',
  };

  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<School>(),
    columnsSchema: SCHOOLS_COLUMNS_SCHEMA,
    displayedColumns: SCHOOLS_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 15,
    pageSizeOptions: [15, 50, 100],
    length: 0,
    fullScreen: true,
  };

  constructor() {}

  ngOnInit() {
    // Obtener datos del resolver en lugar de suscribirse
    const resolvedData = this._route.snapshot.data['data'];

    if (resolvedData) {
      this.tableConfig.dataSource.data = resolvedData.schools.data;
      this.tableConfig.length = resolvedData.schools.count;
      this.tableConfig.dataSourceList = resolvedData.schools.data;
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onSearch() {
    this.getAll(0, this._buildFormForRequest());
    this.headerConfig.clearVisible = true;
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
  }

  /** Restablecer filtros del panel y recargar sin filtros adicionales. */
  onFiltersReset(): void {
    this.appliedFilters = {};
    this.getAll(0, this._buildFormForRequest());
  }

  /** Construye el objeto form que usa getAll: búsqueda del header + filtros del panel. */
  private _buildFormForRequest(): Record<string, unknown> {
    const header = this.headerConfig.formGroup?.value ?? {};
    return { ...header, ...this.appliedFilters };
  }

  getAll(index: number, form: any) {
    const name = form.name || null;
    const isActive = form.isActive !== undefined && form.isActive !== null ? form.isActive : null;
    const schoolCode = form.schoolCode || null;
    const pageSize = this.tableConfig.pageSize;
    const agencyId = this._authService.getAgencyId();

    const requestParameters: QueryParameters = {
      take: pageSize,
      skip: index,
      name: name,
      isActive: isActive,
      schoolCode: schoolCode,
      alls: false,
      agencyId: agencyId,
    };

    this._schoolService.getSchoolsByAgencyId(requestParameters)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response: any) => {
          this.tableConfig.dataSource.data = response.body.data;
          this.tableConfig.length = response.body.count;
          this.tableConfig.dataSourceList = response.body.data;
        },
        error: (error) => {
          console.error('Error loading schools:', error);
        }
      });
  }

  getPaginator(event?: PageEvent) {
    const index = !isNullOrUndefinedEmptyStringNullArray(event?.pageIndex) ? event.pageIndex : 0;
    this.tableConfig.pageSize = event?.pageSize || this.tableConfig.pageSize;
    this.getAll(index * this.tableConfig.pageSize, this._buildFormForRequest());
  }

  onClean(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.headerConfig.clearVisible = false;
    this.headerConfig.formGroup.reset();
    this.appliedFilters = {};
    this.getAll(0, this._buildFormForRequest());
  }

  onCustom() {
    this.openAddSchoolModal();
  }

  private openAddSchoolModal(): void {
    const dialogRef = this._dialog.open(AddSchoolModalComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: {
        // Puedes pasar datos adicionales si es necesario
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Si se creó una escuela exitosamente, recargar la lista
        this.getAll(0, this.headerConfig.formGroup.value);
      }
    });
  }

  onTableEditModal(event: Event, schoolId: number): void {
    event.stopPropagation();
    event.preventDefault();
    this.openEditSchoolModal(schoolId);
  }

  private openEditSchoolModal(schoolId: number): void {
    const school = this.tableConfig.dataSource.data.find(s => s.id === schoolId);

    const dialogRef = this._dialog.open(EditSchoolModalComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: {
        schoolId: schoolId,
        schoolName: school?.name || ''
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getAll(0, this.headerConfig.formGroup.value);
      }
    });
  }

  onTableSites(event: Event, schoolId: number) {
    event.stopPropagation();
    event.preventDefault();
    this.openSitesModal(schoolId);
  }

  private openSitesModal(schoolId: number): void {
    // Obtener el nombre de la escuela desde la tabla
    const school = this.tableConfig.dataSource.data.find(s => s.id === schoolId);
    const schoolName = school?.name || 'Escuela';

    // Abrir el modal - ahora el SitesModalComponent maneja la carga de datos internamente
    const dialogRef = this._dialog.open(SitesModalComponent, {
      width: '80%',
      maxWidth: '1200px',
      data: {
        schoolId: schoolId,
        schoolName: schoolName
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      // No hay acciones adicionales necesarias al cerrar el modal
    });
  }
}
