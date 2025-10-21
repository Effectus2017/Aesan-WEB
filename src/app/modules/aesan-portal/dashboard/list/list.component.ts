import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { fuseAnimations } from '@fuse/animations';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { NgFor, NgIf } from '@angular/common';
import { TranslocoModule } from '@ngneat/transloco';
import { SharedModule } from 'app/shared/shared.module';
import { aesanDashboardCardsData } from './columns-data';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { ActivatedRoute } from '@angular/router';
import { AesanDashboardResponse } from 'app/shared/models/AesanDashboardResponse';
import { AesanDashboardService } from 'app/shared/services/aesan-dashboard.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'aesan-dashboard-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    imports: [CommonModule, NgIf, TranslocoModule, SharedModule, GenericHeaderComponent]
})
export class AesanDashboardListComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers {
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _route = inject(ActivatedRoute);
  private _aesanDashboardService = inject(AesanDashboardService);
  private _authService = inject(AuthService);

  aesanDashboardCardsData = aesanDashboardCardsData;

  // Datos del dashboard desde el resolver
  dashboardMetrics: AesanDashboardResponse = {
    agencyStatusCounts: {
      pendingValidationCount: 0,
      orientationCount: 0,
      approvedCount: 0,
      rejectedCount: 0
    },
    totalAgencies: 0,
    lastUpdated: new Date().toISOString()
  };

  // Datos del dashboard
  evaluatorName = 'Evaluadora Name'; // Obtener del servicio de auth

  // Configuración del header
  headerConfig: GenericHeaderConfig = {
    title: 'aesan.dashboard.welcome',
    agency: this.evaluatorName,
  };

  constructor() {}

  ngOnInit() {
    // Obtener datos del resolver
    const resolvedData = this._route.snapshot.data['data'];

    if (resolvedData) {
      this.dashboardMetrics = resolvedData;
    }

    this._changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {}

  onAdd(): void {}

  onCardClick(card: any): void {
    // Implementar navegación según el tipo de tarjeta
    console.log('Card clicked:', card);
  }
}
