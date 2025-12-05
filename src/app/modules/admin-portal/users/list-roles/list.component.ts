import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';

import { QueryParameters } from '../../../../shared/models/QueryParameters';
import { Subject, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { UsersService } from '../../../../shared/services/users.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ROLES_COLUMNS_SCHEMA } from './columns-schema';
import { isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { GenericTableConfig } from 'app/shared/components/generic-table/generic-table.interface';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { GenericHeaderConfig } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';

@Component({
    selector: 'app-list-roles',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatTableModule, GenericTableComponent, GenericHeaderComponent, MatPaginatorModule]
})
export class RolesListComponent implements OnInit, OnDestroy {

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  data: any[];

  @ViewChild(MatSort) sort: MatSort;

  private _formBuilder: UntypedFormBuilder = inject(UntypedFormBuilder);
  private router: Router = inject(Router);
  private _usersService: UsersService = inject(UsersService);
  private _changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);

  headerConfig: GenericHeaderConfig = {
    title: 'roles.list.title',
    formGroup: this._formBuilder.group({
      name: new FormControl(''),
    }),
    searchFieldShow: true,
    searchInputPlaceholder: 'global.search.placeholder',
    goToAddButtonShow: true,
  };

  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<any>(),
    dataSourceList: [],
    columnsSchema: ROLES_COLUMNS_SCHEMA,
    displayedColumns: ROLES_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
    length: 0,
    fullScreen: true,
  };

  constructor() {}

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  ngOnInit() {

    this._usersService.roles$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      this.tableConfig.dataSource.data = result.body.data;
      this.tableConfig.length = result.body.count;
      this._changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

//   onSubmit() {
//     if (this.form.valid) {
//       this.getAll(0, this.form.value);
//       this.clearVisible = true;
//     }
//   }


  getPaginator(form: any, event?: PageEvent) {
    // Paginado de tabla
    const index = !isNullOrUndefinedEmptyStringNullArray(event.pageIndex) ? event.pageIndex : 0;
    this.tableConfig.pageSize = event.pageSize;
    this.getAll(index * this.tableConfig.pageSize, form);
  }

  // Obtenemos segun los filtros seleccionados
  getAll(index: number, form: any) {
    const requestParameters: QueryParameters = {
      take: this.tableConfig.pageSize,
      skip: index,
    };

    this._usersService.getAllRolesFromDb(requestParameters).subscribe();
  }

//   onClear(event: Event) {
//     event.stopPropagation();
//     event.preventDefault();
//     this.clearVisible = false;
//     this.form.reset();
//     // this.get(this.form.value);
//   }

  onEdit(event: Event, id: number) {
    event.stopPropagation();
    event.preventDefault();
    this.router.navigate([`users/edit/${id}`]);
  }

  onDelete(event: Event, id: number) {
    event.stopPropagation();
    event.preventDefault();

    // Open the confirmation dialog
    // const confirmation = this._fuseConfirmationService.open({
    //   title: 'Eliminar',
    //   message: '¿Esta seguro que desea eliminar el siguiente ítem?',
    //   actions: {
    //     confirm: {
    //       label: 'Eliminar',
    //     },
    //   },
    // });

    // // Subscribe to the confirmation dialog closed action
    // confirmation.afterClosed().subscribe((result) => {
    //   // If the confirm button pressed...
    //   if (result === 'confirmed') {
    //     // const requestParameters: dtoRequestParameters = { id: id };
    //     // this._employeeService.delete(id, requestParameters).subscribe({
    //     //   next: (result: any) => {
    //     //     switch (result.status) {
    //     //       case 202:
    //     //         this.get(this.form.value);
    //     //         break;
    //     //       default:
    //     //         break;
    //     //     }
    //     //   },
    //     //   error: (error) => {
    //     //     this._fuseAlertService.show('alertBox');
    //     //   },
    //     //   complete: () => {},
    //     // });
    //   }
    // });
  }
}
