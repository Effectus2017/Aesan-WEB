import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoService } from '@ngneat/transloco';
import { Subject, takeUntil } from 'rxjs';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { GenericTableConfig, OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { AuthService } from 'app/core/auth/auth.service';
import { UsersService } from 'app/shared/services/users.service';
import { ROLE_EXTENSION_REQUESTS_COLUMNS_SCHEMA } from './columns-schema';
import { MatDialog } from '@angular/material/dialog';
import { ApproveRoleExtensionDialogComponent } from '../approve-role-extension-dialog/approve-role-extension-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'app-list-role-extension-requests',
  templateUrl: './list.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatTableModule,
    MatInputModule,
    MatSelectModule,
    GenericHeaderComponent,
    GenericTableComponent,
    TranslocoModule,
  ],
})
export class ListRoleExtensionRequestsComponent implements OnInit, OnDestroy, OnGenericTableHandler, OnGenericHeaderHandlers {
  private _unsubscribeAll = new Subject<void>();
  private _formBuilder = inject(UntypedFormBuilder);
  private _usersService = inject(UsersService);
  private _authService = inject(AuthService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _fuseConfirmation = inject(FuseConfirmationService);
  private _transloco = inject(TranslocoService);
  private _dialog = inject(MatDialog);
  private _route = inject(ActivatedRoute);

  statusFilter = 'Pending';

  headerConfig: GenericHeaderConfig = {
    title: 'users.roleExtensionRequests.title',
    formGroup: this._formBuilder.group({
      status: new FormControl('Pending'),
    }),
    goToAddButtonShow: false,
  };

  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<any>([]),
    columnsSchema: ROLE_EXTENSION_REQUESTS_COLUMNS_SCHEMA,
    displayedColumns: ROLE_EXTENSION_REQUESTS_COLUMNS_SCHEMA.map((c) => (Array.isArray(c.key) ? c.key[0] : c.key)),
    handler: this,
    showPaginator: true,
    pageSize: 25,
    pageSizeOptions: [25, 50, 100],
    length: 0,
    fullScreen: true,
  };

  ngOnInit(): void {
    this.statusFilter = this.headerConfig.formGroup?.get('status')?.value ?? 'Pending';
    this.load(0);
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  load(skip: number): void {
    const status = this.headerConfig.formGroup?.get('status')?.value;
    this._usersService
      .getRoleExtensionRequests({
        status: status || undefined,
        take: this.tableConfig.pageSize,
        skip,
      })
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (res: any) => {
          const data = res?.body?.data ?? res?.data ?? [];
          const total = res?.body?.total ?? res?.total ?? 0;
          this.tableConfig.dataSource.data = (data as any[]).map((row) => ({
            ...row,
            requestedValidToDisplay: row.requestedValidTo ? this._formatDate(row.requestedValidTo) : '',
            requestedAtDisplay: row.requestedAt ? this._formatDate(row.requestedAt) : '',
          }));
          this.tableConfig.length = total;
          this._changeDetectorRef.markForCheck();
        },
      });
  }

  private _formatDate(v: string | Date): string {
    if (!v) return '';
    const d = typeof v === 'string' ? new Date(v) : v;
    return isNaN(d.getTime()) ? String(v) : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  getPaginator(event?: PageEvent): void {
    const index = event?.pageIndex ?? 0;
    this.tableConfig.pageSize = event?.pageSize ?? this.tableConfig.pageSize;
    this.load(index * this.tableConfig.pageSize);
  }

  onSearch(): void {
    this.load(0);
  }

  onTableAction(event: Event, buttonKey: string, id: number): void {
    event.preventDefault();
    event.stopPropagation();
    const row = this.tableConfig.dataSource.data.find((r: any) => r.id === id);
    if (!row) return;
    if (row.status !== 'Pending') return;
    const currentUserId = this._authService.getUserId();
    if (!currentUserId) return;
    const params = { currentUserId };
    if (buttonKey === 'approve') {
      const ref = this._dialog.open(ApproveRoleExtensionDialogComponent, {
        width: '400px',
        data: { requestedValidTo: row.requestedValidTo },
      });
      ref.afterClosed().subscribe((result) => {
        if (result?.confirmed) {
          const newValidTo = result?.newValidTo ? (typeof result.newValidTo === 'string' ? result.newValidTo : (result.newValidTo as Date).toISOString().slice(0, 10)) : undefined;
          this._usersService.approveRoleExtensionRequest(id, newValidTo ? { newValidTo } : null, params).subscribe({
            next: () => {
              this._fuseConfirmation.open({
                title: this._transloco.translate('users.roleExtensionRequests.approvedTitle'),
                message: this._transloco.translate('users.roleExtensionRequests.approvedMessage'),
                icon: { show: true, name: 'heroicons_outline:check-circle', color: 'success' },
                actions: { confirm: { show: true, label: this._transloco.translate('dialog.success.confirm'), color: 'primary' }, cancel: { show: false } },
              });
              this.load(0);
            },
            error: () => {
              this._fuseConfirmation.open({
                title: this._transloco.translate('users.roleExtensionRequests.errorTitle'),
                message: this._transloco.translate('users.roleExtensionRequests.errorMessage'),
                icon: { show: true, name: 'heroicons_outline:exclamation-circle', color: 'error' },
                actions: { confirm: { show: true, label: this._transloco.translate('dialog.error.confirm'), color: 'primary' }, cancel: { show: false } },
              });
            },
          });
        }
      });
    } else if (buttonKey === 'reject') {
      this._fuseConfirmation
        .open({
          title: this._transloco.translate('users.roleExtensionRequests.rejectConfirmTitle'),
          message: this._transloco.translate('users.roleExtensionRequests.rejectConfirmMessage'),
          icon: { show: true, name: 'heroicons_outline:exclamation-triangle', color: 'warn' },
          actions: { confirm: { show: true, label: this._transloco.translate('users.roleExtensionRequests.actions.reject'), color: 'warn' }, cancel: { show: true, label: this._transloco.translate('dialog.permission-request-form.cancel') } },
        })
        .afterClosed()
        .subscribe((result) => {
          if (result === 'confirmed') {
            this._usersService.rejectRoleExtensionRequest(id, params).subscribe({
              next: () => {
                this._fuseConfirmation.open({
                  title: this._transloco.translate('users.roleExtensionRequests.rejectedTitle'),
                  message: this._transloco.translate('users.roleExtensionRequests.rejectedMessage'),
                  icon: { show: true, name: 'heroicons_outline:check-circle', color: 'success' },
                  actions: { confirm: { show: true, label: this._transloco.translate('dialog.success.confirm'), color: 'primary' }, cancel: { show: false } },
                });
                this.load(0);
              },
              error: () => {
                this._fuseConfirmation.open({
                  title: this._transloco.translate('users.roleExtensionRequests.errorTitle'),
                  message: this._transloco.translate('users.roleExtensionRequests.errorMessage'),
                  icon: { show: true, name: 'heroicons_outline:exclamation-circle', color: 'error' },
                  actions: { confirm: { show: true, label: this._transloco.translate('dialog.error.confirm'), color: 'primary' }, cancel: { show: false } },
                });
              },
            });
          }
        });
    }
  }

  isButtonDisabled(button: { key: string }): boolean {
    return false;
  }

  trackByFn(index: number, item: any): any {
    return item?.id ?? index;
  }
}
