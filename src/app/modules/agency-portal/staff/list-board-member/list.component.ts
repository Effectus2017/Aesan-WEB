import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { ViewEncapsulation } from '@angular/core';
import { StaffService } from 'app/shared/services/staff.service';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { AuthService } from 'app/core/auth/auth.service';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { StaffTableResponse } from 'app/shared/models/staff/Staff';
import { BOARD_MEMBERS_COLUMNS_SCHEMA } from './columns-schema';
import { BOARD_MEMBERS_FILTERS_SCHEMA } from './filters-schema';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericTableConfig, GenericFilterResult, OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { GenericFilterDrawerComponent } from 'app/shared/components/generic-filter-drawer/generic-filter-drawer.component';
import { OnGenericFilterHandlers } from 'app/shared/components/generic-filter-panel/generic-filter-panel.interface';
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
    GenericFilterDrawerComponent,
    TranslocoModule,
  ],
})
export class ListBoardMembersComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers, OnGenericTableHandler, OnGenericFilterHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _staffService = inject(StaffService);
  private _customRouterService = inject(CustomRouterService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _authService = inject(AuthService);
  private _route = inject(ActivatedRoute);
  private _matDialog = inject(MatDialog);
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  @ViewChild('filterDrawer') filterDrawer!: GenericFilterDrawerComponent;
  filtersSchema = BOARD_MEMBERS_FILTERS_SCHEMA;
  appliedFilters: GenericFilterResult = {};

  headerConfig: GenericHeaderConfig = {
    title: 'staff.boardMembers.list.title',
    formGroup: this._formBuilder.group({
      name: new FormControl('')
    }),
    searchFieldShow: false,
    filterButtonShow: true,
    filterButtonTooltip: 'global.tooltips.header.filter',
    customButtonShow: true,
    customButtonClass: 'text-white bg-[#F1A621]',
    customButtonIcon: 'mat_outline:add',
    customButtonIconEnabled: true,
    customButtonPermission: 'staff.create',
  };

  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<StaffTableResponse>(),
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

  onSearch(): void {}

  onFilter(): void {
    this.filterDrawer?.toggle();
  }

  onFiltersApply(filters: GenericFilterResult): void {
    this.appliedFilters = { ...filters };
    this.filterDrawer?.close();
    this.getAll(0);
    this._changeDetectorRef.markForCheck();
  }

  onFiltersReset(): void {
    this.appliedFilters = {};
    this.getAll(0);
    this._changeDetectorRef.markForCheck();
  }

  getAll(index: number): void {
    const agencyId = this._authService.getAgencyId();
    const queryParams: QueryParameters = {
      take: this.tableConfig.pageSize,
      skip: index,
      staffTypeId: 2,
      agencyId: agencyId ?? undefined,
      ...this.appliedFilters,
    };

    this._staffService.getAllStaffFromDb(queryParams).subscribe({
      next: (response) => {
        this.tableConfig.dataSource.data = response.body?.data ?? [];
        this.tableConfig.length = response.body?.count ?? 0;
        this._changeDetectorRef.markForCheck();
      },
      error: (error) => {
        console.error('Error loading staff:', error);
      }
    });
  }

  onCustom(): void {
    this._customRouterService.navigate(['staff/add-board-member']);
  }

  onTableViewRelationships(event: Event, id: number): void {
    event.stopPropagation();
    event.preventDefault();

    const dialogRef = this._matDialog.open(ViewRelationshipsModalComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: { staffId: id },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getAll(0);
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
          this.getAll(0);
        }
      },
      error: (error) => {
        console.error('Error deleting staff:', error);
      }
    });
  }

  onPageChange(event: any): void {
    const index = !isNullOrUndefinedEmptyStringNullArray(event?.pageIndex) ? event.pageIndex : 0;
    this.tableConfig.pageSize = event?.pageSize ?? this.tableConfig.pageSize;
    this.getAll(index * this.tableConfig.pageSize);
  }
}
