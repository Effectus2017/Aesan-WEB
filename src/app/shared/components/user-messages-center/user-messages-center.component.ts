import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslocoModule } from '@ngneat/transloco';
import { TranslocoService } from '@ngneat/transloco';
import { AuthService } from 'app/core/auth/auth.service';
import { MessageDetailModalComponent } from 'app/layout/common/messages/message-detail-modal/message-detail-modal.component';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericHeaderConfig } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericFilterDrawerComponent } from 'app/shared/components/generic-filter-drawer/generic-filter-drawer.component';
import { OnGenericFilterHandlers } from 'app/shared/components/generic-filter-panel/generic-filter-panel.interface';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { GenericFilterResult, GenericTableConfig } from 'app/shared/components/generic-table/generic-table.interface';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { Message } from 'app/shared/models/user/Message';
import { MessagesService } from 'app/shared/services/messages.service';
import { isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { Subject, takeUntil } from 'rxjs';
import { USER_MESSAGES_CENTER_COLUMNS_SCHEMA } from './messages-center-columns-schema';
import { USER_MESSAGES_CENTER_FILTERS_SCHEMA } from './messages-center-filters-schema';

type MessageTableRow = Message & { statusLabel: string };

@Component({
  selector: 'user-messages-center',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatPaginatorModule,
    TranslocoModule,
    GenericHeaderComponent,
    GenericTableComponent,
    GenericFilterDrawerComponent
  ],
  templateUrl: './user-messages-center.component.html'
})
export class UserMessagesCenterComponent implements OnInit, OnDestroy, OnGenericFilterHandlers {
  // -----
  // @ Subject de desuscripción
  // -----
  private _unsubscribeAll = new Subject<any>();

  // -----
  // @ Inyecciones privadas
  // -----
  private _formBuilder = inject(UntypedFormBuilder);
  private _authService = inject(AuthService);
  private _messagesService = inject(MessagesService);
  private _dialog = inject(MatDialog);
  private _translocoService = inject(TranslocoService);

  // -----
  // @ Variables
  // -----
  headerConfig: GenericHeaderConfig = {
    title: 'messages.center.title',
    formGroup: this._formBuilder.group({
      name: new FormControl('')
    }),
    searchFieldShow: true,
    searchInputPlaceholder: 'messages.center.searchPlaceholder',
    clearVisible: false,
    filterButtonShow: true,
    filterButtonTooltip: 'global.tooltips.header.filter'
  };
  tableConfig: GenericTableConfig<MessageTableRow> = {
    dataSource: new MatTableDataSource<MessageTableRow>(),
    dataSourceList: [],
    columnsSchema: USER_MESSAGES_CENTER_COLUMNS_SCHEMA,
    displayedColumns: USER_MESSAGES_CENTER_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 25,
    pageSizeOptions: [25, 50, 100],
    length: 0,
    fullScreen: true
  };
  filtersSchema = USER_MESSAGES_CENTER_FILTERS_SCHEMA;
  appliedFilters: GenericFilterResult = {};

  @ViewChild('filterDrawer') filterDrawer!: GenericFilterDrawerComponent;

  // -----
  // @ Constructor
  // -----
  constructor() {}

  // -----
  // @ ngOnInit
  // -----
  /** Inicializa la carga de mensajes del usuario autenticado. */
  ngOnInit(): void {
    this.getAll(0, this.headerConfig.formGroup?.value);
  }

  // -----
  // @ ngOnDestroy
  // -----
  /** Libera suscripciones activas del componente. */
  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // -----
  // @ Funciones On (componentes genéricos)
  // -----
  /** Ejecuta la búsqueda desde el header y reinicia a la primera página. */
  onSearch(): void {
    if (this.headerConfig.formGroup?.valid) {
      this.getAll(0, this.headerConfig.formGroup?.value);
      this.headerConfig.clearVisible = true;
    }
  }

  /** Abre o cierra el drawer de filtros. */
  onFilter(): void {
    this.filterDrawer?.toggle();
  }

  /** Aplica filtros desde el drawer y recarga la primera página. */
  onFiltersApply(filters: GenericFilterResult): void {
    this.appliedFilters = { ...filters };
    this.filterDrawer?.close();
    this.getAll(0, this.headerConfig.formGroup?.value);
  }

  /** Restablece filtros aplicados y recarga la primera página. */
  onFiltersReset(): void {
    this.appliedFilters = {};
    this.getAll(0, this.headerConfig.formGroup?.value);
  }

  /** Limpia filtros de búsqueda del header y recarga resultados. */
  onClean(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.headerConfig.formGroup?.reset({ name: '' });
    this.headerConfig.clearVisible = false;
    this.appliedFilters = {};
    this.getAll(0, this.headerConfig.formGroup?.value);
  }

  /** Maneja cambios de paginador y solicita la página correspondiente. */
  getPaginator(event?: PageEvent): void {
    const index = !isNullOrUndefinedEmptyStringNullArray(event?.pageIndex) ? event!.pageIndex : 0;
    this.tableConfig.pageSize = event?.pageSize ?? this.tableConfig.pageSize;
    const skip = index * (this.tableConfig.pageSize ?? 20);
    this.getAll(skip, this.headerConfig.formGroup?.value);
  }

  // -----
  // @ Otras funciones públicas
  // -----
  /** Devuelve key estable para trackBy del listado. */
  trackByFn(index: number, item: MessageTableRow): number {
    return item.id ?? index;
  }

  /** Obtiene mensajes paginados aplicando filtro de lectura y búsqueda. */
  getAll(index: number, form: { name?: string } | null | undefined): void {
    const userId = this._authService.getUserId();
    if (!userId) {
      this.tableConfig.dataSource.data = [];
      this.tableConfig.length = 0;
      return;
    }

    const requestParameters: QueryParameters = {
      take: this.tableConfig.pageSize,
      skip: index,
      userId,
      readFilter: this._resolveReadFilter(),
      search: form?.name ?? ''
    };

    this._messagesService
      .getMessages(requestParameters)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response: any) => {
          const payload = response?.body ?? response;
          const data = Array.isArray(payload?.data)
            ? payload.data.map((message: Message) => ({
                ...message,
                statusLabel: this._resolveMessageStatusLabel(message)
              }))
            : [];
          const count = typeof payload?.count === 'number' ? payload.count : 0;

          this.tableConfig.dataSource.data = data;
          this.tableConfig.length = count;
        },
        error: () => {
          this.tableConfig.dataSource.data = [];
          this.tableConfig.length = 0;
        }
      });
  }

  /** Abre el detalle del mensaje y actualiza su estado de lectura. */
  onTableEditElement(event: Event, message: Message): void {
    event.stopPropagation();
    event.preventDefault();
    this._markMessageAsRead(message);
    this._dialog.open(MessageDetailModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { message }
    });
  }

  /** Elimina un mensaje desde la tabla y recarga la página actual. */
  onTableDelete(event: Event, id: number): void {
    event.stopPropagation();
    event.preventDefault();
    this._messagesService
      .deleteMessage({ id })
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: () => this.getAll(0, this.headerConfig.formGroup?.value)
      });
  }

  /** Resuelve acciones de botones personalizados en la tabla. */
  onTableAction(event: Event, action: string, id: number): void {
    event.stopPropagation();
    event.preventDefault();
    if (action !== 'viewServices') {
      return;
    }

    const message = this.tableConfig.dataSource.data.find((item) => item.id === id);
    if (!message) return;
    this._markMessageAsRead(message);
  }

  // -----
  // @ Funciones privadas
  // -----
  /** Marca un mensaje como leído en backend y sincroniza la fila local. */
  private _markMessageAsRead(message: Message): void {
    if (message.read || !message.id) {
      return;
    }

    this._messagesService
      .markMessageAsRead({ id: message.id })
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: () => {
          this.tableConfig.dataSource.data = this.tableConfig.dataSource.data.map((item) =>
            item.id === message.id ? { ...item, read: true } : item
          );
        }
      });
  }

  /** Convierte filtros del drawer a readFilter de API (all/read/unread/deleted). */
  private _resolveReadFilter(): 'all' | 'read' | 'unread' | 'deleted' {
    const readFilter = this.appliedFilters['readFilter'];
    if (readFilter === 'deleted') {
      return 'deleted';
    }
    if (readFilter === 'read') {
      return 'read';
    }
    if (readFilter === 'unread') {
      return 'unread';
    }
    return 'all';
  }

  /** Resuelve la etiqueta de estado a mostrar en la tabla. */
  private _resolveMessageStatusLabel(message: Message): string {
    if (message.isDeleted) {
      return this._translocoService.translate('messages.center.table.status.deleted');
    }
    if (message.read) {
      return this._translocoService.translate('messages.center.table.status.read');
    }
    return this._translocoService.translate('messages.center.table.status.unread');
  }
}
