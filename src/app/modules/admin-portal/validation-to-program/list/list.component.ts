import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';

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
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericTableConfig } from 'app/shared/components/generic-table/generic-table.interface';
import { TranslocoModule } from '@ngneat/transloco';
import { AgencyService } from 'app/shared/services/agency.service';

// DESCRICION DEL COMPONENTE
// Este componente se encarga de mostrar la lista de validaciones de aplicación a programas.

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
    TranslocoModule,
  ],
})
export class ValidationToProgramListComponent implements OnInit, OnDestroy, OnGenericTableHandler, OnGenericHeaderHandlers {
  // Inyeccion de servicios
  private _formBuilder = inject(UntypedFormBuilder);
  private _agencyService = inject(AgencyService);
  private _customRouterService = inject(CustomRouterService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  // Suscripciones
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // Configuración del header
  headerConfig: GenericHeaderConfig = {
    title: 'validation-to-program.list.title',
    formGroup: this._formBuilder.group({
      name: new FormControl(''),
    }),
    searchFieldShow: true,
    searchInputPlaceholder: 'validation-to-program.list.search.placeholder',
    submitButtonText: 'validation-to-program.list.buttons.save',
  };

  // Configuración de la tabla
  tableConfig: GenericTableConfig = {
    dataSource: [],
    columnsSchema: COLUMNS_SCHEMA,
    displayedColumns: COLUMNS_SCHEMA.map((col) => Array.isArray(col.key) ? col.key[0] : col.key),
    handler: this,
    showPaginator: true,
    pageSize: 15,
    pageSizeOptions: [15, 50, 100],
    length: 0
  };

  // Constructor
  constructor() {}

  // Lifecycle hooks
  ngOnInit() {

    // Get the agencies
    this._agencyService.agencies$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      this.tableConfig.dataSource = result.body.data;
      this.tableConfig.length = result.body.count;
          // Mark for check
      this._changeDetectorRef.markForCheck();
    });
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
    this._customRouterService.navigate([`validation-to-program/edit/${id}`]);
  }

  // Métodos para obtener datos
  getAll(index: number, form: any) {
    const requestParameters: QueryParameters = {
      take: this.tableConfig.pageSize,
      skip: index,
    };

    this._agencyService.getAllAgenciesFromDb(requestParameters).subscribe();
  }

}
