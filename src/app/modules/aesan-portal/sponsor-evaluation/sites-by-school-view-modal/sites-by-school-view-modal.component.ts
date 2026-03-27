import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslocoModule } from '@ngneat/transloco';
import { Subject, debounceTime, distinctUntilChanged, finalize, takeUntil } from 'rxjs';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { GenericTableConfig, OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { KeyboardShortcutDirective } from 'app/shared/directives/keyboard-shortcut.directive';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { SchoolSiteTableResponse } from 'app/shared/models/response/SchoolSiteTableResponse';
import { SiteEditModalData } from 'app/shared/models/response/SiteEditModalData';
import { SiteResponse } from 'app/shared/models/response/SiteResponse';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { SchoolSiteService } from 'app/shared/services/school-site.service';
import { SiteService } from 'app/shared/services/site.service';
import { SiteViewModalPacnaCentroComponent } from '../site-view-modal-pacna-centro/site-view-modal-pacna-centro.component';
import { SiteViewModalPacnaHogarComponent } from '../site-view-modal-pacna-hogar/site-view-modal-pacna-hogar.component';
import { SiteViewModalPdamComponent } from '../site-view-modal-pdam/site-view-modal-pdam.component';
import { SiteViewModalPsavComponent } from '../site-view-modal-psav/site-view-modal-psav.component';
import { SiteServicesViewModalComponent } from '../site-services-view-modal/site-services-view-modal.component';
import { SiteServicesViewModalData } from '../site-services-view-modal/site-services-view-modal-data.interface';
import { SitesBySchoolViewModalData } from './sites-by-school-view-modal-data.interface';
import { isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { SPONSOR_EVALUATION_SITES_BY_SCHOOL_VIEW_COLUMNS_SCHEMA } from './columns-schema';

@Component({
  selector: 'app-sites-by-school-view-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    TranslocoModule,
    GenericTableComponent,
    KeyboardShortcutDirective,
  ],
  templateUrl: './sites-by-school-view-modal.component.html',
  styles: [
    `
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .animate-slide-in {
        animation: fadeIn 1s ease-out;
      }
    `,
  ],
})
export class SitesBySchoolViewModalComponent implements OnInit, OnDestroy, OnGenericTableHandler {
  // -----
  // @ Subject de desuscripción
  // -----
  private _unsubscribeAll = new Subject<any>();

  // -----
  // @ Inyecciones privadas
  // -----
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _formBuilder = inject(FormBuilder);
  private _customRouterService = inject(CustomRouterService);
  private _schoolSiteService = inject(SchoolSiteService);
  private _dialog = inject(MatDialog);
  private _siteService = inject(SiteService);
  private _notificationService = inject(NotificationService);

  // -----
  // @ Variables
  // -----
  searchForm: FormGroup;
  isInitialLoading = false;

  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<SchoolSiteTableResponse>([]),
    dataSourceList: [],
    columnsSchema: SPONSOR_EVALUATION_SITES_BY_SCHOOL_VIEW_COLUMNS_SCHEMA,
    displayedColumns: SPONSOR_EVALUATION_SITES_BY_SCHOOL_VIEW_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 25,
    pageSizeOptions: [25, 50, 100],
    addButtonShow: false,
    length: 0,
    fullScreen: true,
  };

  // -----
  // @ Constructor
  // -----
  constructor(
    public dialogRef: MatDialogRef<SitesBySchoolViewModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SitesBySchoolViewModalData,
  ) {
    this.searchForm = this._formBuilder.group({
      search: new FormControl(''),
    });
  }

  // -----
  // @ ngOnInit / ngOnDestroy
  // -----
  /** Inicializa carga de sitios y el buscador (mismo flujo que el modal de sitios del portal Agencia). */
  ngOnInit(): void {
    this.isInitialLoading = true;
    this._changeDetectorRef.markForCheck();
    this.getAll(0, this.searchForm.value, true);
    this.setupSearchSubscription();
  }

  /** Cierra suscripciones. */
  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // -----
  // @ Funciones On (componentes genéricos)
  // -----
  /** Sin edición en contexto AESAN; evita propagación si la tabla disparara la acción. */
  onTableEdit(event: Event, _id: number): void {
    event.stopPropagation();
    event.preventDefault();
  }

  /** No implementado en este modal (mismo esqueleto que el modal de Agencia). */
  onTableDelete(event: Event, id: number): void {
    console.log('Delete site:', id);
  }

  /** No implementado en este modal. */
  onTableAdd(event?: Event): void {}

  /** Recarga el listado desde la primera página. */
  onTableRefresh(): void {
    this.getAll(0, this.searchForm.value);
  }

  /** Navega al calendario de visitas AESAN y cierra el modal. */
  onTableCalendar(event: Event, id: number): void {
    event.stopPropagation();
    event.preventDefault();

    const element = this.tableConfig.dataSourceList.find((item) => item.id === id);
    const siteId = element?.siteId || id;

    this.dialogRef.close();
    this._customRouterService.navigate(['sponsor-evaluation/visit-calendar', siteId]);
  }

  /**
   * Acciones de tabla no mapeadas por `key` en generic-table: abre el modal de servicios por grupo.
   */
  onTableAction(event: Event, action: string, rowId: number): void {
    if (action === 'viewServices') {
      this.onTableViewServices(event, rowId);
    }
  }

  /** Abre el modal de solo lectura de servicios por grupo (mismo diseño que portal agencia). */
  onTableViewServices(event: Event, rowId: number): void {
    event.stopPropagation();
    event.preventDefault();

    const element = this.tableConfig.dataSourceList.find((item) => item.id === rowId);
    const siteId = element?.siteId;
    if (!siteId) {
      return;
    }

    this._siteService
      .getSiteById({ id: siteId })
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response: unknown) => {
          const raw = response as { body?: SiteResponse };
          const site = (raw?.body ?? raw) as SiteResponse;
          if (!site) {
            this._notificationService.showErrorDialog('dialog.error.message');
            return;
          }
          const dialogData: SiteServicesViewModalData = {
            site,
            agency: this.data.agency,
            siteViewVariant: this.data.siteViewVariant,
          };
          this._dialog.open(SiteServicesViewModalComponent, {
            width: '80%',
            maxWidth: '1200px',
            maxHeight: '90vh',
            data: dialogData,
          });
        },
        error: () => {
          this._notificationService.showErrorDialog('dialog.error.message');
        },
      });
  }

  /** Abre el modal de solo lectura del sitio según el programa (PDAM, PSAV o PACNA). */
  onTableViewSite(event: Event, rowId: number): void {
    event.stopPropagation();
    event.preventDefault();

    const element = this.tableConfig.dataSourceList.find((item) => item.id === rowId);
    const siteId = element?.siteId;
    if (!siteId) {
      return;
    }

    this._siteService
      .getSiteById({ id: siteId })
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response: unknown) => {
          const raw = response as { body?: SiteResponse };
          const site = (raw?.body ?? raw) as SiteResponse;
          if (!site) {
            this._notificationService.showErrorDialog('dialog.error.message');
            return;
          }
          const dialogData: SiteEditModalData = { site, agency: this.data.agency };
          const opts = {
            width: '80%',
            maxWidth: '1200px',
            maxHeight: '90vh',
            data: dialogData,
          };
          switch (this.data.siteViewVariant) {
            case 'pdam':
              this._dialog.open(SiteViewModalPdamComponent, opts);
              break;
            case 'psav':
              this._dialog.open(SiteViewModalPsavComponent, opts);
              break;
            case 'pacna-centro':
              this._dialog.open(SiteViewModalPacnaCentroComponent, opts);
              break;
            case 'pacna-hogar':
              this._dialog.open(SiteViewModalPacnaHogarComponent, opts);
              break;
            default:
              this._notificationService.showErrorDialog('dialog.error.message');
          }
        },
        error: () => {
          this._notificationService.showErrorDialog('dialog.error.message');
        },
      });
  }

  // -----
  // @ Otras funciones públicas
  // -----
  /** Limpia el buscador y recarga. */
  onClearSearch(): void {
    this.searchForm.get('search')?.setValue('');
    this.getAll(0, this.searchForm.value);
  }

  /** Paginación (igual que el modal de Agencia). */
  getPaginator(event?: PageEvent): void {
    const index = !isNullOrUndefinedEmptyStringNullArray(event?.pageIndex) ? event.pageIndex : 0;
    this.tableConfig.pageSize = event?.pageSize || this.tableConfig.pageSize;
    this.getAll(index * this.tableConfig.pageSize, this.searchForm.value);
  }

  /** Cierra el diálogo. */
  closeModal(): void {
    this.dialogRef.close();
  }

  /** Obtiene sitios por escuela (mismo cuerpo que el modal de Agencia; en AESAN solo cambia `onTableCalendar`). */
  getAll(index: number, form: any, isInitialLoad = false): void {
    const queryParameters: QueryParameters = {
      schoolId: this.data.schoolId,
      take: this.tableConfig.pageSize,
      skip: index,
      name: form.search || null,
    };

    this._schoolSiteService
      .getSitesBySchoolId(queryParameters)
      .pipe(
        takeUntil(this._unsubscribeAll),
        finalize(() => {
          if (isInitialLoad) {
            this.isInitialLoading = false;
          }
          this._changeDetectorRef.markForCheck();
        })
      )
      .subscribe({
        next: (response: any) => {
          const data = response?.body?.data || [];
          this.tableConfig.dataSource.data = data;
          this.tableConfig.length = response?.body?.count ?? 0;
          this.tableConfig.dataSourceList = data;
        },
        error: (error) => {
          console.error('Error al obtener sitios de la escuela:', error);
          const fallbackData = this.data.data || [];
          this.tableConfig.dataSource.data = fallbackData;
          this.tableConfig.length = this.data.data?.length || 0;
          this.tableConfig.dataSourceList = fallbackData;
        },
      });
  }

  // -----
  // @ Funciones privadas
  // -----
  private setupSearchSubscription(): void {
    this.searchForm
      .get('search')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this._unsubscribeAll))
      .subscribe((searchValue: string) => {
        this.getAll(0, { search: searchValue || '' });
      });
  }
}
