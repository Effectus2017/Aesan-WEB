import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { fuseAnimations } from '@fuse/animations';
import { TranslocoModule } from '@ngneat/transloco';
import { isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { SCHOOLS_COLUMNS_SCHEMA } from './columns-schema';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericTableConfig } from 'app/shared/components/generic-table/generic-table.interface';
import { SchoolService } from 'app/shared/services/school.service';
import { School } from 'app/shared/models/School';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
  selector: 'app-schools-list',
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
    GenericTableComponent,
    GenericHeaderComponent,
    TranslocoModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent implements OnInit, OnDestroy, OnGenericTableHandler, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _schoolService = inject(SchoolService);
  private _customRouterService = inject(CustomRouterService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _authService = inject(AuthService);
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  headerConfig: GenericHeaderConfig = {
    title: 'schools.list.title',
    formGroup: this._formBuilder.group({
      name: new FormControl(''),
    }),
    searchFieldShow: true,
    searchInputPlaceholder: 'schools.list.search.placeholder',
    submitButtonText: 'schools.list.buttons.save',
    goToAddButtonShow: true,
  };

  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<School>(),
    columnsSchema: SCHOOLS_COLUMNS_SCHEMA,
    displayedColumns: SCHOOLS_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 15,
    pageSizeOptions: [15, 50, 100],
    length: 0,
  };

  constructor() {}

  ngOnInit() {


    // Obtener las escuelas
    this._schoolService.schools$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.tableConfig.dataSource.data = result.body.data;
        this.tableConfig.length = result.body.count;

        // Lista de datos
        this.tableConfig.dataSourceList = result.body.data;
      }

      // Marcar para que se actualice la vista
      this._changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onSearch() {
    if (this.headerConfig.formGroup.valid) {
      this.getAll(0, this.headerConfig.formGroup.value);
      this.headerConfig.clearVisible = true;
    }
  }

  getAll(index: number, form: any) {
    const name = form.name || null;
    const pageSize = this.tableConfig.pageSize;

    const requestParameters: QueryParameters = {
      take: pageSize,
      skip: index,
      name: name,
      alls: false,
    };

    this._schoolService.getAllSchoolsFromDb(requestParameters).subscribe();
  }

  getPaginator(event?: PageEvent) {
    const index = !isNullOrUndefinedEmptyStringNullArray(event?.pageIndex) ? event.pageIndex : 0;
    this.tableConfig.pageSize = event?.pageSize || this.tableConfig.pageSize;
    this.getAll(index * this.tableConfig.pageSize, this.headerConfig.formGroup.value);
  }

  onClean(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.headerConfig.clearVisible = false;
    this.headerConfig.formGroup.reset();
    this.getAll(0, this.headerConfig.formGroup.value);
  }

  onTableEdit(event: Event, id: number) {
    event.stopPropagation();
    event.preventDefault();
    this._customRouterService.navigate([`schools/edit/${id}`]);
  }

  onAdd() {
    this._customRouterService.navigate(['schools/add']);
  }
}
