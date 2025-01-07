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
import { PREOPERATIONAL_VISIT_COLUMNS_SCHEMA } from './columns-schema';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { AgencyService } from 'app/shared/services/agency.service';

@Component({
  selector: 'pdam-preoperational-visit-list',
  templateUrl: './list.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatButtonModule, MatIconModule, MatMenuModule, GenericHeaderComponent, GenericTableComponent],
})
export class PdamPreoperationalVisitListComponent implements OnInit, OnDestroy, OnGenericTableHandler, OnGenericHeaderHandlers {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<ProgramRequest>;

  private _formBuilder = inject(UntypedFormBuilder);
  private _programRequestService: ProgramRequestService = inject(ProgramRequestService);
  private _customRouterService = inject(CustomRouterService);
  private _agencyService: AgencyService = inject(AgencyService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  // Configuración del header
  headerConfig: GenericHeaderConfig = {
    title: 'preoperational-visit.list.title',
    formGroup: this._formBuilder.group({
      name: new FormControl(''),
    }),
    searchFieldShow: true,
    searchInputPlaceholder: 'preoperational-visit.list.search.placeholder',
    submitButtonText: 'preoperational-visit.list.buttons.save',
    goToAddButtonShow: true,
  };

  // Configuración de la tabla
  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<ProgramRequest>(),
    dataSourceList: [],
    columnsSchema: PREOPERATIONAL_VISIT_COLUMNS_SCHEMA,
    displayedColumns: PREOPERATIONAL_VISIT_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 25,
    pageSizeOptions: [25, 50, 100],
    length: 0,
  };

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor() {}

  ngOnInit(): void {
    // Get the agencies
    this._agencyService.agencies$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      this.tableConfig.dataSource.data = result.body.data;
      this.tableConfig.length = result.body.count;
      // Lista de datos
      this.tableConfig.dataSourceList = result.body.data;

      // Mark for check
      this._changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  getPaginator(event?: PageEvent) {
    // Paginado de tabla
  }

  onAdd(): void {}

  onEdit(event: Event, id: number): void {
    event.stopPropagation();
    event.preventDefault();
    this._customRouterService.navigate([`pre-operational/edit/${id}`]);
  }
}
