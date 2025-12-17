import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule, ActivatedRoute } from '@angular/router';
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
import { SITES_PACNA_COLUMNS_SCHEMA } from './columns-schema';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericTableConfig } from 'app/shared/components/generic-table/generic-table.interface';
import { SiteService } from 'app/shared/services/site.service';
import { SiteTableResponse } from 'app/shared/models/Response/SiteTableResponse';
import { AuthService } from 'app/core/auth/auth.service';
import { PROGRAM_IDS } from 'app/shared/const';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';

@Component({
  selector: 'app-sites-pacna-list',
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
export class SitesPacnaListComponent implements OnInit, OnDestroy, OnGenericTableHandler, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _siteService = inject(SiteService);
  private _customRouterService = inject(CustomRouterService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _authService = inject(AuthService);
  private _route = inject(ActivatedRoute);
  private _optionSelectionService = inject(OptionSelectionService);
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isPACNAAgency = false;
  private _centerOptionId?: number;
  private _homeOptionId?: number;
  private _currentIsDayCareHomeId?: number;

  headerConfig: GenericHeaderConfig = {
    title: 'sites.list.title',
    formGroup: this._formBuilder.group({
      name: new FormControl(''),
    }),
    searchFieldShow: true,
    searchInputPlaceholder: 'sites.list.search.placeholder',
    submitButtonText: 'sites.list.buttons.save',
    goToAddButtonShow: true,
    goToAddButtonPermission: 'site.create',
  };

  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<SiteTableResponse>(),
    columnsSchema: SITES_PACNA_COLUMNS_SCHEMA,
    displayedColumns: SITES_PACNA_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 15,
    pageSizeOptions: [15, 50, 100],
    length: 0,
    fullScreen: true,
  };

  constructor() {}

  ngOnInit() {
    this.detectPACNAAgency();
    this.loadIsDayCareHomeOptions();

    // Leer isDayCareHomeId de los query parameters
    this._route.queryParams
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(params => {
        const isDayCareHomeId = params['isDayCareHomeId'] ? parseInt(params['isDayCareHomeId'], 10) : undefined;
        this._currentIsDayCareHomeId = isDayCareHomeId;
        this.updateHeaderTitle(isDayCareHomeId);
        
        // Obtener datos del resolver
        const resolvedData = this._route.snapshot.data['data'];

        if (resolvedData) {
          this.tableConfig.dataSource.data = resolvedData.sites.data;
          this.tableConfig.length = resolvedData.sites.count;
          this.tableConfig.dataSourceList = resolvedData.sites.data;
          this._changeDetectorRef.markForCheck();
        }

        // Si hay isDayCareHomeId en query params, hacer una nueva búsqueda
        if (isDayCareHomeId !== undefined) {
          this.getAll(0, this.headerConfig.formGroup.value);
        }
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
    
    // Leer isDayCareHomeId de los query parameters actuales
    const isDayCareHomeId = this._route.snapshot.queryParams['isDayCareHomeId'] 
      ? parseInt(this._route.snapshot.queryParams['isDayCareHomeId'], 10) 
      : undefined;

    const requestParameters: QueryParameters = {
      take: pageSize,
      skip: index,
      name: name,
      alls: false,
      isDayCareHomeId: isDayCareHomeId,
    };

    this._siteService.getAllSitesFromDb(requestParameters)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response: any) => {
          if (response && response.body) {
            this.tableConfig.dataSource.data = response.body.data || [];
            this.tableConfig.length = response.body.count || 0;
            this.tableConfig.dataSourceList = response.body.data || [];
            this._changeDetectorRef.markForCheck();
          }
        },
        error: (error) => {
          console.error('Error al obtener sitios:', error);
        }
      });
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
    // Navegar a sites-pacna/edit
    const isDayCareHomeId = this._route.snapshot.queryParams['isDayCareHomeId'];
    if (isDayCareHomeId) {
      this._customRouterService.navigate([`sites-pacna/edit/${id}`], {
        queryParams: { isDayCareHomeId: isDayCareHomeId }
      });
    } else {
      this._customRouterService.navigate([`sites-pacna/edit/${id}`]);
    }
  }

  onTableCalendar(event: Event, id: number) {
    event.stopPropagation();
    event.preventDefault();
    this._customRouterService.navigate([`sites-pacna/calendar/${id}`]);
  }

  onAdd() {
    // Navegar a sites-pacna/add con el queryParam si existe
    const isDayCareHomeId = this._route.snapshot.queryParams['isDayCareHomeId'];
    if (isDayCareHomeId) {
      this._customRouterService.navigate(['sites-pacna/add'], { 
        queryParams: { isDayCareHomeId: isDayCareHomeId } 
      });
    } else {
      this._customRouterService.navigate(['sites-pacna/add']);
    }
  }

  private detectPACNAAgency(): void {
    const programsRaw = localStorage.getItem('agencyPrograms');
    if (!programsRaw) {
      this.isPACNAAgency = false;
      return;
    }

    try {
      const programs: Array<{ id: number }> = JSON.parse(programsRaw);
      this.isPACNAAgency = Array.isArray(programs) && programs.some((program) => program?.id === PROGRAM_IDS.PACNA);
    } catch {
      this.isPACNAAgency = false;
    }
  }

  private loadIsDayCareHomeOptions(): void {
    const params: QueryParameters = { optionKey: 'isDayCareHome' } as QueryParameters;
    this._optionSelectionService
      .getOptionSelectionByOptionKey(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response: any) => {
          const options = response?.body?.data || response?.body || [];
          const centerOption = options.find((option: any) => option?.booleanValue === false);
          const homeOption = options.find((option: any) => option?.booleanValue === true);
          this._centerOptionId = centerOption?.id;
          this._homeOptionId = homeOption?.id;
          this.updateHeaderTitle(this._currentIsDayCareHomeId);
        },
        error: (error) => {
          console.error('Error al obtener opciones de isDayCareHome:', error);
        },
      });
  }

  private updateHeaderTitle(isDayCareHomeId?: number): void {
    if (!this.isPACNAAgency) {
      this.headerConfig.title = 'sites.list.title';
      return;
    }

    if (this._centerOptionId && isDayCareHomeId === this._centerOptionId) {
      this.headerConfig.title = 'sites.list.titleCenters';
    } else if (this._homeOptionId && isDayCareHomeId === this._homeOptionId) {
      this.headerConfig.title = 'sites.list.titleHomes';
    } else {
      this.headerConfig.title = 'sites.list.title';
    }

    this._changeDetectorRef.markForCheck();
  }
}

