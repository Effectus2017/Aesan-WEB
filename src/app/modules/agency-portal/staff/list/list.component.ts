import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { ViewEncapsulation } from '@angular/core';
import { StaffService } from 'app/shared/services/staff.service';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { AuthService } from 'app/core/auth/auth.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { StaffList } from 'app/shared/models/Staff';
import { BOARD_MEMBERS_COLUMNS_SCHEMA } from './columns-schema';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericTableConfig, OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { ViewRelationshipsModalComponent } from '../view-relationships-modal/view-relationships-modal.component';

@Component({
  selector: 'app-staff-list',
  templateUrl: './list.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatTableModule,
    MatInputModule,
    MatDialogModule,
    RouterModule,
    GenericTableComponent,
    GenericHeaderComponent,
    TranslocoModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListBoardMembersComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers, OnGenericTableHandler {
  private _formBuilder = inject(UntypedFormBuilder);
  private _staffService = inject(StaffService);
  private _customRouterService = inject(CustomRouterService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _authService = inject(AuthService);
  private _route = inject(ActivatedRoute);
  private _matDialog = inject(MatDialog);
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  headerConfig: GenericHeaderConfig = {
    title: 'staff.boardMembers.list.title',
    formGroup: this._formBuilder.group({
      name: new FormControl('')
    }),
    searchFieldShow: true,
    customButtonShow: true,
    customButtonClass: 'text-white bg-[#F1A621]',
    customButtonIcon: 'mat_outline:add',
    customButtonIconEnabled: true,
    searchInputPlaceholder: 'staff.boardMembers.list.search.placeholder'
  };

  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<StaffList>(),
    columnsSchema: BOARD_MEMBERS_COLUMNS_SCHEMA,
    displayedColumns: BOARD_MEMBERS_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 15,
    pageSizeOptions: [15, 50, 100],
    length: 0,
    fullScreen: true,
  };

  ngOnInit(): void {
    // Obtener datos del resolver en lugar de suscribirse
    const resolvedData = this._route.snapshot.data['data'];

    if (resolvedData) {
      this.tableConfig.dataSource.data = resolvedData.staff.data;
      this.tableConfig.length = resolvedData.staff.count;
      this._changeDetectorRef.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onSearch(): void {
    this.getAll(0, this.headerConfig.formGroup.value);
  }

  getAll(index: number, form: any): void {
    const queryParams: QueryParameters = {
      take: this.tableConfig.pageSize,
      skip: index * this.tableConfig.pageSize,
      name: form.name || null
    };

    this._staffService.getAllStaffFromDb(queryParams).subscribe({
      next: (response) => {
        // Filtrar solo miembros de junta en el resultado
        const boardMembers = response.body.data.filter((staff: StaffList) =>
          staff.staffTypeName === 'Miembro de la Junta' || staff.staffTypeName === 'Board Member'
        );
        this.tableConfig.dataSource.data = boardMembers;
        this.tableConfig.length = boardMembers.length;
        this._changeDetectorRef.markForCheck();
      },
      error: (error) => {
        console.error('Error loading staff:', error);
      }
    });
  }

  onCustom(): void {
    this._customRouterService.navigate(['staff/add'], { queryParams: { staffType: 'board-member' } });
  }

  onTableViewRelationships(event: Event, id: number): void {
    event.stopPropagation();
    event.preventDefault();

    // Obtener el nombre del staff desde los datos de la tabla
    const staff = this.tableConfig.dataSource.data.find((s: StaffList) => s.id === id);
    const staffName = staff
      ? `${staff.firstName || ''} ${staff.middleName || ''} ${staff.fatherLastName || ''} ${staff.motherLastName || ''}`.trim()
      : undefined;

    const dialogRef = this._matDialog.open(ViewRelationshipsModalComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: {
        staffId: id,
        staffName: staffName,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getAll(0, this.headerConfig.formGroup.value);
      }
    });
  }

  onTableEdit(event: Event, id: number): void {
    event.stopPropagation();
    event.preventDefault();
    this._customRouterService.navigate(['staff/edit-board-member', id]);
  }

  onDelete(id: number): void {
    const queryParams: QueryParameters = {
      id: id
    };

    this._staffService.deleteStaff(queryParams).subscribe({
      next: (response) => {
        if (response.body) {
          // Recargar la lista después de eliminar
          this.getAll(0, this.headerConfig.formGroup.value);
        }
      },
      error: (error) => {
        console.error('Error deleting staff:', error);
      }
    });
  }

  onPageChange(event: any): void {
    this.getAll(event.pageIndex, this.headerConfig.formGroup.value);
  }
}
