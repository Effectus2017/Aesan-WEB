import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { fuseAnimations } from '@fuse/animations';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { NgFor } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { SharedModule } from 'app/shared/shared.module';
import { agencyDashboardCardsData, agencyDashboardTableData, rationsByMonthData, coordinatedVisitsData } from './columns-data';
import { GenericTableConfig, OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { AGENCY_DASHBOARD_COLUMNS_SCHEMA } from './columns-schema';
import { ActivatedRoute } from '@angular/router';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { AuthService } from 'app/core/auth/auth.service';
import { AgencyService } from 'app/shared/services/agency.service';
import { FuseConfigService } from '@fuse/services/config';
import { DateTime } from 'luxon';
import { Subject, takeUntil } from 'rxjs';
import { isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexResponsive,
  ApexTheme,
  ApexTitleSubtitle,
  ApexXAxis,
  ApexYAxis
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  legend: ApexLegend;
  title: ApexTitleSubtitle;
  labels: string[];
  colors: string[];
  theme: ApexTheme;
};

export type PieChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  dataLabels: ApexDataLabels;
  colors: string[];
  legend: ApexLegend;
  title: ApexTitleSubtitle;
  theme: ApexTheme;
};

@Component({
    selector: 'agency-dashboard-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    imports: [CommonModule,
        MatTableModule, MatPaginatorModule, MatSortModule, MatButtonModule, MatIconModule, MatMenuModule, NgFor, TranslocoModule,
        SharedModule,
        GenericHeaderComponent,
        GenericTableComponent,
        NgApexchartsModule]
})
export class AgencyDashboardListComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers, OnGenericTableHandler {
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _authService = inject(AuthService);
  private _translocoService = inject(TranslocoService);
  private _route = inject(ActivatedRoute);
  private _agencyService = inject(AgencyService);
  private _fuseConfigService = inject(FuseConfigService);
  private _unsubscribeAll = new Subject<void>();
  private _destroyed = false;

  @ViewChildren(ChartComponent) private _chartComponents!: QueryList<ChartComponent>;

  agencyDashboardCardsData = [...agencyDashboardCardsData];
  userName = 'Usuario';
  currentDate = '';
  agencyCode: string | null = null;

  // Configuración del header
  headerConfig: GenericHeaderConfig = {
    title: 'agency.dashboard.welcome',
    agency: this.userName,
    subtitle: '',
  };

  // Configuración del gráfico de barras horizontales (Raciones por mes)
  rationsChartOptions: Partial<ChartOptions> = {
    series: [
      {
        name: 'Raciones',
        data: rationsByMonthData.map(item => item.value)
      }
    ],
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: false
      },
      background: 'transparent'
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        dataLabels: {
          position: 'center'
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => val.toString()
    },
    xaxis: {
      categories: [], // Se llenará dinámicamente con traducciones
      min: 0,
      max: 200,
      tickAmount: 4,
      labels: {
        style: {
          colors: '#64748B'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: (val: number) => val.toString(),
        style: {
          colors: '#64748B'
        }
      }
    },
    colors: ['#00BCD4'],
    theme: {
      mode: 'light'
    },
    title: {
      text: 'agency.dashboard.charts.rationsByMonth',
      align: 'left',
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: ''
      }
    }
  };

  // Configuración del gráfico de pie (Visitas coordinadas)
  visitsChartOptions: Partial<PieChartOptions> = {
    series: coordinatedVisitsData.map(item => item.value),
    chart: {
      type: 'pie',
      height: 350,
      background: 'transparent'
    },
    labels: [], // Se llenará dinámicamente con traducciones
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`
    },
    colors: ['#00BCD4', '#0097A7'],
    legend: {
      position: 'bottom',
      labels: {
        colors: '#64748B'
      }
    },
    theme: {
      mode: 'light'
    },
    title: {
      text: 'agency.dashboard.charts.coordinatedVisits',
      align: 'left',
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: ''
      }
    }
  };

  // Configuración de la tabla de formularios
  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<any>(),
    dataSourceList: [],
    columnsSchema: AGENCY_DASHBOARD_COLUMNS_SCHEMA,
    displayedColumns: AGENCY_DASHBOARD_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 25,
    pageSizeOptions: [25, 50, 100],
    length: 0,
  };

  constructor() {}

  ngOnInit() {
    // Obtener nombre del usuario
    const userData = this._authService.getUserDataFromToken();
    if (userData) {
      // Combinar name y lastName si están disponibles
      const nameParts = [];
      if (userData.name) {
        nameParts.push(userData.name);
      }
      if (userData.lastName) {
        nameParts.push(userData.lastName);
      }
      this.userName = nameParts.length > 0 ? nameParts.join(' ') : 'Usuario';
    }

    // Actualizar headerConfig con el nombre del usuario
    this.headerConfig.agency = this.userName;
    
    // Cargar agencyCode de la agencia
    this._loadAgencyCode();
    
    // Formatear y actualizar fecha según el idioma activo
    this._updateDate();

    // Suscribirse a cambios de idioma para actualizar todos los elementos traducibles
    this._updateTranslationsOnLangChange();

    // Traducir títulos de los gráficos
    this._translocoService.selectTranslate('agency.dashboard.charts.rationsByMonth')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(translation => {
        if (this._destroyed) return;
        if (this.rationsChartOptions.title) {
          this.rationsChartOptions.title.text = translation;
          this._changeDetectorRef.detectChanges();
        }
      });

    this._translocoService.selectTranslate('agency.dashboard.charts.coordinatedVisits')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(translation => {
        if (this._destroyed) return;
        if (this.visitsChartOptions.title) {
          this.visitsChartOptions.title.text = translation;
          this._changeDetectorRef.detectChanges();
        }
      });

    // Traducir meses del gráfico de raciones
    this._updateRationsChartLabels();
    
    // Traducir tipos de visita del gráfico de pie
    this._updateVisitsChartLabels();

    // Inicializar datos de la tabla de formularios
    this.tableConfig.dataSource.data = agencyDashboardTableData;
    this.tableConfig.length = agencyDashboardTableData.length;

    // Obtener datos del dashboard desde el resolver
    const dashboardData = this._route.snapshot.data['dashboard'];
    console.log('Dashboard data from resolver:', dashboardData);

    if (dashboardData) {
      this.updateDashboardCards(dashboardData);
    } else {
      console.warn('No dashboard data found in resolver');
    }

    // Suscribirse a cambios de tema para actualizar los gráficos
    // Esto también inicializará el tema correctamente
    this._subscribeToThemeChanges();

    this._changeDetectorRef.detectChanges();
  }

  /**
   * Carga el agencyCode de la agencia actual
   */
  private _loadAgencyCode(): void {
    this._agencyService.agency$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (this._destroyed) return;
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        const agency = result.body || result;
        if (agency && agency.agencyCode) {
          this.agencyCode = agency.agencyCode;
        } else {
          this.agencyCode = null;
        }
        // Actualizar el subtítulo con el agencyCode
        this._updateSubtitle();
        this._changeDetectorRef.detectChanges();
      }
    });
  }

  /**
   * Actualiza la fecha formateada según el idioma activo
   */
  private _updateDate(): void {
    const now = DateTime.now();
    const currentLang = this._translocoService.getActiveLang() || 'es';
    const locale = currentLang === 'es' ? 'es-PR' : 'en-US';
    
    // Formatear fecha usando Intl.DateTimeFormat para respetar el idioma
    const formatter = new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    this.currentDate = formatter.format(now.toJSDate());

    // Actualizar el subtítulo con la fecha y el agencyCode
    this._updateSubtitle();
  }

  /**
   * Actualiza el subtítulo del header con la fecha
   */
  private _updateSubtitle(): void {
    this._translocoService.selectTranslate('agency.dashboard.today')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((todayTranslation) => {
        if (this._destroyed) return;
        this.headerConfig.subtitle = `${todayTranslation} ${this.currentDate}`;
        this._changeDetectorRef.detectChanges();
      });
  }

  /**
   * Actualiza las etiquetas del gráfico de raciones con traducciones
   */
  private _updateRationsChartLabels(): void {
    this._translocoService.selectTranslateObject('agency.dashboard.months')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(translations => {
        if (this._destroyed) return;
        if (this.rationsChartOptions.xaxis) {
          this.rationsChartOptions.xaxis.categories = rationsByMonthData.map(item => 
            translations[item.monthKey] || item.monthKey
          );
          this._changeDetectorRef.detectChanges();
        }
      });
  }

  /**
   * Actualiza las etiquetas del gráfico de visitas con traducciones
   */
  private _updateVisitsChartLabels(): void {
    this._translocoService.selectTranslateObject('agency.dashboard.visitTypes')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(translations => {
        if (this._destroyed) return;
        this.visitsChartOptions.labels = coordinatedVisitsData.map(item => 
          translations[item.nameKey] || item.nameKey
        );
        this._changeDetectorRef.detectChanges();
      });
  }

  /**
   * Actualiza todos los elementos traducibles cuando cambia el idioma
   */
  private _updateTranslationsOnLangChange(): void {
    this._translocoService.langChanges$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this._updateDate();
        this._updateRationsChartLabels();
        this._updateVisitsChartLabels();
      });
  }

  /**
   * Suscribe a los cambios de tema y actualiza los gráficos
   */
  private _subscribeToThemeChanges(): void {
    this._fuseConfigService.config$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((config) => {
        if (this._destroyed) return;
        const isDarkMode = config.scheme === 'dark';
        this._updateChartThemes(isDarkMode);
      });
  }

  /**
   * Actualiza los temas de los gráficos según el modo oscuro/claro
   */
  private _updateChartThemes(isDarkMode: boolean): void {
    if (this._destroyed) return;
    const themeMode = isDarkMode ? 'dark' : 'light';
    const textColor = isDarkMode ? '#FFFFFF' : '#1E293B';
    const axisColor = isDarkMode ? '#94A3B8' : '#64748B';

    // Actualizar gráfico de raciones
    if (this.rationsChartOptions) {
      this.rationsChartOptions.theme = { mode: themeMode };
      if (this.rationsChartOptions.chart) {
        this.rationsChartOptions.chart.background = 'transparent';
      }
      if (this.rationsChartOptions.title?.style) {
        this.rationsChartOptions.title.style.color = textColor;
      }
      if (this.rationsChartOptions.xaxis?.labels?.style) {
        this.rationsChartOptions.xaxis.labels.style.colors = axisColor;
      }
      if (this.rationsChartOptions.yaxis?.labels?.style) {
        this.rationsChartOptions.yaxis.labels.style.colors = axisColor;
      }
      // Crear nueva referencia para forzar actualización
      this.rationsChartOptions = { ...this.rationsChartOptions };
    }

    // Actualizar gráfico de visitas
    if (this.visitsChartOptions) {
      this.visitsChartOptions.theme = { mode: themeMode };
      if (this.visitsChartOptions.chart) {
        this.visitsChartOptions.chart.background = 'transparent';
      }
      if (this.visitsChartOptions.title?.style) {
        this.visitsChartOptions.title.style.color = textColor;
      }
      if (this.visitsChartOptions.legend?.labels) {
        this.visitsChartOptions.legend.labels.colors = axisColor;
      }
      // Crear nueva referencia para forzar actualización
      this.visitsChartOptions = { ...this.visitsChartOptions };
    }

    // Forzar actualización de los gráficos
    this._changeDetectorRef.detectChanges();
  }

  /**
   * Actualiza las cards del dashboard con los datos del resolver
   */
  private updateDashboardCards(dashboardData: any): void {
    if (this._destroyed) return;
    console.log('Updating dashboard cards with data:', dashboardData);

    // Crear un nuevo array con las cards actualizadas para asegurar que Angular detecte los cambios
    this.agencyDashboardCardsData = this.agencyDashboardCardsData.map(card => {
      if (card.id === 'totalEscuelas') {
        if (dashboardData.totalSchools !== undefined && dashboardData.totalSchools !== null) {
          return { ...card, value: dashboardData.totalSchools.toString() };
        }
      } else if (card.id === 'totalSitios') {
        if (dashboardData.totalSites !== undefined && dashboardData.totalSites !== null) {
          return { ...card, value: dashboardData.totalSites.toString() };
        }
      }
      return card;
    });

    console.log('Updated agencyDashboardCardsData:', this.agencyDashboardCardsData);

    // Forzar detección de cambios después de actualizar las cards
    this._changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    this._destroyed = true;
    this._chartComponents?.forEach((chart) => {
      try {
        chart.destroy();
      } catch {
        // Ignorar si el gráfico ya está destruido
      }
    });
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  onAdd(): void {}

  onView(row: any): void {
    // Implementar acción de ver
    console.log('Ver formulario:', row);
  }

  onEdit(row: any): void {
    // Implementar acción de editar
    console.log('Editar formulario:', row);
  }

  // Implementación de OnGenericTableHandler
  onTableEdit(event: Event, id: any): void {
    const row = this.tableConfig.dataSource.data.find((item: any) => item.id === id || item.formNumber === id);
    if (row) {
      this.onEdit(row);
    }
  }

  onTableAction(event: Event, action: string, id: any): void {
    const row = this.tableConfig.dataSource.data.find((item: any) => item.id === id || item.formNumber === id);
    if (row) {
      if (action === 'view') {
        this.onView(row);
      } else if (action === 'edit') {
        this.onEdit(row);
      }
    }
  }
}
