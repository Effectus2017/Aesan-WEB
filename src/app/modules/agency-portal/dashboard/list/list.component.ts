import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { fuseAnimations } from '@fuse/animations';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { NgFor, NgIf } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { SharedModule } from 'app/shared/shared.module';
import { agencyDashboardCardsData, agencyDashboardTableData, rationsByMonthData, coordinatedVisitsData } from './columns-data';
import { GenericTableConfig } from 'app/shared/components/generic-table/generic-table.interface';
import { AGENCY_DASHBOARD_COLUMNS_SCHEMA } from './columns-schema';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AuthService } from 'app/core/auth/auth.service';
import { DateTime } from 'luxon';
import { Subject, takeUntil } from 'rxjs';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexResponsive,
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
};

export type PieChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  dataLabels: ApexDataLabels;
  colors: string[];
  legend: ApexLegend;
  title: ApexTitleSubtitle;
};

@Component({
    selector: 'agency-dashboard-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    imports: [CommonModule,
        MatTableModule, MatPaginatorModule, MatSortModule, MatButtonModule, MatIconModule, MatMenuModule, NgFor, NgIf, TranslocoModule,
        SharedModule,
        GenericTableComponent,
        GenericHeaderComponent,
        NgApexchartsModule]
})
export class AgencyDashboardListComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers {
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _authService = inject(AuthService);
  private _translocoService = inject(TranslocoService);
  private _unsubscribeAll = new Subject<void>();

  agencyDashboardCardsData = agencyDashboardCardsData;
  sponsorName = 'Nombre del Auspiciador';
  currentDate = '';

  // Configuración del header
  headerConfig: GenericHeaderConfig = {
    title: 'agency.dashboard.welcome',
    agency: this.sponsorName,
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
      }
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
      categories: rationsByMonthData.map(item => item.month),
      min: 0,
      max: 200,
      tickAmount: 4
    },
    yaxis: {
      labels: {
        formatter: (val: number) => val.toString()
      }
    },
    colors: ['#00BCD4'],
    title: {
      text: 'agency.dashboard.charts.rationsByMonth',
      align: 'left',
      style: {
        fontSize: '16px',
        fontWeight: 'bold'
      }
    }
  };

  // Configuración del gráfico de pie (Visitas coordinadas)
  visitsChartOptions: Partial<PieChartOptions> = {
    series: coordinatedVisitsData.map(item => item.value),
    chart: {
      type: 'pie',
      height: 350
    },
    labels: coordinatedVisitsData.map(item => item.name),
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`
    },
    colors: ['#00BCD4', '#0097A7'],
    legend: {
      position: 'bottom'
    },
    title: {
      text: 'agency.dashboard.charts.coordinatedVisits',
      align: 'left',
      style: {
        fontSize: '16px',
        fontWeight: 'bold'
      }
    }
  };

  // Configuración de la tabla
  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<any>(),
    dataSourceList: [],
    columnsSchema: AGENCY_DASHBOARD_COLUMNS_SCHEMA,
    displayedColumns: AGENCY_DASHBOARD_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 15,
    pageSizeOptions: [15, 50, 100],
    length: 0,
  };

  constructor() {}

  ngOnInit() {
    // Obtener nombre del auspiciador
    const userData = this._authService.getUserDataFromToken();
    if (userData && userData.agency) {
      this.sponsorName = userData.agency;
    }

    // Formatear fecha actual
    const now = DateTime.now();
    const days = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const dayName = days[now.weekday - 1];
    const monthName = months[now.month - 1];
    this.currentDate = `${dayName} ${now.day} de ${monthName} de ${now.year}`;

    // Actualizar headerConfig con el nombre del auspiciador
    this.headerConfig.agency = this.sponsorName;

    // Traducir títulos de los gráficos
    this._translocoService.selectTranslate('agency.dashboard.charts.rationsByMonth')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(translation => {
        if (this.rationsChartOptions.title) {
          this.rationsChartOptions.title.text = translation;
          this._changeDetectorRef.detectChanges();
        }
      });

    this._translocoService.selectTranslate('agency.dashboard.charts.coordinatedVisits')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(translation => {
        if (this.visitsChartOptions.title) {
          this.visitsChartOptions.title.text = translation;
          this._changeDetectorRef.detectChanges();
        }
      });

    // Inicializar datos de la tabla
    this.tableConfig.dataSource.data = agencyDashboardTableData;
    this.tableConfig.length = agencyDashboardTableData.length;

    this._changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
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
}
