import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TranslocoModule } from '@ngneat/transloco';
import { Subject, takeUntil } from 'rxjs';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { GenericTableConfig, OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { Staff, StaffTableResponse } from 'app/shared/models/staff/Staff';
import { NotificationService } from 'app/shared/services/notification.service';
import { StaffService } from 'app/shared/services/staff.service';
import { StaffDetailViewModalComponent } from '../staff-detail-view-modal/staff-detail-view-modal.component';
import { AGENCY_BOARD_MEMBERS_READONLY_COLUMNS_SCHEMA } from './columns-schema';

/** staffTypeId en BD para miembros de junta (mismo criterio que list-board-member). */
const BOARD_MEMBER_STAFF_TYPE_ID = 2;

export interface AgencyBoardMembersModalData {
  agencyId: number;
  agencyName: string;
}

@Component({
  selector: 'app-agency-board-members-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    TranslocoModule,
    GenericTableComponent,
  ],
  templateUrl: './agency-board-members-modal.component.html',
  encapsulation: ViewEncapsulation.None,
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
export class AgencyBoardMembersModalComponent implements OnInit, OnDestroy, OnGenericTableHandler {
  // -----
  // @ Subject de desuscripción
  // -----
  private _unsubscribeAll = new Subject<any>();

  // -----
  // @ Inyecciones privadas
  // -----
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _staffService = inject(StaffService);
  private _notificationService = inject(NotificationService);
  private _dialog = inject(MatDialog);

  // -----
  // @ Variables
  // -----
  isInitialLoading = true;

  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<StaffTableResponse>([]),
    columnsSchema: AGENCY_BOARD_MEMBERS_READONLY_COLUMNS_SCHEMA,
    displayedColumns: AGENCY_BOARD_MEMBERS_READONLY_COLUMNS_SCHEMA.map((col) =>
      Array.isArray(col.key) ? col.key[0] : col.key,
    ),
    handler: this,
    showPaginator: true,
    pageSize: 25,
    pageSizeOptions: [25, 50, 100],
    length: 0,
    fullScreen: true,
  };

  agencyId: number;
  agencyName = '';

  // -----
  // @ Constructor
  // -----
  constructor(
    public dialogRef: MatDialogRef<AgencyBoardMembersModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AgencyBoardMembersModalData,
  ) {
    this.agencyId = data.agencyId;
    this.agencyName = data.agencyName ?? '';
  }

  // -----
  // @ ngOnInit / ngOnDestroy
  // -----
  /** Carga miembros de junta de la agencia (solo lectura). */
  ngOnInit(): void {
    this._loadBoardMembers();
  }

  /** Cierra suscripciones. */
  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // -----
  // @ Funciones On (componentes genéricos)
  // -----
  /** No se permite agregar desde este modal. */
  onTableAdd(_event?: Event, _tableId?: string): void {}

  /** No se permite editar desde este modal. */
  onTableEdit(event: Event, _id: number): void {
    event.stopPropagation();
    event.preventDefault();
  }

  /** No se permite eliminar desde este modal. */
  onTableDelete(event: Event, _id: number): void {
    event.stopPropagation();
    event.preventDefault();
  }

  /** Abre la ficha de solo lectura del miembro de junta. */
  onTableAction(event: Event, action: string, rowId: number): void {
    event.stopPropagation();
    event.preventDefault();
    if (action !== 'viewStaffDetail') {
      return;
    }
    this._staffService
      .getStaffById({ id: rowId })
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response: { body?: Staff } | Staff) => {
          const raw = response as { body?: Staff };
          const staff = raw?.body ?? (response as Staff);
          if (!staff) {
            this._notificationService.showErrorDialog('dialog.error.message');
            return;
          }
          this._dialog.open(StaffDetailViewModalComponent, {
            width: '90vw',
            maxWidth: '720px',
            maxHeight: '90vh',
            data: { staff },
          });
        },
        error: () => this._notificationService.showErrorDialog('dialog.error.message'),
      });
  }

  // -----
  // @ Otras funciones públicas
  // -----
  /** Cierra el diálogo. */
  onClose(): void {
    this.dialogRef.close();
  }

  // -----
  // @ Funciones privadas
  // -----
  /** Obtiene el listado paginado de junta vía get-staff-by-agency. */
  private _loadBoardMembers(): void {
    const queryParams: QueryParameters = {
      agencyId: this.agencyId,
      take: 500,
      skip: 0,
      staffTypeId: BOARD_MEMBER_STAFF_TYPE_ID,
    };

    this._staffService
      .getStaffByAgency(queryParams)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (result: any) => {
          const body = result?.body ?? result;
          const rows = body?.data ?? [];
          this.tableConfig.dataSource.data = rows;
          this.tableConfig.length = body?.count ?? rows.length;
          this.isInitialLoading = false;
          this._changeDetectorRef.markForCheck();
        },
        error: () => {
          this.tableConfig.dataSource.data = [];
          this.tableConfig.length = 0;
          this.isInitialLoading = false;
          this._notificationService.showErrorDialog('dialog.error.message');
          this._changeDetectorRef.markForCheck();
        },
      });
  }
}
