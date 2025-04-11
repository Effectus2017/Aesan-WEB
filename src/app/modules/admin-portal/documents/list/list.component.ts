import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';

import { GenericTableConfig, OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { COLUMNS_SCHEMA } from './columns-schema';
import { MOCK_DATA } from './columns-data';
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
    RouterModule,
    GenericTableComponent,
    GenericHeaderComponent,
    TranslocoModule
  ]
})
export class DocumentsListComponent implements OnInit, OnDestroy, OnGenericTableHandler, OnGenericHeaderHandlers {
  // Inyección de servicios
  private _formBuilder = inject(UntypedFormBuilder);
  private _customRouterService = inject(CustomRouterService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _snackBar = inject(MatSnackBar);
  private _fuseConfirmationService = inject(FuseConfirmationService);

  // Suscripciones
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // Configuración de la tabla
  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource(MOCK_DATA),
    dataSourceList: MOCK_DATA,
    columnsSchema: COLUMNS_SCHEMA,
    displayedColumns: COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 15,
    pageSizeOptions: [15, 50, 100],
    length: MOCK_DATA.length
  };

  // Configuración del header
  headerConfig: GenericHeaderConfig = {
    title: 'documents.list.title',
    formGroup: this._formBuilder.group({
      fileName: new FormControl(''),
      documentType: new FormControl('')
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

  // Manejador de eventos de la tabla
  onTableAction(event: any): void {
    switch (event.action) {
      case 'download':
        this.downloadFile(event.row);
        break;
      case 'delete':
        this.deleteFile(event.row);
        break;
    }
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
    this.tableConfig.dataSource.data = MOCK_DATA;
    this.tableConfig.dataSourceList = MOCK_DATA;
    this._changeDetectorRef.markForCheck();
  }

  getPaginator(event: PageEvent): void {
    const pageIndex = !isNullOrUndefinedEmptyStringNullArray(event.pageIndex) ? event.pageIndex : 0;
    this.tableConfig.pageSize = event.pageSize;
    // Aquí iría la lógica de paginación real
    console.log('Página:', pageIndex, 'Tamaño:', event.pageSize);
  }

  // Métodos privados para manejar las acciones
  private downloadFile(file: any): void {
    // Aquí iría la lógica para descargar el archivo
    window.open(file.fileUrl, '_blank');
  }

  private deleteFile(file: any): void {
    this._fuseConfirmationService.open({
      title: 'documents.dialog.delete.title',
      message: 'documents.dialog.delete.message',
      icon: {
        show: true,
        name: 'heroicons_outline:exclamation-triangle',
        color: 'warn'
      },
      actions: {
        confirm: {
          label: 'documents.dialog.delete.confirm'
        },
        cancel: {
          label: 'documents.dialog.delete.cancel'
        }
      }
    }).afterClosed().subscribe((result) => {
      if (result === 'confirmed') {
        // Aquí iría la lógica para eliminar el archivo
        this._snackBar.open('Archivo eliminado con éxito', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  private uploadFile(): void {
    // Aquí iría la lógica para subir un nuevo archivo
  }

  private searchFiles(filters: any): void {
    // Aquí iría la lógica para buscar archivos
    console.log('Buscando con filtros:', filters);
    // Por ahora, solo filtramos los datos mock
    const filteredData = MOCK_DATA.filter(file =>
      (!filters.fileName || file.fileName.toLowerCase().includes(filters.fileName.toLowerCase())) &&
      (!filters.documentType || file.documentType.toLowerCase().includes(filters.documentType.toLowerCase()))
    );

    this.tableConfig.dataSource.data = filteredData;
    this.tableConfig.dataSourceList = filteredData;
    this.tableConfig.length = filteredData.length;
    this._changeDetectorRef.markForCheck();
  }
}
