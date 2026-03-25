import { Component, ViewEncapsulation, OnInit, OnDestroy, inject, ChangeDetectorRef, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
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
import { GenericFilterDrawerComponent } from "app/shared/components/generic-filter-drawer/generic-filter-drawer.component";
import { GenericHeaderComponent } from "app/shared/components/generic-header/generic-header.component";
import { GenericHeaderConfig, OnGenericHeaderHandlers } from "app/shared/components/generic-header/generic-header.interface";
import { OnGenericFilterHandlers } from "app/shared/components/generic-filter-panel/generic-filter-panel.interface";
import { GenericTableComponent } from "app/shared/components/generic-table/generic-table.component";
import { GenericTableConfig, GenericFilterResult, OnGenericTableHandler } from "app/shared/components/generic-table/generic-table.interface";
import { QueryParameters } from "app/shared/models/common/QueryParameters";
import { CustomRouterService } from "app/shared/services/custom-router.service";
import { NotificationService } from "app/shared/services/notification.service";
import { UsersService } from "app/shared/services/users.service";
import { isNullOrUndefinedEmptyStringNullArray } from "app/shared/utils";
import { Subject, takeUntil } from "rxjs";
import { USERS_COLUMNS_SCHEMA } from "./columns-schema";
import { USERS_FILTERS_SCHEMA } from "./filters-schema";
import { AdminUserListRow } from "../users.types";
import { ToastrModule } from 'ngx-toastr';
import { TranslocoService } from "@ngneat/transloco";

@Component({
    selector: 'app-list-users',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatButtonModule, MatIconModule, MatPaginatorModule, MatTableModule, MatInputModule, RouterModule, GenericHeaderComponent, GenericTableComponent, GenericFilterDrawerComponent, ToastrModule]
})
export class UsersListComponent implements OnInit, OnDestroy, OnGenericTableHandler, OnGenericHeaderHandlers, OnGenericFilterHandlers {
  // -----
  // @ Subject de desuscripción
  // -----
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // -----
  // @ Inyecciones privadas
  // -----
  private _formBuilder: UntypedFormBuilder = inject(UntypedFormBuilder);
  private _customRouter: CustomRouterService = inject(CustomRouterService);
  private _usersService: UsersService = inject(UsersService);
  private _changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
  private _fuseConfirmationService: FuseConfirmationService = inject(FuseConfirmationService);
  private _notificationService: NotificationService = inject(NotificationService);
  private _translocoService: TranslocoService = inject(TranslocoService);
  private _route: ActivatedRoute = inject(ActivatedRoute);

  // -----
  // @ Variables
  // -----
  headerConfig: GenericHeaderConfig = {
    title: 'users.list.title',
    formGroup: this._formBuilder.group({
      name: new FormControl(''),
    }),
    searchFieldShow: false,
    searchInputPlaceholder: 'global.search.placeholder',
    goToAddButtonShow: true,
    filterButtonShow: true,
    filterButtonTooltip: 'global.tooltips.header.filter',
  };

  tableConfig: GenericTableConfig<AdminUserListRow> = {
    dataSource: new MatTableDataSource<AdminUserListRow>([]),
    columnsSchema: USERS_COLUMNS_SCHEMA,
    displayedColumns: USERS_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 25,
    pageSizeOptions: [25, 50, 100],
    length: 0,
    fullScreen: true,
  };

  @ViewChild('filterDrawer') filterDrawer!: GenericFilterDrawerComponent;
  filtersSchema = USERS_FILTERS_SCHEMA;
  appliedFilters: GenericFilterResult = {};
  data: AdminUserListRow[] = [];
  isLoading = false;

  // -----
  // @ Constructor
  // -----
  constructor() {}

  // -----
  // @ ngOnInit / ngOnDestroy
  // -----
  /** Inicializa el componente con los datos del resolver. */
  ngOnInit(): void {
    const resolvedData = this._route.snapshot.data['data'];
    if (resolvedData && resolvedData.users) {
      this.tableConfig.dataSource.data = resolvedData.users.data;
      this.tableConfig.length = resolvedData.users.count;
      this._changeDetectorRef.markForCheck();
    }
  }

  /** Limpia las suscripciones al destruir el componente. */
  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // -----
  // @ Funciones On (componentes genéricos)
  // -----
  /** Envía el formulario y recarga la lista en la primera página. */
  onSubmit(): void {
    if (this.isLoading) return;
    if (this.headerConfig.formGroup.valid) {
      this.getAll(0, this.headerConfig.formGroup.value);
    }
  }

  /** Actualiza la página o el tamaño de página y recarga la lista. */
  getPaginator(event?: PageEvent): void {
    const index = !isNullOrUndefinedEmptyStringNullArray(event?.pageIndex) ? event!.pageIndex : 0;
    this.tableConfig.pageSize = event!.pageSize;
    this.getAll(index * this.tableConfig.pageSize, this.headerConfig.formGroup.value);
  }

  /** Abre o cierra el drawer de filtros. */
  onFilter(): void {
    this.filterDrawer?.toggle();
  }

  /** Aplica los filtros del drawer y recarga la lista. */
  onFiltersApply(filters: GenericFilterResult): void {
    this.appliedFilters = { ...filters };
    this.filterDrawer?.close();
    this.getAll(0, this.headerConfig.formGroup.value);
    this._changeDetectorRef.markForCheck();
  }

  /** Restablece los filtros y recarga la lista. */
  onFiltersReset(): void {
    this.appliedFilters = {};
    this.getAll(0, this.headerConfig.formGroup.value);
    this._changeDetectorRef.markForCheck();
  }

  /** Limpia el formulario y los filtros aplicados y recarga la lista. */
  onClear(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.headerConfig.formGroup.reset();
    this.appliedFilters = {};
    this.getAll(0, this.headerConfig.formGroup.value);
  }

  /** Navega a la edición del usuario. */
  onTableEdit(event: Event, id: string): void {
    event.stopPropagation();
    event.preventDefault();
    this._customRouter.navigate([`users/edit/${id}`]);
  }

  /** Solicita confirmación y elimina el usuario si se confirma. */
  onTableDelete(event: Event, id: string): void {
    event.stopPropagation();
    event.preventDefault();

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

    confirmation.afterClosed().subscribe((result) => {
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
          error: () => {
            this._notificationService.showError();
          },
          complete: () => {},
        });
      }
    });
  }

  /** Navega al formulario de alta de usuario. */
  onAdd(): void {
    this._customRouter.navigate(['users/add']);
  }

  /** Recarga la lista con la primera página según el formulario del header. */
  onSearch(): void {
    if (this.headerConfig.formGroup.valid) {
      this.getAll(0, this.headerConfig.formGroup.value);
      this.headerConfig.clearVisible = true;
    }
  }

  /** Limpia el formulario, oculta el botón limpiar y recarga sin filtros. */
  onClean(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.headerConfig.formGroup.reset();
    this.headerConfig.clearVisible = false;
    this.appliedFilters = {};
    this.getAll(0, this.headerConfig.formGroup.value);
  }

  // -----
  // @ Otras funciones públicas
  // -----
  /** Obtiene la lista de usuarios según los filtros aplicados y la paginación. */
  getAll(index: number, form: any): void {
    this.isLoading = true;
    const rawName = this.appliedFilters['name'];
    const nameFromFilters: string | null = (rawName != null && rawName !== '' && typeof rawName === 'string') ? rawName : null;
    const requestParameters: QueryParameters = {
      take: this.tableConfig.pageSize,
      skip: index,
      name: nameFromFilters,
      isPropietary: true,
    };

    this._usersService.getAllUsersFromDbWithSP(requestParameters)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response) => {
          this.tableConfig.dataSource.data = response.body.data;
          this.tableConfig.length = response.body.count;
          this._changeDetectorRef.markForCheck();
        },
        error: () => {
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  /** Función trackBy para la tabla. */
  trackByFn(index: number, item: AdminUserListRow): string {
    return item.id ?? String(index);
  }
}
