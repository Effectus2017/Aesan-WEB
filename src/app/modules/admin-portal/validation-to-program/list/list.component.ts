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
import { SelectionModel } from '@angular/cdk/collections';
// Importa el esquema de columnas
import { COLUMNS_SCHEMA } from './columns-schema';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { GenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface'
// Datos Dummy
import { columnsData } from './columns-data'; // Importar el nuevo archivo

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
    GenericHeaderComponent
],
})
export class ValidationToProgramListComponent implements OnInit, OnDestroy, GenericTableHandler {
  // Inyeccion de servicios
  private _formBuilder = inject(UntypedFormBuilder);
  private _customRouterService = inject(CustomRouterService);
  //private _customersService = inject(CustomersService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _fuseConfirmationService = inject(FuseConfirmationService);
  private _fuseAlertService = inject(FuseAlertService);

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // Variables
  title?: string = 'Validación de Aplicación al Programa';

  list: MatTableDataSource<any> = new MatTableDataSource();
  columnsSchema: any = COLUMNS_SCHEMA; // Usa el esquema importado
  displayedColumns: string[] = COLUMNS_SCHEMA.map((col) => col.key);

  pageSizeOptions = [5, 10, 15, 25];
  pageSize = 15;
  length = 0;
  pageEvent: PageEvent;

  formRoot: UntypedFormGroup;
  clearVisible: boolean = false;

  data = columnsData; // Asignar los datos desde el nuevo archivo

  // Constructor
  constructor() {}
    onCheckChange(event: Event, element: any): void {
        throw new Error('Method not implemented.');
    }

  // Lifecycle hooks
  ngOnInit() {
    this._fuseAlertService.dismiss('alertBox');

    this.formRoot = this._formBuilder.group({
      name: new FormControl(''),
    });

    // Get the accountings
    // this._customersService.customers$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
    //   this.list.data = result.body.data;
    //   // Mark for check
    //   this._changeDetectorRef.markForCheck();
    // });

    this.list.data = this.data; // Asignar datos a la tabla
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // Funciones

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  onSubmit() {
    if (this.formRoot.valid) {
      this.getAll(0, this.formRoot.value);
      this.clearVisible = true;
    }
  }

  get(form: any) {
    // Paginado de tabla
    const index = !isNullOrUndefinedEmptyStringNullArray(this.pageEvent) ? this.pageEvent.pageIndex : 0;
    this.getAll(index, form);
  }

  getPaginator(form: any, event?: PageEvent) {
    // Paginado de tabla
    const index = !isNullOrUndefinedEmptyStringNullArray(event.pageIndex) ? event.pageIndex : 0;
    this.pageSize = event.pageSize;
    this.getAll(index * this.pageSize, form);
  }

  // Obtenemos segun los filtros seleccionados
  getAll(index: number, form: any) {
    const requestParameters: QueryParameters = {
      take: this.pageSize,
      skip: index,
    };

    //this._customersService.getAllCustomersFromDB(requestParameters).subscribe();
  }

  onClear(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.clearVisible = false;
    this.formRoot.reset();
    this.get(this.formRoot.value);
  }

  onGoSubscriptions(event: Event, id: number) {
    event.stopPropagation();
    event.preventDefault();
    //this._customRouterService.navigate([`subscriptions/customer/${id}`]);
  }

  onEdit(event: Event, id: number) {
    event.stopPropagation();
    event.preventDefault();
    console.log('onEdit', event, id);
    //this._customRouterService.navigate([`customers/edit/${id}`]);
  }

  onDelete(event: Event, id: number) {
    event.stopPropagation();
    event.preventDefault();

    // Open the confirmation dialog
    const confirmation = this._fuseConfirmationService.open({
      title: 'Eliminar',
      message: '¿Esta seguro que desea eliminar el siguiente ítem?',
      actions: {
        confirm: {
          label: 'Eliminar',
        },
      },
    });

    // Subscribe to the confirmation dialog closed action
    confirmation.afterClosed().subscribe((result) => {
      // If the confirm button pressed...
      if (result === 'confirmed') {
        // const requestParameters: dtoRequestParameters = { id: id };
        // this._employeeService.delete(id, requestParameters).subscribe({
        //   next: (result: any) => {
        //     switch (result.status) {
        //       case 202:
        //         this.get(this.form.value);
        //         break;
        //       default:
        //         break;
        //     }
        //   },
        //   error: (error) => {
        //     this._fuseAlertService.show('alertBox');
        //   },
        //   complete: () => {},
        // });
      }
    });
  }

}
