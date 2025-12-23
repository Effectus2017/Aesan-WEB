import { Component, Inject, OnInit, ChangeDetectorRef, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslocoModule } from '@ngneat/transloco';
import { GenericTableComponent } from '../../../../shared/components/generic-table/generic-table.component';
import { GenericTableConfig, OnGenericTableHandler } from '../../../../shared/components/generic-table/generic-table.interface';
import { SITES_COLUMNS_SCHEMA } from './columns-schema';
import { Site } from '../../../../shared/models/Site';
import { SchoolSiteTableResponse } from '../../../../shared/models/Response/SchoolSiteTableResponse';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { CustomRouterService } from '../../../../shared/services/custom-router.service';
import { SchoolSiteService } from '../../../../shared/services/school-site.service';
import { QueryParameters } from '../../../../shared/models/QueryParameters';
import { PageEvent } from '@angular/material/paginator';
import { isNullOrUndefinedEmptyStringNullArray } from '../../../../shared/utils';
import { PROGRAM_IDS } from '../../../../shared/const';

@Component({
  selector: 'app-sites-center-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    TranslocoModule,
    GenericTableComponent,
    ReactiveFormsModule
  ],
  templateUrl: './sites-modal.component.html',
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
      animation: fadeIn 2.0s ease-out;
    }
  `]
})
export class SitesCentersModalComponent implements OnInit, OnDestroy, OnGenericTableHandler {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _formBuilder = inject(FormBuilder);
  private _customRouterService = inject(CustomRouterService);
  private _schoolSiteService = inject(SchoolSiteService);

  // Search form
  searchForm: FormGroup;

  // Loading state
  isInitialLoading: boolean = false;

  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<SchoolSiteTableResponse>([]),
    dataSourceList: [],
    columnsSchema: SITES_COLUMNS_SCHEMA,
    displayedColumns: SITES_COLUMNS_SCHEMA.map(col =>
      Array.isArray(col.key) ? col.key[0] : col.key
    ),
    handler: this,
    showPaginator: true,
    pageSize: 15,
    pageSizeOptions: [5, 10, 15, 25],
    addButtonShow: false,
    length: 0,
    fullScreen: true,
  };

  constructor(
    public dialogRef: MatDialogRef<SitesCentersModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.searchForm = this._formBuilder.group({
      search: new FormControl('')
    });
  }

  ngOnInit(): void {
    this.isInitialLoading = true;
    this._changeDetectorRef.markForCheck();
    this.getAll(0, this.searchForm.value, true);
    this.setupSearchSubscription();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  getAll(index: number, form: any, isInitialLoad: boolean = false): void {
    const queryParameters: QueryParameters = {
      schoolId: this.data.schoolId,
      take: this.tableConfig.pageSize,
      skip: index,
      name: form.search || null
    };

    this._schoolSiteService.getSitesBySchoolId(queryParameters)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response: any) => {
          const data = (response.body.data || []).map((site: SchoolSiteTableResponse) => {
            // Format operating date range
            if (site.operatingFromDate && site.operatingToDate) {
              const fromDate = new Date(site.operatingFromDate);
              const toDate = new Date(site.operatingToDate);
              // Use browser locale for date formatting
              const locale = navigator.language || 'en-US';
              const formattedFrom = fromDate.toLocaleDateString(locale, { year: 'numeric', month: '2-digit', day: '2-digit' });
              const formattedTo = toDate.toLocaleDateString(locale, { year: 'numeric', month: '2-digit', day: '2-digit' });
              (site as any).operatingDaysFormatted = `${formattedFrom} - ${formattedTo}`;
            } else {
              (site as any).operatingDaysFormatted = '';
            }
            return site;
          });
          this.tableConfig.dataSource.data = data;
          this.tableConfig.length = response.body.count || 0;
          this.tableConfig.dataSourceList = data;
          if (isInitialLoad) {
            this.isInitialLoading = false;
          }
          this._changeDetectorRef.markForCheck();
        },
        error: (error) => {
          console.error('Error loading center sites:', error);
          // Fallback to data passed by modal if there's an error
          const fallbackData = (this.data.data || []).map((site: SchoolSiteTableResponse) => {
            if (site.operatingFromDate && site.operatingToDate) {
              const fromDate = new Date(site.operatingFromDate);
              const toDate = new Date(site.operatingToDate);
              // Use browser locale for date formatting
              const locale = navigator.language || 'en-US';
              const formattedFrom = fromDate.toLocaleDateString(locale, { year: 'numeric', month: '2-digit', day: '2-digit' });
              const formattedTo = toDate.toLocaleDateString(locale, { year: 'numeric', month: '2-digit', day: '2-digit' });
              (site as any).operatingDaysFormatted = `${formattedFrom} - ${formattedTo}`;
            } else {
              (site as any).operatingDaysFormatted = '';
            }
            return site;
          });
          this.tableConfig.dataSource.data = fallbackData;
          this.tableConfig.length = this.data.data?.length || 0;
          this.tableConfig.dataSourceList = fallbackData;
          if (isInitialLoad) {
            this.isInitialLoading = false;
          }
          this._changeDetectorRef.markForCheck();
        }
      });
  }

  private setupSearchSubscription(): void {
    this.searchForm.get('search')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe((searchValue: string) => {
        this.getAll(0, { search: searchValue || '' });
      });
  }

  getPaginator(event?: PageEvent): void {
    const index = !isNullOrUndefinedEmptyStringNullArray(event?.pageIndex) ? event.pageIndex : 0;
    this.tableConfig.pageSize = event?.pageSize || this.tableConfig.pageSize;
    this.getAll(index * this.tableConfig.pageSize, this.searchForm.value);
  }

  // Implementation of OnGenericTableHandler
  onTableEdit(event: Event, id: number): void {
    event.stopPropagation();
    event.preventDefault();

    // Find the element to get the siteId (the received id is the SchoolSite relationship ID)
    const element = this.tableConfig.dataSourceList.find(item => item.id === id);
    const siteId = element?.siteId || id; // Fallback to id if not found

    // Determine route based on program
    const programsRaw = localStorage.getItem('agencyPrograms');
    let targetRoute = 'sites-pdam';
    if (programsRaw) {
      try {
        const programs = JSON.parse(programsRaw);
        const isPACNA = programs.some((p: any) => p?.id === PROGRAM_IDS.PACNA);
        if (isPACNA) {
          targetRoute = 'sites-pacna';
        }
      } catch {
        // If parsing error, use default route
      }
    }

    this.dialogRef.close();
    this._customRouterService.navigate([`${targetRoute}/edit/${siteId}`]);
  }

  onTableDelete(event: Event, id: number): void {
    // Delete functionality not implemented in this modal
    console.log('Delete site action triggered:', id);
  }

  onTableAdd(event?: Event): void {
    // No implementado en este modal
  }

  onTableRefresh(): void {
    this.getAll(0, this.searchForm.value);
  }

  onTableCalendar(event: Event, id: number): void {
    event.stopPropagation();
    event.preventDefault();

    // Find the element to get the siteId (the received id is the SchoolSite relationship ID)
    const element = this.tableConfig.dataSourceList.find(item => item.id === id);
    const siteId = element?.siteId || id; // Fallback to id if not found

    // Determine route based on program
    const programsRaw = localStorage.getItem('agencyPrograms');
    let targetRoute = 'sites-pdam';
    if (programsRaw) {
      try {
        const programs = JSON.parse(programsRaw);
        const isPACNA = programs.some((p: any) => p?.id === PROGRAM_IDS.PACNA);
        if (isPACNA) {
          targetRoute = 'sites-pacna';
        }
      } catch {
        // If parsing error, use default route
      }
    }

    this.dialogRef.close();
    this._customRouterService.navigate([`${targetRoute}/calendar/${siteId}`]);
  }

  onClearSearch(): void {
    this.searchForm.get('search')?.setValue('');
    this.getAll(0, this.searchForm.value);
  }

  onAddButtonClick(event?: Event): void {
    // Close modal and navigate to sites/add with schoolId as query parameter
    let targetRoute = 'sites-pacna/centers';
    this.dialogRef.close();
    this._customRouterService.navigate([`${targetRoute}/add`], {
      queryParams: { schoolId: this.data.schoolId }
    });
  }

  closeModal(): void {
    this.dialogRef.close();
  }
}

