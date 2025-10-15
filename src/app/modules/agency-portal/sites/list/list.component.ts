import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation, inject } from '@angular/core';
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
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { SCHOOLS_COLUMNS_SCHEMA } from './columns-schema';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericTableConfig } from 'app/shared/components/generic-table/generic-table.interface';
import { SiteService } from 'app/shared/services/site.service';
import { Site } from 'app/shared/models/Site';
import { AuthService } from 'app/core/auth/auth.service';
import { SiteSatellitesModalComponent } from '../site-satellites-modal/site-satellites-modal.component';
import { SiteSatelliteResponse } from 'app/shared/models/Response/SiteSatelliteResponse';
import { SiteSatellitesModalData } from 'app/shared/models/Response/SiteSatellitesModalData';

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
    TranslocoModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent implements OnInit, OnDestroy, OnGenericTableHandler, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _siteService = inject(SiteService);
  private _customRouterService = inject(CustomRouterService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _authService = inject(AuthService);
  private _route = inject(ActivatedRoute);
  private _dialog = inject(MatDialog);
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  headerConfig: GenericHeaderConfig = {
    title: 'sites.list.title',
    formGroup: this._formBuilder.group({
      name: new FormControl(''),
    }),
    searchFieldShow: true,
    searchInputPlaceholder: 'sites.list.search.placeholder',
    submitButtonText: 'sites.list.buttons.save',
    goToAddButtonShow: true,
    goToAddButtonPermission: 'site.create',
  };

  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<Site>(),
    columnsSchema: SCHOOLS_COLUMNS_SCHEMA,
    displayedColumns: SCHOOLS_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 15,
    pageSizeOptions: [15, 50, 100],
    length: 0,
  };

  constructor() {}

  ngOnInit() {
    // Obtener datos del resolver en lugar de suscribirse
    const resolvedData = this._route.snapshot.data['data'];

    if (resolvedData) {
      this.tableConfig.dataSource.data = resolvedData.sites.data;
      this.tableConfig.length = resolvedData.sites.count;
      this.tableConfig.dataSourceList = resolvedData.sites.data;
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

  getAll(index: number, form: any) {
    const name = form.name || null;
    const pageSize = this.tableConfig.pageSize;

    const requestParameters: QueryParameters = {
      take: pageSize,
      skip: index,
      name: name,
      alls: false,
    };

    this._siteService.getAllSitesFromDb(requestParameters).subscribe();
  }

  getPaginator(event?: PageEvent) {
    const index = !isNullOrUndefinedEmptyStringNullArray(event?.pageIndex) ? event.pageIndex : 0;
    this.tableConfig.pageSize = event?.pageSize || this.tableConfig.pageSize;
    this.getAll(index * this.tableConfig.pageSize, this.headerConfig.formGroup.value);
  }

  onClean(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.headerConfig.clearVisible = false;
    this.headerConfig.formGroup.reset();
    this.getAll(0, this.headerConfig.formGroup.value);
  }

  onTableEdit(event: Event, id: number) {
    event.stopPropagation();
    event.preventDefault();
    this._customRouterService.navigate([`sites/edit/${id}`]);
  }

  onTableCalendar(event: Event, id: number) {
    event.stopPropagation();
    event.preventDefault();
    this._customRouterService.navigate([`sites/calendar/${id}`]);
  }

  onTableSatellites(event: Event, id: number) {
    event.stopPropagation();
    event.preventDefault();
    this.openSatellitesModal(id);
  }

  onAdd() {
    this._customRouterService.navigate(['sites/add']);
  }

  private openSatellitesModal(siteId: number): void {
    // Obtener el nombre del sitio desde la tabla
    const site = this.tableConfig.dataSource.data.find(s => s.id === siteId);
    const siteName = site?.name || 'Sitio';

    // Obtener los sitios satélites
    this._siteService.getSiteSatellitesByMainSiteId(siteId)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response: any) => {
          const dialogRef = this._dialog.open(SiteSatellitesModalComponent, {
            width: '80%',
            maxWidth: '1200px',
            data: {
              siteId: siteId,
              siteName: siteName,
              data: response.body.data,
              totalCount: response.body.count
            }
          });

          dialogRef.afterClosed().subscribe(result => {
            // No hay acciones adicionales necesarias al cerrar el modal
          });
        },
        error: (error) => {
          console.error('Error al obtener sitios satélites:', error);

        }
      });
  }
}
