import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';

import { Subject } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertService } from '@fuse/components/alert';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { MatInputModule } from '@angular/material/input';
import { NgFor, NgIf } from '@angular/common';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';
// Importa el esquema de columnas
import { COLUMNS_SCHEMA } from './columns-schema';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
// Datos Dummy
import { columnsData } from './columns-data'; // Importar el nuevo archivo
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericTableConfig } from 'app/shared/components/generic-table/generic-table.interface';

@Component({
  selector: 'app-admin-validation-to-program-list',
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
    RouterModule,
    NgFor,
    NgIf,
    GenericTableComponent,
    GenericHeaderComponent,
  ],
})
export class ValidationToProgramListComponent implements OnInit, OnDestroy, OnGenericTableHandler, OnGenericHeaderHandlers {
  // Inyeccion de servicios
  private _formBuilder = inject(UntypedFormBuilder);
  private _customRouterService = inject(CustomRouterService);
  //   //private _customersService = inject(CustomersService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  //   private _fuseConfirmationService = inject(FuseConfirmationService);
  //   private _fuseAlertService = inject(FuseAlertService);

  // Suscripciones
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  //   clearVisible: boolean = false;

  // Configuración del header
  headerConfig: GenericHeaderConfig = {
    title: 'Validación de Aplicación al Programa',
    formGroup: this._formBuilder.group({
      name: new FormControl(''),
    }),
    searchFieldShow: true,
    searchInputPlaceholder: 'Buscar usuario',



    submitButtonText: 'Guardar',
  };

  // Configuración de la tabla
  tableConfig: GenericTableConfig = {
    dataSource: [],
    columnsSchema: COLUMNS_SCHEMA,
    displayedColumns: COLUMNS_SCHEMA.map((col) => col.key),
    handler: this,
    showPaginator: true,
    pageSize: 10,
    pageSizeOptions: [5, 10, 25, 100],
    length: 0
  };

  // Constructor
  constructor() {}

  //   // Lifecycle hooks
  ngOnInit() {

    //     // Get the accountings
    //     // this._customersService.customers$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
    //     //   this.list.data = result.body.data;
    //     //   // Mark for check
    //     //   this._changeDetectorRef.markForCheck();
    //     // });
    this.tableConfig.dataSource = columnsData; // Asignar datos a la tabla
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onSubmit() {
    if (this.headerConfig.formGroup.valid) {
      console.log('onSubmit', this.headerConfig.formGroup.value);
      //this.getAll(0, this.headerConfig.formGroup.value);
      this.headerConfig.clearVisible = true;
    }
  }

  getPaginator(form: any, event?: PageEvent) {
    // Paginado de tabla
    const index = !isNullOrUndefinedEmptyStringNullArray(event.pageIndex) ? event.pageIndex : 0;
    this.tableConfig.pageSize = event.pageSize;
    //this.getAll(index * this.pageSize, form);
  }

  onClean(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    //     this.clearVisible = false;
    //     this.formRoot.reset();
    //     this.get(this.formRoot.value);
  }

  onEdit(event: Event, id: number) {
    event.stopPropagation();
    event.preventDefault();
    console.log('onEdit', event, id);
    //this._customRouterService.navigate([`customers/edit/${id}`]);
  }

  // Métodos para obtener datos
  getAll(index: number, form: any) {
    const requestParameters: QueryParameters = {
      take: this.tableConfig.pageSize,
      skip: index,
    };

    //this._customersService.getAllCustomersFromDB(requestParameters).subscribe();
  }


}
