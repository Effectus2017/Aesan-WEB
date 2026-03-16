import { Component, ViewEncapsulation, OnInit, OnDestroy, inject, ChangeDetectorRef, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, FormControl } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatPaginatorModule, PageEvent } from "@angular/material/paginator";
import { MatTableModule, MatTableDataSource } from "@angular/material/table";
import { MatSelectModule } from "@angular/material/select";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { RouterModule } from "@angular/router";
import { fuseAnimations } from "@fuse/animations";
import { FuseConfirmationService } from "@fuse/services/confirmation";
import { GenericHeaderComponent } from "app/shared/components/generic-header/generic-header.component";
import { GenericHeaderConfig, OnGenericHeaderHandlers } from "app/shared/components/generic-header/generic-header.interface";
import { GenericTableComponent } from "app/shared/components/generic-table/generic-table.component";
import { GenericTableConfig, GenericFilterResult, OnGenericTableHandler } from "app/shared/components/generic-table/generic-table.interface";
import { OnGenericFilterHandlers } from "app/shared/components/generic-filter-panel/generic-filter-panel.interface";
import { GenericFilterDrawerComponent } from "app/shared/components/generic-filter-drawer/generic-filter-drawer.component";
import { CustomRouterService } from "app/shared/services/custom-router.service";
import { NotificationService } from "app/shared/services/notification.service";
import { EmailLogService } from "app/shared/services/email-log.service";
import { isNullOrUndefinedEmptyStringNullArray } from "app/shared/utils";
import { Subject, takeUntil } from "rxjs";
import { EMAIL_LOGS_COLUMNS_SCHEMA } from "./columns-schema";
import { EMAIL_LOGS_FILTERS_SCHEMA } from "./filters-schema";
import { ToastrModule } from 'ngx-toastr';
import { TranslocoService, TranslocoModule } from "@ngneat/transloco";
import { EmailLog } from 'app/shared/models/log/EmailLog';
import { QueryParameters } from "app/shared/models/common/QueryParameters";

@Component({
    selector: 'app-list-email-logs',
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
    GenericFilterDrawerComponent,
    ToastrModule,
        TranslocoModule
    ]
})
export class EmailLogsListComponent implements OnInit, OnDestroy, OnGenericTableHandler, OnGenericHeaderHandlers, OnGenericFilterHandlers {

  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _formBuilder: UntypedFormBuilder = inject(UntypedFormBuilder);
  private _emailLogService: EmailLogService = inject(EmailLogService);
  private _changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
  private _fuseConfirmationService: FuseConfirmationService = inject(FuseConfirmationService);
  private _notificationService: NotificationService = inject(NotificationService);
  private _translocoService: TranslocoService = inject(TranslocoService);
  private _route: ActivatedRoute = inject(ActivatedRoute);

  @ViewChild('filterDrawer') filterDrawer!: GenericFilterDrawerComponent;
  filtersSchema = EMAIL_LOGS_FILTERS_SCHEMA;
  appliedFilters: GenericFilterResult = {};
  data: EmailLog[] = [];

  headerConfig: GenericHeaderConfig = {
    title: 'email-logs.list.title',
    formGroup: this._formBuilder.group({
      email: new FormControl(''),
    }),
    searchFieldShow: true,
    searchInputPlaceholder: 'email-logs.list.search.placeholder',
    goToAddButtonShow: false,
    filterButtonShow: true,
    filterButtonTooltip: 'global.tooltips.header.filter',
  };

  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<EmailLog>(),
    columnsSchema: EMAIL_LOGS_COLUMNS_SCHEMA,
    displayedColumns: EMAIL_LOGS_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: false,
    pageSize: 25,
    pageSizeOptions: [25, 50, 100],
    length: 0,
    fullScreen: true,
  };

  constructor() {}

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  ngOnInit(): void {
    const resolvedData = this._route.snapshot.data['data'];
    if (resolvedData?.options) {
      this._changeDetectorRef.markForCheck();
    }
    this.loadFailedLogs();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  loadFailedLogs() {
    const form = { ...this.headerConfig.formGroup?.value, ...this.appliedFilters } as Record<string, unknown>;
    const email = form.email != null && String(form.email).trim() !== '' ? String(form.email).trim() : undefined;
    const status = form.status != null && String(form.status) !== 'All' ? String(form.status) : undefined;
    const emailType = form.emailType != null && String(form.emailType) !== 'All' ? String(form.emailType) : undefined;
    const showOnlyFailed = form.showOnlyFailed === true;
    const queryParameters: QueryParameters = {
      ...(email != null && { email }),
      ...(status != null && { status }),
      ...(emailType != null && { emailType }),
      ...(showOnlyFailed && { showOnlyFailed: true }),
    };
    this._emailLogService.getFailedEmailLogs(queryParameters)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response) => {
          this.data = response.body || [];
          this.applyFilters();
          this._changeDetectorRef.markForCheck();
        },
        error: (error) => {
          this._notificationService.showError();
        }
      });
  }

  loadLogsByEmail(email: string) {
    if (!email || email.trim() === '') {
      this.loadFailedLogs();
      return;
    }

    const form = { ...this.headerConfig.formGroup?.value, ...this.appliedFilters } as Record<string, unknown>;
    const status = form.status != null && String(form.status) !== 'All' ? String(form.status) : undefined;
    const emailType = form.emailType != null && String(form.emailType) !== 'All' ? String(form.emailType) : undefined;
    const showOnlyFailed = form.showOnlyFailed === true;
    const queryParameters: QueryParameters = {
      email: email.trim(),
      ...(status != null && { status }),
      ...(emailType != null && { emailType }),
      ...(showOnlyFailed && { showOnlyFailed: true }),
    };
    this._emailLogService.getEmailLogsByEmail(queryParameters)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response) => {
          this.data = response.body || [];
          this.applyFilters();
          this._changeDetectorRef.markForCheck();
        },
        error: (error) => {
          this._notificationService.showError();
        }
      });
  }

  applyFilters(): void {
    let filteredData = [...this.data];
    const filters = this.appliedFilters;

    if (filters['status'] != null && filters['status'] !== '' && String(filters['status']) !== 'All') {
      filteredData = filteredData.filter(log => log.status === String(filters['status']));
    }
    if (filters['emailType'] != null && filters['emailType'] !== '' && String(filters['emailType']) !== 'All') {
      filteredData = filteredData.filter(log => log.emailType === String(filters['emailType']));
    }
    if (filters['showOnlyFailed'] === true) {
      filteredData = filteredData.filter(log => log.status === 'Failed');
    }

    // Ordenar por fecha más reciente primero
    filteredData.sort((a, b) => {
      const dateA = new Date(a.attemptedAt).getTime();
      const dateB = new Date(b.attemptedAt).getTime();
      return dateB - dateA;
    });

    this.tableConfig.dataSource.data = filteredData;
    this.tableConfig.length = filteredData.length;
    this._changeDetectorRef.markForCheck();
  }

  onSubmit() {
    if (this.headerConfig.formGroup?.valid) {
      const email = this.headerConfig.formGroup.value.email;
      if (email && email.trim() !== '') {
        this.loadLogsByEmail(email);
      } else {
        this.loadFailedLogs();
      }
    }
  }

  onSearch() {
    if (this.headerConfig.formGroup?.valid) {
      const email = this.headerConfig.formGroup.value.email;
      if (email && email.trim() !== '') {
        this.loadLogsByEmail(email);
      } else {
        this.loadFailedLogs();
      }
      this.headerConfig.clearVisible = true;
    }
  }

  onClear(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.headerConfig.formGroup?.reset({ email: '' });
    this.loadFailedLogs();
  }

  onClean(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.headerConfig.formGroup?.reset({ email: '' });
    this.headerConfig.clearVisible = false;
    this.loadFailedLogs();
  }

  onTableEdit(event: Event, id: any) {
    // No hay edición, solo vista
    this.onTableView(event, id);
  }

  onTableView(event: Event, id: any) {
    event.stopPropagation();
    event.preventDefault();

    // Buscar el elemento en los datos actuales
    const log = this.tableConfig.dataSource.data.find((item: EmailLog) => item.id === id);
    if (log) {
      this.showLogDetails(log);
    } else {
      // Si no está en los datos actuales, obtenerlo del servidor
      const queryParameters: QueryParameters = {
        id: id
      };
      this._emailLogService.getEmailLogById(queryParameters)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe({
          next: (response) => {
            const log: EmailLog = response.body;
            this.showLogDetails(log);
          },
          error: (error) => {
            this._notificationService.showError();
          }
        });
    }
  }

  onTableAction(event: Event, action: string, id: any) {
    event.stopPropagation();
    event.preventDefault();

    // Buscar el elemento en los datos actuales
    const element = this.tableConfig.dataSource.data.find((item: EmailLog) => item.id === id) as EmailLog;

    if (!element) {
      this._notificationService.showError();
      return;
    }

    if (action === 'view') {
      this.onTableView(event, id);
    } else if (action === 'resend') {
      this.onTableResend(event, element);
    }
  }

  onTableResend(event: Event, element: EmailLog) {
    event.stopPropagation();
    event.preventDefault();

    const confirmation = this._fuseConfirmationService.open({
      title: this._translocoService.translate('email-logs.list.resend.title'),
      message: this._translocoService.translate('email-logs.list.resend.message', { email: element.recipientEmail }),
      actions: {
        confirm: {
          label: this._translocoService.translate('email-logs.list.resend.confirm'),
          color: 'primary'
        },
        cancel: {
          label: this._translocoService.translate('email-logs.list.resend.cancel')
        }
      },
    });

    confirmation.afterClosed().subscribe((result) => {
      if (result === 'confirmed') {
        const forceResend = element.status === 'Sent';
        this._emailLogService.resendEmail(element.id, forceResend)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe({
            next: (response: any) => {
              if (response.status === 200) {
                this._notificationService.showSuccess(
                  this._translocoService.translate('email-logs.list.resend.success')
                );
                // Recargar datos
                const email = this.headerConfig.formGroup?.value.email;
                if (email && email.trim() !== '') {
                  this.loadLogsByEmail(email);
                } else {
                  this.loadFailedLogs();
                }
              } else {
                this._notificationService.showWarning(
                  this._translocoService.translate('email-logs.list.resend.error')
                );
              }
            },
            error: (error) => {
              this._notificationService.showError(
                this._translocoService.translate('email-logs.list.resend.error')
              );
            }
          });
      }
    });
  }

  showLogDetails(log: EmailLog) {
    // Crear mensaje con detalles del log
    let message = `
      <div style="text-align: left;">
        <p><strong>${this._translocoService.translate('email-logs.list.details.recipientEmail')}:</strong> ${log.recipientEmail}</p>
        <p><strong>${this._translocoService.translate('email-logs.list.details.subject')}:</strong> ${log.subject}</p>
        <p><strong>${this._translocoService.translate('email-logs.list.details.emailType')}:</strong> ${log.emailType}</p>
        <p><strong>${this._translocoService.translate('email-logs.list.details.status')}:</strong> ${log.status}</p>
        <p><strong>${this._translocoService.translate('email-logs.list.details.attemptedAt')}:</strong> ${new Date(log.attemptedAt).toLocaleString()}</p>
        ${log.sentAt ? `<p><strong>${this._translocoService.translate('email-logs.list.details.sentAt')}:</strong> ${new Date(log.sentAt).toLocaleString()}</p>` : ''}
        <p><strong>${this._translocoService.translate('email-logs.list.details.retryCount')}:</strong> ${log.retryCount}</p>
        ${log.errorMessage ? `<p><strong>${this._translocoService.translate('email-logs.list.details.errorMessage')}:</strong> ${log.errorMessage}</p>` : ''}
      </div>
    `;

    this._fuseConfirmationService.open({
      title: this._translocoService.translate('email-logs.list.details.title'),
      message: message,
      actions: {
        confirm: {
          label: this._translocoService.translate('email-logs.list.details.close'),
          color: 'primary'
        }
      },
      dismissible: true
    });
  }

  onFilter(): void {
    this.filterDrawer?.toggle();
  }

  onFiltersApply(filters: GenericFilterResult): void {
    this.appliedFilters = { ...filters };
    this.filterDrawer?.close();
    this.applyFilters();
    const email = this.headerConfig.formGroup?.value?.email != null && String(this.headerConfig.formGroup.value.email).trim() !== '' ? String(this.headerConfig.formGroup.value.email).trim() : null;
    if (email) {
      this.loadLogsByEmail(email);
    } else {
      this.loadFailedLogs();
    }
    this._changeDetectorRef.markForCheck();
  }

  onFiltersReset(): void {
    this.appliedFilters = {};
    this.filterDrawer?.close();
    this.loadFailedLogs();
    this._changeDetectorRef.markForCheck();
  }

  onAdd() {
    // No hay funcionalidad de agregar para logs de correo
    // Los logs se crean automáticamente cuando se envían correos
  }
}
