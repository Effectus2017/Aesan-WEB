import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ProgramRequest } from 'app/shared/models/program/program-request.types';
import { ProgramRequestService } from 'app/shared/services/program-request.service';
import { Subject, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { FormControl, UntypedFormBuilder } from '@angular/forms';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericTableConfig, OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { PROGRAM_REQUESTS_COLUMNS_SCHEMA } from './columns-schema';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { programRequestsColumnsData } from './columns-data';
import { ProgramService } from 'app/shared/services/program.service';
import { AuthService } from 'app/core/auth/auth.service';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'agency-program-requests-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatButtonModule, MatIconModule, MatMenuModule, GenericHeaderComponent, GenericTableComponent]
})
export class AgencyProgramRequestsListComponent implements OnInit, OnDestroy, OnGenericTableHandler, OnGenericHeaderHandlers {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<ProgramRequest>;

  private _formBuilder = inject(UntypedFormBuilder);
  private _programService: ProgramService = inject(ProgramService);
  private _authService: AuthService = inject(AuthService);
  private _programRequestService: ProgramRequestService = inject(ProgramRequestService);
  private _customRouterService = inject(CustomRouterService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _route = inject(ActivatedRoute);

  // Configuración del header
  headerConfig: GenericHeaderConfig = {
    title: 'program-requests.list.title',
    agency: this._authService.getUserDataFromToken()?.agency,
    formGroup: this._formBuilder.group({
      name: new FormControl(''),
    }),
    searchFieldShow: true,
    searchInputPlaceholder: 'program-requests.list.search.placeholder',
    submitButtonText: 'program-requests.list.buttons.save',
    goToAddButtonShow: true,
  };

  // Configuración de la tabla
  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<ProgramRequest>(),
    dataSourceList: [],
    columnsSchema: PROGRAM_REQUESTS_COLUMNS_SCHEMA,
    displayedColumns: PROGRAM_REQUESTS_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 25,
    pageSizeOptions: [25, 50, 100],
    length: 0,
    fullScreen: true,
  };

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor() {}

  ngOnInit(): void {
    // Obtener datos del resolver en lugar de suscribirse
    const resolvedData = this._route.snapshot.data['data'];

    if (resolvedData) {
      this.tableConfig.dataSource.data = resolvedData.programInscriptions.data;
      this.tableConfig.length = resolvedData.programInscriptions.count;
      this.tableConfig.dataSourceList = resolvedData.programInscriptions.data;
      this._changeDetectorRef.markForCheck();
    } else {
      // Fallback a datos estáticos si no hay resolver
      this.tableConfig.dataSource.data = programRequestsColumnsData;
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  getPaginator(event?: PageEvent) {
    // Paginado de tabla
  }

  onAdd(): void {}
}
