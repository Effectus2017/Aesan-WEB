import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
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
import { UploadService } from 'app/shared/services/upload.service';
import { TranslocoService } from '@ngneat/transloco';
import { AuthService } from 'app/core/auth/auth.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { AgencyFilesService } from 'app/shared/services/agency-files.service';
import { AgencyFile } from 'app/shared/models/AgencyFile';

@Component({
    selector: 'app-documents-list',
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
  private _uploadService = inject(UploadService);
  private _translocoService = inject(TranslocoService);
  private _authService = inject(AuthService);
  private _agencyFilesService = inject(AgencyFilesService);
  // Suscripciones
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // Configuración de la tabla
  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<AgencyFile>(),
    dataSourceList: [],
    columnsSchema: DOCUMENTS_COLUMNS_SCHEMA,
    displayedColumns: DOCUMENTS_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 15,
    pageSizeOptions: [15, 50, 100],
    length: 0,
  };

  // Configuración del header
  headerConfig: GenericHeaderConfig = {
    title: 'documents.list.title',
    formGroup: this._formBuilder.group({
      name: new FormControl(''),
    }),
    searchFieldShow: true,
    searchInputPlaceholder: 'documents.list.search.placeholder',
    uploadButtonShow: true,
    uploadButtonText: 'documents.list.buttons.upload',
    uploadButtonColor: 'primary',
    uploadButtonClass: 'ml-2 bg-[#F39B1A] text-white',
    uploadButtonDisabled: false,
  };

  agencyId: number;
  userId: string;
  constructor() {}

  ngOnInit(): void {
    // Obtener el ID de la agencia del usuario actual
    this.agencyId = this._authService.getAgencyId();
    this.userId = this._authService.getUserId();

    this._agencyFilesService.files$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      this.tableConfig.dataSource.data = result.body.data;
      this.tableConfig.length = result.body.count;

      // Lista de datos
      this.tableConfig.dataSourceList = result.body.data;

      // Marcar para que se actualice la vista
      this._changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onClean(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    // Quita el botón de limpiar
    this.headerConfig.clearVisible = false;
    // Resetea el formulario
    this.headerConfig.formGroup.reset();
    // Restaura los datos originales
    this.getAll(0, this.headerConfig.formGroup.value);
    this._changeDetectorRef.markForCheck();
  }

  getPaginator(event: PageEvent): void {
    const pageIndex = !isNullOrUndefinedEmptyStringNullArray(event.pageIndex) ? event.pageIndex : 0;
    this.tableConfig.pageSize = event.pageSize;
    // Aquí iría la lógica de paginación real
    console.log('Página:', pageIndex, 'Tamaño:', event.pageSize);
  }

  // Métodos para obtener datos
  getAll(index: number, form: any) {
    const requestParameters: QueryParameters = {
      take: this.tableConfig.pageSize,
      skip: index,
      alls: true,
      agencyId: this.agencyId,
      name: form.name || null,
    };

    this._agencyFilesService.getAgencyFiles(requestParameters).subscribe();
  }

  // Manejador de eventos de la tabla
  onTableEdit(event: Event, id: string): void {
    event.stopPropagation();
    event.preventDefault();

    // Obtener el archivo por su ID
    const params: QueryParameters = {
      id: parseInt(id),
    };

    this._agencyFilesService.getAgencyFileById(params).subscribe({
      next: (response) => {
        if (response?.body?.fileUrl) {
          // Abrir el archivo en una nueva pestaña
          window.open(response.body.fileUrl, '_blank');
        } else {
          this._snackBar.open(this._translocoService.translate('documents.list.messages.open.error'), this._translocoService.translate('dialog.error.close'), {
            duration: 3000,
          });
        }
      },
      error: (error) => {
        console.error('Error al abrir el archivo:', error);
        this._snackBar.open(this._translocoService.translate('documents.list.messages.open.error'), this._translocoService.translate('dialog.error.close'), { duration: 3000 });
      },
    });
  }

  onSearch() {
    if (this.headerConfig.formGroup.valid) {
      this.getAll(0, this.headerConfig.formGroup.value);
      this.headerConfig.clearVisible = true;
    }
  }

  // Manejador de eventos de la tabla
  onTableDownload(event: Event, id: string): void {
    event.stopPropagation();
    event.preventDefault();

    // Obtener el archivo por su ID
    const params: QueryParameters = {
      id: parseInt(id),
    };

    this._agencyFilesService.getAgencyFileById(params).subscribe({
      next: (response) => {
        if (response?.body?.fileUrl) {
          // Crear un elemento <a> temporal
          const link = document.createElement('a');
          link.href = response.body.fileUrl;
          link.download = response.body.fileName || 'documento';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          this._snackBar.open(this._translocoService.translate('documents.list.messages.download.error'), this._translocoService.translate('dialog.error.close'), {
            duration: 3000,
          });
        }
      },
      error: (error) => {
        console.error('Error al descargar el archivo:', error);
        this._snackBar.open(this._translocoService.translate('documents.list.messages.download.error'), this._translocoService.translate('dialog.error.close'), { duration: 3000 });
      },
    });
  }

  // Manejador de eventos de la tabla
  onTableDelete(event: Event, id: string): void {
    event.stopPropagation();
    event.preventDefault();

    // Mostrar diálogo de confirmación
    this._fuseConfirmationService
      .open({
        title: this._translocoService.translate('documents.messages.delete.title'),
        message: this._translocoService.translate('documents.messages.delete.confirmation'),
        icon: {
          show: true,
          name: 'heroicons_outline:exclamation-circle',
          color: 'warn',
        },
        actions: {
          confirm: {
            show: true,
            label: this._translocoService.translate('dialog.confirm.yes'),
            color: 'warn',
          },
          cancel: {
            show: true,
            label: this._translocoService.translate('dialog.confirm.no'),
          },
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result === 'confirmed') {
          // Eliminar el archivo si se confirma
          const params: QueryParameters = {
            id: parseInt(id),
          };

          this._agencyFilesService.deleteAgencyFile(params).subscribe({
            next: () => {
              // Mostrar mensaje de éxito
              this._snackBar.open(this._translocoService.translate('documents.list.messages.delete.success'), this._translocoService.translate('dialog.success.close'), {
                duration: 3000,
              });

              this.getAll(0, this.headerConfig.formGroup.value);
            },
            error: (error) => {
              console.error('Error al eliminar el archivo:', error);

              this._snackBar.open(this._translocoService.translate('documents.list.messages.delete.error'), this._translocoService.translate('dialog.error.ok'), {
                duration: 3000,
              });

              this.getAll(0, this.headerConfig.formGroup.value);
            },
          });
        }
      });
  }

  onHeaderUploadFile(event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    const target = event.target as HTMLInputElement;
    const file = target.files[0];

    if (file) {
      // Verificar que sea un tipo de archivo permitido
      const allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (!allowedTypes.includes(fileExt)) {
        this._fuseConfirmationService.open({
          title: this._translocoService.translate('documents.messages.upload.title'),
          message: this._translocoService.translate('documents.messages.upload.invalidType'),
          icon: {
            show: true,
            name: 'heroicons_outline:exclamation-circle',
            color: 'error',
          },
          actions: {
            confirm: {
              show: true,
              label: this._translocoService.translate('dialog.error.confirm'),
              color: 'primary',
            },
            cancel: {
              show: false,
            },
          },
        });
        return;
      }

      // Crear los parámetros de consulta
      const params: QueryParameters = {
        agencyId: this.agencyId,
        userId: this.userId,
        description: 'agencyDocument',
        documentType: 'factura',
      };

      // Subir el archivo usando el servicio
      this._uploadService.uploadAgencyFile(params, file).subscribe({
        next: (response) => {
          // Mostrar mensaje de éxito
          this._fuseConfirmationService.open({
            title: this._translocoService.translate('documents.messages.upload.title'),
            message: this._translocoService.translate('documents.messages.upload.success'),
            icon: {
              show: true,
              name: 'heroicons_outline:check-circle',
              color: 'success',
            },
            actions: {
              confirm: {
                show: true,
                label: this._translocoService.translate('dialog.success.confirm'),
                color: 'primary',
              },
              cancel: {
                show: false,
              },
            },
          });

          this.getAll(0, this.headerConfig.formGroup.value);

          // Recargar la lista de documentos
          // TODO: Implementar la recarga de documentos
          this._changeDetectorRef.markForCheck();
        },
        error: (error) => {
          // Mostrar mensaje de error
          this._fuseConfirmationService.open({
            title: this._translocoService.translate('documents.messages.upload.title'),
            message: this._translocoService.translate('documents.messages.upload.error'),
            icon: {
              show: true,
              name: 'heroicons_outline:exclamation-circle',
              color: 'error',
            },
            actions: {
              confirm: {
                show: true,
                label: this._translocoService.translate('dialog.error.confirm'),
                color: 'primary',
              },
              cancel: {
                show: false,
              },
            },
          });
        },
      });
    }
  }

  searchFiles(filters: any): void {
    console.log('Buscar archivos con filtros:', filters);
  }
}
