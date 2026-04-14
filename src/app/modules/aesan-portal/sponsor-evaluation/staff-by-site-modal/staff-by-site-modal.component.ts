import { ChangeDetectorRef, Component, inject, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { TranslocoModule } from '@ngneat/transloco';
import { Subject, takeUntil } from 'rxjs';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { GenericTableConfig, OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { SchoolStaffResponse } from 'app/shared/models/response/SchoolStaffResponse';
import { NotificationService } from 'app/shared/services/notification.service';
import { StaffService } from 'app/shared/services/staff.service';
import { StaffDetailViewModalComponent } from '../staff-detail-view-modal/staff-detail-view-modal.component';
import { Staff } from 'app/shared/models/staff/Staff';
import { STAFF_BY_SITE_COLUMNS_SCHEMA } from './columns-schema';

export interface StaffBySiteModalData {
  siteId: number;
  schoolId?: number;
  /** Contexto escuela (modal sitios por escuela en evaluación auspiciador). */
  schoolName?: string;
  staffList: SchoolStaffResponse[];
}

@Component({
  selector: 'app-staff-by-site-modal',
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
  templateUrl: './staff-by-site-modal.component.html',
  encapsulation: ViewEncapsulation.None,
  styles: [`
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .animate-slide-in {
      animation: fadeIn 1.0s ease-out;
    }
  `]
})
export class StaffBySiteModalComponent implements OnInit, OnDestroy, OnGenericTableHandler {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _dialog = inject(MatDialog);
  private _staffService = inject(StaffService);
  private _notificationService = inject(NotificationService);

  // Loading
  isInitialLoading: boolean = true;

  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<SchoolStaffResponse>([]),
    columnsSchema: STAFF_BY_SITE_COLUMNS_SCHEMA,
    displayedColumns: STAFF_BY_SITE_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 25,
    pageSizeOptions: [25, 50, 100],
    length: 0,
    fullScreen: true,
  };

  siteId: number;
  siteName: string = '';

  constructor(
    public dialogRef: MatDialogRef<StaffBySiteModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StaffBySiteModalData
  ) {
    this.siteId = data.siteId;
  }

  ngOnInit(): void {
    // Simular carga inicial para mostrar el indicador de carga
    setTimeout(() => {
      if (this.data.staffList) {
        this.tableConfig.dataSource.data = this.data.staffList;
        this.tableConfig.length = this.data.staffList.length;
      }
      this.isInitialLoading = false;
      this._changeDetectorRef.detectChanges();
    }, 100);
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onTableAdd(event?: Event, tableId?: string): void {
    // No se permite agregar desde este modal
  }

  onTableEdit(event: Event, id: number): void {
    event.stopPropagation();
    event.preventDefault();
    // No se permite editar desde este modal
  }

  onTableDelete(event: Event, id: number): void {
    event.stopPropagation();
    event.preventDefault();
    // No se permite eliminar desde este modal
  }

  /** Abre el modal de detalle del empleado cuando la acción es ver ficha. */
  onTableAction(event: Event, action: string, rowId: number): void {
    event.stopPropagation();
    event.preventDefault();
    if (action !== 'viewStaffDetail') {
      return;
    }
    const row = this.tableConfig.dataSource.data.find((r) => r.id === rowId);
    const staffId = row?.staffId;
    if (!staffId) {
      return;
    }
    this._staffService
      .getStaffById({ id: staffId })
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

  onClose(): void {
    this.dialogRef.close();
  }
}

