import { Component, Inject, OnInit, ChangeDetectorRef, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslocoModule } from '@ngneat/transloco';
import { GenericTableComponent } from '../../../../shared/components/generic-table/generic-table.component';
import { GenericTableConfig, OnGenericTableHandler } from '../../../../shared/components/generic-table/generic-table.interface';
import { SITES_COLUMNS_SCHEMA } from './columns-schema';
import { Site } from '../../../../shared/models/Site';
import { SchoolSiteTableResponse } from '../../../../shared/models/Response/SchoolSiteTableResponse';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CustomRouterService } from '../../../../shared/services/custom-router.service';
import { SchoolSiteService } from '../../../../shared/services/school-site.service';
import { QueryParameters } from '../../../../shared/models/QueryParameters';
import { PageEvent } from '@angular/material/paginator';
import { isNullOrUndefinedEmptyStringNullArray } from '../../../../shared/utils';

@Component({
  selector: 'app-sites-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    TranslocoModule,
    GenericTableComponent,
    ReactiveFormsModule
  ],
  templateUrl: './sites-modal.component.html'
})
export class SitesModalComponent implements OnInit, OnDestroy, OnGenericTableHandler {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _formBuilder = inject(FormBuilder);
  private _customRouterService = inject(CustomRouterService);
  private _schoolSiteService = inject(SchoolSiteService);

  // Formulario para el buscador
  searchForm: FormGroup;

  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<SchoolSiteTableResponse>([]),
    dataSourceList: [],
    columnsSchema: SITES_COLUMNS_SCHEMA,
    displayedColumns: SITES_COLUMNS_SCHEMA.map(col =>
      Array.isArray(col.key) ? col.key[0] : col.key
    ),
    handler: this,
    showPaginator: true,
    pageSize: 15,
    pageSizeOptions: [5, 10, 15, 25],
    addButtonShow: false,
    length: 0
  };

  constructor(
    public dialogRef: MatDialogRef<SitesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.searchForm = this._formBuilder.group({
      search: new FormControl('')
    });
  }

  ngOnInit(): void {
    this.getAll(0, this.searchForm.value);
    this.setupSearchSubscription();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  getAll(index: number, form: any): void {
    const queryParameters: QueryParameters = {
      schoolId: this.data.schoolId,
      take: this.tableConfig.pageSize,
      skip: index,
      name: form.search || null
    };

    this._schoolSiteService.getSitesBySchoolId(queryParameters)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response: any) => {
          this.tableConfig.dataSource.data = response.body.data || [];
          this.tableConfig.length = response.body.count || 0;
          this.tableConfig.dataSourceList = response.body.data || [];
          this._changeDetectorRef.markForCheck();
        },
        error: (error) => {
          console.error('Error al obtener sitios de la escuela:', error);
          // Fallback a datos pasados por el modal si hay error
          this.tableConfig.dataSource.data = this.data.data || [];
          this.tableConfig.length = this.data.data?.length || 0;
          this.tableConfig.dataSourceList = this.data.data || [];
          this._changeDetectorRef.markForCheck();
        }
      });
  }

  private setupSearchSubscription(): void {
    this.searchForm.get('search')?.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.getAll(0, this.searchForm.value);
      });
  }

  getPaginator(event?: PageEvent): void {
    const index = !isNullOrUndefinedEmptyStringNullArray(event?.pageIndex) ? event.pageIndex : 0;
    this.tableConfig.pageSize = event?.pageSize || this.tableConfig.pageSize;
    this.getAll(index * this.tableConfig.pageSize, this.searchForm.value);
  }

  // Implementación de OnGenericTableHandler
  onTableEdit(event: Event, id: number): void {
    event.stopPropagation();
    event.preventDefault();

    // Buscar el elemento para obtener el siteId (el id recibido es el ID de la relación SchoolSite)
    const element = this.tableConfig.dataSourceList.find(item => item.id === id);
    const siteId = element?.siteId || id; // Fallback al id si no se encuentra

    this.dialogRef.close();
    this._customRouterService.navigate([`sites/edit/${siteId}`]);
  }

  onTableDelete(event: Event, id: number): void {
    // Por ahora no implementamos eliminación desde el modal
    console.log('Delete site:', id);
  }

  onTableAdd(event?: Event): void {
    // No implementado en este modal
  }

  onTableRefresh(): void {
    this.getAll(0, this.searchForm.value);
  }

  onTableCalendar(event: Event, id: number): void {
    event.stopPropagation();
    event.preventDefault();

    // Buscar el elemento para obtener el siteId (el id recibido es el ID de la relación SchoolSite)
    const element = this.tableConfig.dataSourceList.find(item => item.id === id);
    const siteId = element?.siteId || id; // Fallback al id si no se encuentra

    this.dialogRef.close();
    this._customRouterService.navigate([`sites/calendar/${siteId}`]);
  }

  onClearSearch(): void {
    this.searchForm.get('search')?.setValue('');
    this.getAll(0, this.searchForm.value);
  }

  onAddButtonClick(event?: Event): void {
    // Cerrar el modal y navegar a sites/add con schoolId como query parameter
    this.dialogRef.close();
    this._customRouterService.navigate(['sites/add'], {
      queryParams: { schoolId: this.data.schoolId }
    });
  }

  closeModal(): void {
    this.dialogRef.close();
  }
}
