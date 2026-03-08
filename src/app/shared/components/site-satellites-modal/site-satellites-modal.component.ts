import { Component, Inject, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslocoModule } from '@ngneat/transloco';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { GenericTableConfig, OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { SATELLITE_SCHOOLS_COLUMNS_SCHEMA } from './columns-schema';
import { SiteSatelliteResponse } from 'app/shared/models/response/SiteSatelliteResponse';
import { SiteSatellitesModalData } from 'app/shared/models/response/SiteSatellitesModalData';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-site-satellites-modal',
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
  templateUrl: './site-satellites-modal.component.html'
})
export class SiteSatellitesModalComponent implements OnInit, OnDestroy, OnGenericTableHandler {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // Formulario para el buscador
  searchForm: FormGroup;

  // Datos originales y filtrados
  originalSatellites: SiteSatelliteResponse[] = [];
  filteredSatellites: SiteSatelliteResponse[] = [];

  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<SiteSatelliteResponse>([]),
    dataSourceList: [],
    columnsSchema: SATELLITE_SCHOOLS_COLUMNS_SCHEMA,
    displayedColumns: SATELLITE_SCHOOLS_COLUMNS_SCHEMA.map(col =>
      Array.isArray(col.key) ? col.key[0] : col.key
    ),
    handler: this,
    showPaginator: true,
    addButtonShow: false,
    length: 0,
    fullScreen: true,
  };

  constructor(
    public dialogRef: MatDialogRef<SiteSatellitesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SiteSatellitesModalData,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder
  ) {
    this.searchForm = this.formBuilder.group({
      search: new FormControl('')
    });
  }

  ngOnInit(): void {
    this.loadSatellites();
    this.setupSearchSubscription();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  private loadSatellites(): void {
    this.originalSatellites = [...this.data.data];
    this.filteredSatellites = [...this.data.data];
    this.updateTableData();
  }

  private setupSearchSubscription(): void {
    this.searchForm.get('search')?.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(searchTerm => {
        this.filterSatellites(searchTerm);
      });
  }

  private filterSatellites(searchTerm: string): void {
    if (!searchTerm || searchTerm.trim() === '') {
      this.filteredSatellites = [...this.originalSatellites];
    } else {
      const term = searchTerm.toLowerCase().trim();
      this.filteredSatellites = this.originalSatellites.filter(satellite =>
        satellite.satelliteSiteName?.toLowerCase().includes(term) ||
        satellite.comment?.toLowerCase().includes(term) ||
        satellite.assignmentDate?.toLowerCase().includes(term)
      );
    }
    this.updateTableData();
  }

  private updateTableData(): void {
    // Asignar datos correctamente como en otros componentes
    this.tableConfig.dataSource.data = this.filteredSatellites;
    this.tableConfig.dataSourceList = this.filteredSatellites;
    this.tableConfig.length = this.filteredSatellites.length;
    this.cdr.detectChanges();
  }

  onClearSearch(): void {
    this.searchForm.get('search')?.setValue('');
  }

  // Implementación de OnGenericTableHandler
  onTableEdit(event: Event, id: number): void {
    // Por ahora no implementamos edición desde el modal
    console.log('Edit satellite:', id);
  }

  onTableDelete(event: Event, id: number): void {
    // Por ahora no implementamos eliminación desde el modal
    console.log('Delete satellite:', id);
  }

  onTableAdd(event?: Event): void {
    // No implementado en este modal
  }

  onTableRefresh(): void {
    // Recargar datos si es necesario
    this.loadSatellites();
  }

  onAddButtonClick(event?: Event): void {
    // No implementado en este modal
  }

  closeModal(): void {
    this.dialogRef.close();
  }
}
