import { ChangeDetectorRef, Component, inject, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { TranslocoModule } from '@ngneat/transloco';
import { Subject } from 'rxjs';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { GenericTableConfig, OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { SiteStaffResponse } from 'app/shared/models/Response/SiteStaffResponse';
import { STAFF_BY_SITE_COLUMNS_SCHEMA } from './columns-schema';

export interface StaffBySiteModalData {
  siteId: number;
  staffList: SiteStaffResponse[];
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

  // Loading
  isInitialLoading: boolean = true;

  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<SiteStaffResponse>([]),
    columnsSchema: STAFF_BY_SITE_COLUMNS_SCHEMA,
    displayedColumns: STAFF_BY_SITE_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 15,
    pageSizeOptions: [10, 15, 25, 50],
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

  onTableAction(event: Event, action: string, id: number): void {
    event.stopPropagation();
    event.preventDefault();
    // No hay acciones adicionales en este modal
  }

  onClose(): void {
    this.dialogRef.close();
  }
}

