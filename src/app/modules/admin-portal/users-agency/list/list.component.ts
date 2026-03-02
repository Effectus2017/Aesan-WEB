import {
  Component,
  ViewEncapsulation,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  FormControl,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import {
  GenericHeaderConfig,
  OnGenericHeaderHandlers,
} from 'app/shared/components/generic-header/generic-header.interface';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import {
  GenericTableConfig,
  OnGenericTableHandler,
} from 'app/shared/components/generic-table/generic-table.interface';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { UsersService } from 'app/shared/services/users.service';
import { isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { Subject, takeUntil } from 'rxjs';
import { USERS_AGENCY_COLUMNS_SCHEMA } from './columns-schema';
import { ToastrModule } from 'ngx-toastr';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-users-agency-list',
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
    RouterModule,
    GenericHeaderComponent,
    GenericTableComponent,
    ToastrModule,
  ],
})
export class UsersAgencyListComponent
  implements OnInit, OnDestroy, OnGenericTableHandler, OnGenericHeaderHandlers
{
  private _unsubscribeAll = new Subject<unknown>();
  private _formBuilder = inject(UntypedFormBuilder);
  private _customRouter = inject(CustomRouterService);
  private _usersService = inject(UsersService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _fuseConfirmationService = inject(FuseConfirmationService);
  private _notificationService = inject(NotificationService);
  private _translocoService = inject(TranslocoService);
  private _route = inject(ActivatedRoute);

  headerConfig: GenericHeaderConfig = {
    title: 'usersAgency.list.title',
    formGroup: this._formBuilder.group({
      name: new FormControl(''),
    }),
    searchFieldShow: true,
    searchInputPlaceholder: 'global.search.placeholder',
    goToAddButtonShow: true,
  };

  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<unknown>(),
    columnsSchema: USERS_AGENCY_COLUMNS_SCHEMA,
    displayedColumns: USERS_AGENCY_COLUMNS_SCHEMA.map((col) =>
      Array.isArray(col.key) ? col.key[0] : col.key
    ),
    handler: this,
    showPaginator: true,
    pageSize: 25,
    pageSizeOptions: [25, 50, 100],
    length: 0,
    fullScreen: true,
  };

  trackByFn(index: number, item: { id?: string }): unknown {
    return item?.id ?? index;
  }

  ngOnInit(): void {
    const resolvedData = this._route.snapshot.data['data'] as {
      users?: { data: unknown[]; count: number };
    };
    if (resolvedData?.users) {
      this.tableConfig.dataSource.data = resolvedData.users.data;
      this.tableConfig.length = resolvedData.users.count;
      this._changeDetectorRef.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onSubmit(): void {
    if (this.headerConfig.formGroup.valid) {
      this.getAll(0, this.headerConfig.formGroup.value);
    }
  }

  getPaginator(event?: PageEvent): void {
    const index = !isNullOrUndefinedEmptyStringNullArray(event?.pageIndex)
      ? event!.pageIndex
      : 0;
    this.tableConfig.pageSize = event!.pageSize;
    this.getAll(index * this.tableConfig.pageSize, this.headerConfig.formGroup.value);
  }

  getAll(index: number, form: { name?: string }): void {
    const requestParameters: QueryParameters = {
      take: this.tableConfig.pageSize,
      skip: index,
      name: form?.name ?? null,
      isPropietary: false,
    };
    this._usersService
      .getAllUsersFromDbWithSP(requestParameters)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: { body?: { data: unknown[]; count: number } }) => {
        this.tableConfig.dataSource.data = response?.body?.data ?? [];
        this.tableConfig.length = response?.body?.count ?? 0;
        this._changeDetectorRef.markForCheck();
      });
  }

  onClear(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.headerConfig.formGroup.reset();
    this.getAll(0, this.headerConfig.formGroup.value);
  }

  onAdd(): void {
    this._customRouter.navigate(['add']);
  }

  onTableEdit(event: Event, id: string): void {
    event.stopPropagation();
    event.preventDefault();
    this._customRouter.navigate(['edit', id]);
  }

  onTableDelete(event: Event, id: string): void {
    event.stopPropagation();
    event.preventDefault();
    const confirmation = this._fuseConfirmationService.open({
      title: this._translocoService.translate('users.list.delete.title'),
      message: this._translocoService.translate('users.list.delete.message'),
      actions: {
        confirm: {
          label: this._translocoService.translate('users.list.delete.confirm'),
          color: 'warn',
        },
        cancel: {
          label: this._translocoService.translate('users.list.delete.cancel'),
        },
      },
    });
    confirmation.afterClosed().subscribe((result) => {
      if (result === 'confirmed') {
        this._usersService
          .delete({ userId: id })
          .subscribe({
            next: (result: { status?: number }) => {
              if (result?.status === 202) {
                this._notificationService.showSuccess(
                  this._translocoService.translate('users.list.delete.success')
                );
                this.getAll(0, this.headerConfig.formGroup.value);
              } else {
                this._notificationService.showWarning(
                  this._translocoService.translate('users.list.delete.error')
                );
              }
            },
            error: () => this._notificationService.showError(),
          });
      }
    });
  }

  onSearch(): void {
    if (this.headerConfig.formGroup.valid) {
      this.getAll(0, this.headerConfig.formGroup.value);
      this.headerConfig.clearVisible = true;
    }
  }

  onClean(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.headerConfig.formGroup.reset();
    this.headerConfig.clearVisible = false;
    this.getAll(0, this.headerConfig.formGroup.value);
  }
}
