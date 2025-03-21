import { Component, ViewEncapsulation, OnInit, OnDestroy, inject, ChangeDetectorRef } from "@angular/core";
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, FormControl } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatPaginatorModule, PageEvent } from "@angular/material/paginator";
import { MatTableModule, MatTableDataSource } from "@angular/material/table";
import { RouterModule } from "@angular/router";
import { fuseAnimations } from "@fuse/animations";
import { FuseConfirmationService } from "@fuse/services/confirmation";
import { GenericHeaderComponent } from "app/shared/components/generic-header/generic-header.component";
import { GenericHeaderConfig, OnGenericHeaderHandlers } from "app/shared/components/generic-header/generic-header.interface";
import { GenericTableComponent } from "app/shared/components/generic-table/generic-table.component";
import { GenericTableConfig, OnGenericTableHandler } from "app/shared/components/generic-table/generic-table.interface";
import { QueryParameters } from "app/shared/models/QueryParameters";
import { CustomRouterService } from "app/shared/services/custom-router.service";
import { NotificationService } from "app/shared/services/notification.service";
import { UsersService } from "app/shared/services/users.service";
import { isNullOrUndefinedEmptyStringNullArray } from "app/shared/utils";
import { Subject, takeUntil } from "rxjs";
import { USERS_COLUMNS_SCHEMA } from "./columns-schema";
import { ToastrModule } from 'ngx-toastr';
import { TranslocoService } from "@ngneat/transloco";

@Component({
  selector: 'app-list-agencies-users',
  templateUrl: './list.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
  standalone   : true,
  imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatButtonModule, MatIconModule, MatPaginatorModule, MatTableModule, MatInputModule, RouterModule, GenericHeaderComponent, GenericTableComponent, ToastrModule]
})
export class AgenciesUsersListComponent implements OnInit, OnDestroy, OnGenericTableHandler, OnGenericHeaderHandlers {

  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _formBuilder: UntypedFormBuilder = inject(UntypedFormBuilder);
  private _customRouter: CustomRouterService = inject(CustomRouterService);
  private _usersService: UsersService = inject(UsersService);
  private _changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
  private _fuseConfirmationService: FuseConfirmationService = inject(FuseConfirmationService);
  private _notificationService: NotificationService = inject(NotificationService);
  private _translocoService: TranslocoService = inject(TranslocoService);

  data: any[];

  headerConfig: GenericHeaderConfig = {
    title: 'users.list.title',
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
    columnsSchema: USERS_COLUMNS_SCHEMA,
    displayedColumns: USERS_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
    length: 0,
  };

  constructor() {}

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  ngOnInit() {

    // Get the accountings
    this._usersService.users$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      this.tableConfig.dataSource.data = result.body.data;
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
      this.getAll(0, this.headerConfig.formGroup.value);
    }
  }

  getPaginator(event?: PageEvent) {
    const index = !isNullOrUndefinedEmptyStringNullArray(event.pageIndex) ? event.pageIndex : 0;
    this.tableConfig.pageSize = event.pageSize;
    this.getAll(index * this.tableConfig.pageSize, this.headerConfig.formGroup.value);
  }

  // Obtenemos segun los filtros seleccionados
  getAll(index: number, form: any) {
    const requestParameters: QueryParameters = {
      take: this.tableConfig.pageSize,
      skip: index,
      name: form.name,
    };

    this._usersService.getAllUsersFromDb(requestParameters).subscribe();
  }

  onClear(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.headerConfig.formGroup.reset();
    this.getAll(0, this.headerConfig.formGroup.value);
  }

  onTableEdit(event: Event, id: string) {
    event.stopPropagation();
    event.preventDefault();
    this._customRouter.navigate([`users/edit/${id}`]);
  }

  onTableDelete(event: Event, id: string) {
    event.stopPropagation();
    event.preventDefault();

    // Open the confirmation dialog
    const confirmation = this._fuseConfirmationService.open({
      title: this._translocoService.translate('users.list.delete.title'),
      message: this._translocoService.translate('users.list.delete.message'),
      actions: {
        confirm: {
          label: this._translocoService.translate('users.list.delete.confirm'),
          color: 'warn'
        },
        cancel: {
          label: this._translocoService.translate('users.list.delete.cancel')
        }
      },
    });

    // Subscribe to the confirmation dialog closed action
    confirmation.afterClosed().subscribe((result) => {
      // If the confirm button pressed...
      if (result === 'confirmed') {
        const requestParameters: QueryParameters = { userId: id };
        this._usersService.delete(requestParameters).subscribe({
          next: (result: any) => {
            switch (result.status) {
              case 202:
                this._notificationService.showSuccess(this._translocoService.translate('users.list.delete.success'));
                this.getAll(0, this.headerConfig.formGroup.value);
                break;
              default:
                this._notificationService.showWarning(this._translocoService.translate('users.list.delete.error'));
                break;
            }
          },
          error: (error) => {
            this._notificationService.showError();
          },
          complete: () => {},
        });
      }
    });
  }

  onSearch() {
    if (this.headerConfig.formGroup.valid) {
      this.getAll(0, this.headerConfig.formGroup.value);
      this.headerConfig.clearVisible = true;
    }
  }
}
