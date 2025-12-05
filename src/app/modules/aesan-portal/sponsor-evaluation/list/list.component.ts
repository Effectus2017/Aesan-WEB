import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ProgramRequest } from 'app/shared/models/program-request.types';
import { ProgramRequestService } from 'app/shared/services/program-request.service';
import { Subject, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { FormControl, UntypedFormBuilder } from '@angular/forms';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericTableConfig, OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { SPONSOR_EVALUATION_COLUMNS_SCHEMA } from './columns-schema';
import { sponsorEvaluationColumnsData } from './columns-data';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { AgencyService } from 'app/shared/services/agency.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { AuthService } from 'app/core/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';

@Component({
    selector: 'aesan-sponsor-evaluation-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatButtonModule, MatIconModule, MatMenuModule, GenericHeaderComponent, GenericTableComponent]
})
export class AesanSponsorEvaluationListComponent implements OnInit, OnDestroy, OnGenericTableHandler, OnGenericHeaderHandlers {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<ProgramRequest>;

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  private _formBuilder = inject(UntypedFormBuilder);
  private _programRequestService: ProgramRequestService = inject(ProgramRequestService);
  private _customRouterService = inject(CustomRouterService);
  private _agencyService: AgencyService = inject(AgencyService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _authService: AuthService = inject(AuthService);
  private _route = inject(ActivatedRoute);

  // Configuración del header
  headerConfig: GenericHeaderConfig = {
    title: 'sponsor-evaluation.list.title',
    formGroup: this._formBuilder.group({
      name: new FormControl(''),
    }),
    searchFieldShow: true,
    searchInputPlaceholder: 'sponsor-evaluation.list.search.placeholder',
    submitButtonText: 'sponsor-evaluation.list.buttons.save',
    goToAddButtonShow: true,
  };

  // Configuración de la tabla
  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<ProgramRequest>(),
    dataSourceList: [],
    columnsSchema: SPONSOR_EVALUATION_COLUMNS_SCHEMA,
    displayedColumns: SPONSOR_EVALUATION_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 25,
    pageSizeOptions: [25, 50, 100],
    length: 0,
    fullScreen: true,
  };



  ngOnInit(): void {
    // Obtener datos del resolver
    const resolvedData = this._route.snapshot.data['data'];

    if (resolvedData) {
      this.tableConfig.dataSource.data = resolvedData.agencies.data;
      this.tableConfig.length = resolvedData.agencies.count;
      // Lista de datos
      this.tableConfig.dataSourceList = resolvedData.agencies.data;
      this._changeDetectorRef.markForCheck();
    }
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

  // Métodos para obtener datos
  getAll(index: number, form: any) {
    const userId = this._authService.getUserId();
    const requestParameters: QueryParameters = {
      take: this.tableConfig.pageSize,
      skip: index,
      name: form.name || null,
      alls: false,
      isList: false,
      userId: userId,
      isPropietary: false,
      regionId: null,
      cityId: null,
      programId: null,
      statusId: null,
    };

    this._agencyService.getAllAgenciesFromDb(requestParameters).subscribe((result: any) => {
      this.tableConfig.dataSource.data = result.body.data;
      this.tableConfig.length = result.body.count;
      this.tableConfig.dataSourceList = result.body.data;
      this._changeDetectorRef.markForCheck();
    });
  }

  getPaginator(event?: PageEvent) {
    // Paginado de tabla
    const index = !isNullOrUndefinedEmptyStringNullArray(event.pageIndex) ? event.pageIndex : 0;
    this.tableConfig.pageSize = event.pageSize;
    this.getAll(index * this.tableConfig.pageSize, this.headerConfig.formGroup.value);
  }

  onClean(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    // quita el botón de limpiar
    this.headerConfig.clearVisible = false;
    // resetea el formulario
    this.headerConfig.formGroup.reset();
    // obtiene todos los datos
    this.getAll(0, this.headerConfig.formGroup.value);
  }

  onAdd(): void {}

  onTableEdit(event: Event, id: number): void {
    event.stopPropagation();
    event.preventDefault();
    this._customRouterService.navigate([`sponsor-evaluation/edit/${id}`]);
  }

  onTableDelete(event: Event, id: number): void {
    event.stopPropagation();
    event.preventDefault();
  }
}
