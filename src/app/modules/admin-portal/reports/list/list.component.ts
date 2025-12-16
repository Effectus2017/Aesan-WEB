import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { GenericTableConfig, OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { REPORTS_COLUMNS_SCHEMA } from './columns-schema';

export interface ReportItem {
  id: string;
  name: string;
  description: string;
  route: string;
  icon?: string;
}

@Component({
  selector: 'app-reports-list',
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
    MatTableModule,
    MatInputModule,
    RouterModule,
    GenericTableComponent,
    GenericHeaderComponent,
    TranslocoModule,
  ],
})
export class ReportsListComponent implements OnInit, OnDestroy, OnGenericTableHandler, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _customRouterService = inject(CustomRouterService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _translocoService = inject(TranslocoService);
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  headerConfig: GenericHeaderConfig = {
    title: 'reports.list.title',
    formGroup: this._formBuilder.group({
      name: new FormControl(''),
    }),
    searchFieldShow: true,
    searchInputPlaceholder: 'reports.list.search.placeholder',
  };

  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<ReportItem>(),
    dataSourceList: [],
    columnsSchema: REPORTS_COLUMNS_SCHEMA,
    displayedColumns: REPORTS_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: false,
    pageSize: 15,
    pageSizeOptions: [15, 50, 100],
    length: 0,
    fullScreen: true,
  };

  constructor() {}

  ngOnInit(): void {
    // Datos estáticos de los reportes disponibles
    const reports: ReportItem[] = [
      {
        id: 'school-hierarchy-tree',
        name: this._translocoService.translate('reports.list.reports.schoolHierarchyTree.name'),
        description: this._translocoService.translate('reports.list.reports.schoolHierarchyTree.description'),
        route: 'school-hierarchy-tree',
        icon: 'account_tree',
      },
    ];

    this.tableConfig.dataSource.data = reports;
    this.tableConfig.dataSourceList = reports;
    this.tableConfig.length = reports.length;
    this._changeDetectorRef.markForCheck();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onSearch(): void {
    if (this.headerConfig.formGroup.valid) {
      const searchTerm = this.headerConfig.formGroup.value.name?.toLowerCase() || '';
      const allReports = this.tableConfig.dataSourceList as ReportItem[];

      if (searchTerm) {
        const filtered = allReports.filter(
          (report) =>
            report.name?.toLowerCase().includes(searchTerm) ||
            report.description?.toLowerCase().includes(searchTerm)
        );
        this.tableConfig.dataSource.data = filtered;
        this.headerConfig.clearVisible = true;
      } else {
        this.tableConfig.dataSource.data = allReports;
        this.headerConfig.clearVisible = false;
      }
      this._changeDetectorRef.markForCheck();
    }
  }

  onClean(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.headerConfig.clearVisible = false;
    this.headerConfig.formGroup.reset();
    const allReports = this.tableConfig.dataSourceList as ReportItem[];
    this.tableConfig.dataSource.data = allReports;
    this._changeDetectorRef.markForCheck();
  }

  onTableEdit(event: Event, id: string): void {
    event.stopPropagation();
    event.preventDefault();

    switch (id) {
      case 'school-hierarchy-tree':
        this._customRouterService.navigate(['reports/school-hierarchy-tree']);
        break;
      default:
        break;
    }
  }

  getPaginator(): void {
    // No se usa paginación para la lista de reportes
  }
}

