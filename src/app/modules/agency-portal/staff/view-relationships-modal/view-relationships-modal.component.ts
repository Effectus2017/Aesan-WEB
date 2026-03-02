import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { Subject, takeUntil } from 'rxjs';
import { StaffRelationshipService } from 'app/shared/services/staff-relationship.service';
import { StaffService } from 'app/shared/services/staff.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { GenericTableConfig } from 'app/shared/components/generic-table/generic-table.interface';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { VIEW_RELATIONSHIPS_COLUMNS_SCHEMA } from './columns-schema';
import { isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';

@Component({
  selector: 'app-view-relationships-modal',
  templateUrl: './view-relationships-modal.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    GenericTableComponent,
    TranslocoModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
export class ViewRelationshipsModalComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _translocoService = inject(TranslocoService);
  private _staffRelationshipService = inject(StaffRelationshipService);
  private _staffService = inject(StaffService);

  relationshipsTableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<any>(),
    columnsSchema: VIEW_RELATIONSHIPS_COLUMNS_SCHEMA,
    displayedColumns: VIEW_RELATIONSHIPS_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    showPaginator: true,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50],
    length: 0,
    addButtonShow: false,
    fullScreen: true,
  };

  staffName: string = '';
  isLoading: boolean = false;
  hasRelationships: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ViewRelationshipsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { staffId: number },
  ) {}

  ngOnInit(): void {
    this.loadStaffData();
    this.loadRelationships();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  /**
   * Carga los datos del staff y construye el nombre completo para mostrarlo en el modal.
   */
  private loadStaffData(): void {
    const queryParams: QueryParameters = { id: this.data.staffId };

    this._staffService.getStaffById(queryParams).subscribe({
      next: (response) => {
        if (response?.body) {
          const s = response.body;
          this.staffName = `${s.firstName ?? ''} ${s.middleName ?? ''} ${s.fatherLastName ?? ''} ${s.motherLastName ?? ''}`.trim();
          this._changeDetectorRef.markForCheck();
        }
      },
      error: (error) => {
        console.error('Error loading staff data:', error);
        this.staffName = this._translocoService.translate('staff.boardMembers.list.viewRelationships.unknownStaff');
        this._changeDetectorRef.markForCheck();
      },
    });
  }

  /**
   * Carga las relaciones del staff
   */
  private loadRelationships(): void {
    this.isLoading = true;

    const queryParams: QueryParameters = {
      id: this.data.staffId,
      isActive: false, // Obtener todas las relaciones (activas e inactivas)
    };

    this._staffRelationshipService.getRelationshipsByStaffId(queryParams).subscribe({
      next: (response) => {
        if (!isNullOrUndefinedEmptyStringNullArray(response?.body)) {
          const relationships = response.body;
          this.relationshipsTableConfig.dataSource.data = relationships;
          this.relationshipsTableConfig.length = relationships.length;
          this.hasRelationships = relationships.length > 0;
        } else {
          this.relationshipsTableConfig.dataSource.data = [];
          this.relationshipsTableConfig.length = 0;
          this.hasRelationships = false;
        }
        this.isLoading = false;
        this._changeDetectorRef.markForCheck();
      },
      error: (error) => {
        console.error('Error loading relationships:', error);
        this.relationshipsTableConfig.dataSource.data = [];
        this.relationshipsTableConfig.length = 0;
        this.hasRelationships = false;
        this.isLoading = false;
        this._changeDetectorRef.markForCheck();
      },
    });
  }

  /**
   * Cierra el modal
   */
  onCancel(): void {
    this.dialogRef.close();
  }
}

