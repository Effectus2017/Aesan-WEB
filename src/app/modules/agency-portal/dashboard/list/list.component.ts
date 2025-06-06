import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { fuseAnimations } from '@fuse/animations';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { NgFor, NgIf } from '@angular/common';
import { TranslocoModule } from '@ngneat/transloco';
import { SharedModule } from 'app/shared/shared.module';
import { agencyDashboardCardsData, agencyDashboardTableData } from './columns-data';
import { GenericTableConfig } from 'app/shared/components/generic-table/generic-table.interface';
import { AGENCY_DASHBOARD_COLUMNS_SCHEMA } from './columns-schema';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';

@Component({
    selector: 'agency-dashboard-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    imports: [CommonModule,
        MatTableModule, MatPaginatorModule, MatSortModule, MatButtonModule, MatIconModule, MatMenuModule, NgFor, NgIf, TranslocoModule,
        SharedModule,
        GenericTableComponent]
})
export class AgencyDashboardListComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers {
  private _changeDetectorRef = inject(ChangeDetectorRef);

  agencyDashboardCardsData = agencyDashboardCardsData;

  // Configuración del header
  headerConfig: GenericHeaderConfig = {
    title: 'navigation.dashboard.title',
  };

  // Configuración de la tabla
  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<any>(),
    dataSourceList: [],
    columnsSchema: AGENCY_DASHBOARD_COLUMNS_SCHEMA,
    displayedColumns: AGENCY_DASHBOARD_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 15,
    pageSizeOptions: [15, 50, 100],
    length: 0,
  };

  constructor() {}

  ngOnInit() {
    this.tableConfig.dataSource.data = agencyDashboardTableData;
    this._changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {}

  onAdd(): void {}
}
