import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';

import { GenericTableConfig, OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { DOCUMENTS_COLUMNS_SCHEMA } from './columns-schema';
import { DOCUMENTS_DATA } from './columns-data';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'app-documents-list',
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
    MatPaginatorModule,
    MatTableModule,
    MatInputModule,
    MatSnackBarModule,
    MatDialogModule,
    RouterModule,
    GenericTableComponent,
    GenericHeaderComponent,
    TranslocoModule,
  ]
})
export class DocumentsListComponent implements OnInit, OnDestroy, OnGenericTableHandler, OnGenericHeaderHandlers {
  // Inyección de servicios
  private _formBuilder = inject(UntypedFormBuilder);
  private _customRouterService = inject(CustomRouterService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _snackBar = inject(MatSnackBar);
  private _fuseConfirmationService = inject(FuseConfirmationService);
  private _dialog = inject(MatDialog);

  // Suscripciones
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // Configuración de la tabla
  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource(DOCUMENTS_DATA),
    dataSourceList: DOCUMENTS_DATA,
    columnsSchema: DOCUMENTS_COLUMNS_SCHEMA,
    displayedColumns: DOCUMENTS_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 15,
    pageSizeOptions: [15, 50, 100],
    length: DOCUMENTS_DATA.length
  };

  // Configuración del header
  headerConfig: GenericHeaderConfig = {
    title: 'documents.list.title',
    formGroup: this._formBuilder.group({
      name: new FormControl(''),
    }),
    searchFieldShow: true,
    searchInputPlaceholder: 'documents.list.search.placeholder',
    saveButtonText: 'documents.list.buttons.upload',
    saveButtonShow: true
  };

  constructor() {}

  ngOnInit(): void {
    // Aquí iría la lógica para cargar los documentos reales
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // Manejador de eventos del header
  onHeaderAction(event: any): void {
    if (event.action === 'add') {
      this.uploadFile();
    } else if (event.action === 'search' && this.headerConfig.formGroup.valid) {
      this.searchFiles(this.headerConfig.formGroup.value);
      this.headerConfig.clearVisible = true;
    }
  }

  onClean(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    // Quita el botón de limpiar
    this.headerConfig.clearVisible = false;
    // Resetea el formulario
    this.headerConfig.formGroup.reset();
    // Restaura los datos originales
    this.tableConfig.dataSource.data = DOCUMENTS_DATA;
    this.tableConfig.dataSourceList = DOCUMENTS_DATA;
    this._changeDetectorRef.markForCheck();
  }

  getPaginator(event: PageEvent): void {
    const pageIndex = !isNullOrUndefinedEmptyStringNullArray(event.pageIndex) ? event.pageIndex : 0;
    this.tableConfig.pageSize = event.pageSize;
    // Aquí iría la lógica de paginación real
    console.log('Página:', pageIndex, 'Tamaño:', event.pageSize);
  }

  // Manejador de eventos de la tabla
  onTableEdit(event: Event, id: string): void {
    console.log('Editar archivo con ID:', id);
  }

  // Manejador de eventos de la tabla
  onTableDownload(event: Event, id: string): void {
    console.log('Descargar archivo con ID:', id);
  }

  // Manejador de eventos de la tabla
  onTableDelete(event: Event, id: string): void {
    console.log('Eliminar archivo con ID:', id);
  }

  uploadFile(): void {
    console.log('Subir archivo');
  }

  searchFiles(filters: any): void {
    console.log('Buscar archivos con filtros:', filters);
  }
}
