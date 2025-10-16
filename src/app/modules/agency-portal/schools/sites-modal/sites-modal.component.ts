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
import { SchoolSiteResponse } from '../../../../shared/models/Response/SchoolSiteResponse';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CustomRouterService } from '../../../../shared/services/custom-router.service';
import { SchoolSiteService } from '../../../../shared/services/school-site.service';
import { QueryParameters } from '../../../../shared/models/QueryParameters';

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

  // Datos originales y filtrados
  originalSites: SchoolSiteResponse[] = [];
  filteredSites: SchoolSiteResponse[] = [];

  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<SchoolSiteResponse>([]),
    dataSourceList: [],
    columnsSchema: SITES_COLUMNS_SCHEMA,
    displayedColumns: SITES_COLUMNS_SCHEMA.map(col =>
      Array.isArray(col.key) ? col.key[0] : col.key
    ),
    handler: this,
    showPaginator: true,
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
    this.loadSites();
    this.setupSearchSubscription();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  private loadSites(): void {
    // Usar el servicio para obtener sitios por schoolId
    const queryParameters: QueryParameters = {
      schoolId: this.data.schoolId,
      take: 100,
      skip: 0
    };

    this._schoolSiteService.getSitesBySchoolId(queryParameters)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response: any) => {
          this.originalSites = response.body || [];
          this.filteredSites = [...this.originalSites];
          this.updateTableData();
        },
        error: (error) => {
          console.error('Error al obtener sitios de la escuela:', error);
          // Fallback a datos pasados por el modal si hay error
          this.originalSites = [...(this.data.data || [])];
          this.filteredSites = [...this.originalSites];
          this.updateTableData();
        }
      });
  }

  private setupSearchSubscription(): void {
    this.searchForm.get('search')?.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(searchTerm => {
        this.filterSites(searchTerm);
      });
  }

  private filterSites(searchTerm: string): void {
    if (!searchTerm || searchTerm.trim() === '') {
      this.filteredSites = [...this.originalSites];
    } else {
      const term = searchTerm.toLowerCase().trim();
      this.filteredSites = this.originalSites.filter(schoolSite =>
        schoolSite.siteName?.toLowerCase().includes(term) ||
        schoolSite.site?.address?.toLowerCase().includes(term) ||
        schoolSite.site?.city?.name?.toLowerCase().includes(term) ||
        schoolSite.site?.region?.name?.toLowerCase().includes(term) ||
        schoolSite.site?.siteCode?.toLowerCase().includes(term)
      );
    }
    this.updateTableData();
  }

  private updateTableData(): void {
    // Asignar datos correctamente como en otros componentes
    this.tableConfig.dataSource.data = this.filteredSites;
    this.tableConfig.dataSourceList = this.filteredSites;
    this.tableConfig.length = this.filteredSites.length;
    this._changeDetectorRef.markForCheck();
  }

  onClearSearch(): void {
    this.searchForm.get('search')?.setValue('');
  }

  // Implementación de OnGenericTableHandler
  onTableEdit(event: Event, id: number): void {
    // Por ahora no implementamos edición desde el modal
    console.log('Edit site:', id);
  }

  onTableDelete(event: Event, id: number): void {
    // Por ahora no implementamos eliminación desde el modal
    console.log('Delete site:', id);
  }

  onTableAdd(event?: Event): void {
    // No implementado en este modal
  }

  onTableRefresh(): void {
    // Recargar datos si es necesario
    this.loadSites();
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
