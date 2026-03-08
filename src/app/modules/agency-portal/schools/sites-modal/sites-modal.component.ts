import { Component, Inject, OnInit, ChangeDetectorRef, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { TranslocoModule } from '@ngneat/transloco';
import { GenericTableComponent } from '../../../../shared/components/generic-table/generic-table.component';
import { GenericTableConfig, OnGenericTableHandler } from '../../../../shared/components/generic-table/generic-table.interface';
import { SITES_COLUMNS_SCHEMA } from './columns-schema';
import { SchoolSiteTableResponse } from '../../../../shared/models/response/SchoolSiteTableResponse';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { CustomRouterService } from '../../../../shared/services/custom-router.service';
import { SchoolSiteService } from '../../../../shared/services/school-site.service';
import { QueryParameters } from '../../../../shared/models/common/QueryParameters';
import { isNullOrUndefinedEmptyStringNullArray } from '../../../../shared/utils';
import { PROGRAM_IDS } from '../../../../shared/const';
import { DisableIfNoPermissionDirective } from 'app/shared/directives/disable-if-no-permission/disable-if-no-permission.directive';
import { DisableIfAgencyRestrictedDirective } from 'app/shared/directives/disable-if-agency-restricted/disable-if-agency-restricted.directive';
import { KeyboardShortcutDirective } from 'app/shared/directives/keyboard-shortcut.directive';

@Component({
  selector: 'app-sites-modal',
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
    DisableIfNoPermissionDirective,
    DisableIfAgencyRestrictedDirective,
    KeyboardShortcutDirective
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
      animation: fadeIn 1.0s ease-out;
    }
  `]
})
export class SitesModalComponent implements OnInit, OnDestroy, OnGenericTableHandler {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _formBuilder = inject(FormBuilder);
  private _customRouterService = inject(CustomRouterService);
  private _schoolSiteService = inject(SchoolSiteService);

  // Formulario para el buscador
  searchForm: FormGroup;

  // Loading
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
    pageSizeOptions: [10, 15, 25],
    addButtonShow: false,
    length: 0,
    fullScreen: true,
  };

  constructor(
    public dialogRef: MatDialogRef<SitesModalComponent>,
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
            // Formatear el rango de fechas de funcionamiento
            if (site.operatingFromDate && site.operatingToDate) {
              const fromDate = new Date(site.operatingFromDate);
              const toDate = new Date(site.operatingToDate);
              const formattedFrom = fromDate.toLocaleDateString('es-PR', { year: 'numeric', month: '2-digit', day: '2-digit' });
              const formattedTo = toDate.toLocaleDateString('es-PR', { year: 'numeric', month: '2-digit', day: '2-digit' });
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
          console.error('Error al obtener sitios de la escuela:', error);
          // Fallback a datos pasados por el modal si hay error
          const fallbackData = (this.data.data || []).map((site: SchoolSiteTableResponse) => {
            if (site.operatingFromDate && site.operatingToDate) {
              const fromDate = new Date(site.operatingFromDate);
              const toDate = new Date(site.operatingToDate);
              const formattedFrom = fromDate.toLocaleDateString('es-PR', { year: 'numeric', month: '2-digit', day: '2-digit' });
              const formattedTo = toDate.toLocaleDateString('es-PR', { year: 'numeric', month: '2-digit', day: '2-digit' });
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

  /**
   * Determina la ruta de navegación basada en el programa de la agencia
   * @returns 'sites-psav' si la agencia está en PSAV, 'sites-pdam' por defecto
   */
  private getTargetRoute(): string {
    const programsRaw = localStorage.getItem('agencyPrograms');
    let targetRoute = 'sites-pdam'; // Default

    if (programsRaw) {
      try {
        const programs = JSON.parse(programsRaw);
        const isPSAV = programs.some((p: any) => p?.id === PROGRAM_IDS.PSAV);
        if (isPSAV) {
          targetRoute = 'sites-psav';
        }
      } catch {
        // Si hay error de parsing, usar ruta por defecto
      }
    }

    return targetRoute;
  }

  // Implementación de OnGenericTableHandler
  onTableEdit(event: Event, id: number): void {
    event.stopPropagation();
    event.preventDefault();

    // Buscar el elemento para obtener el siteId (el id recibido es el ID de la relación SchoolSite)
    const element = this.tableConfig.dataSourceList.find(item => item.id === id);
    const siteId = element?.siteId || id; // Fallback al id si no se encuentra

    this.dialogRef.close();
    const targetRoute = this.getTargetRoute();
    this._customRouterService.navigate([`${targetRoute}/edit/${siteId}`]);
  }

  onTableDelete(event: Event, id: number): void {
    // Por ahora no implementamos eliminación desde el modal
    console.log('Delete site:', id);
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

    // Buscar el elemento para obtener el siteId (el id recibido es el ID de la relación SchoolSite)
    const element = this.tableConfig.dataSourceList.find(item => item.id === id);
    const siteId = element?.siteId || id; // Fallback al id si no se encuentra

    this.dialogRef.close();
    const targetRoute = this.getTargetRoute();
    this._customRouterService.navigate([`${targetRoute}/calendar/${siteId}`]);
  }

  onClearSearch(): void {
    this.searchForm.get('search')?.setValue('');
    this.getAll(0, this.searchForm.value);
  }

  onAddButtonClick(event?: Event): void {
    // Cerrar el modal y navegar a la ruta correcta según el programa con schoolId como query parameter
    this.dialogRef.close();
    const targetRoute = this.getTargetRoute();
    this._customRouterService.navigate([`${targetRoute}/add`], {
      queryParams: { schoolId: this.data.schoolId }
    });
  }

  closeModal(): void {
    this.dialogRef.close();
  }
}
