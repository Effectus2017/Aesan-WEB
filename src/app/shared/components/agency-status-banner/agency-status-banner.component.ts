import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoService } from '@ngneat/transloco';
import { Subject, takeUntil, filter } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { AgencyService } from 'app/shared/services/agency.service';
import { isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';

@Component({
    selector: 'agency-status-banner',
    templateUrl: './agency-status-banner.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgIf, MatIconModule, MatTooltipModule]
})
export class AgencyStatusBannerComponent implements OnInit, OnDestroy {
    private _changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
    private _translocoService: TranslocoService = inject(TranslocoService);
    private _agencyService: AgencyService = inject(AgencyService);
    private _router: Router = inject(Router);
    private _unsubscribeAll: Subject<void> = new Subject<void>();

    agencyStatus: number | null = null; // Ahora será el ID del status
    agencyStatusName: string | null = null; // Nombre del status para mostrar
    showBanner: boolean = false;
    bannerText: string = '';
    tooltipText: string = '';
    statusIcon: string = 'mat_outline:info';
    statusColor: string = 'blue';

    constructor() {}

    ngOnInit(): void {
        this.loadAgencyStatus();

        // Subscribe to route changes
        this._router.events
            .pipe(
                filter(event => event instanceof NavigationEnd),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this.loadAgencyStatus();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

        loadAgencyStatus(): void {
        // Suscribirse al observable de la agencia actual
        this._agencyService.agency$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
            if (!isNullOrUndefinedEmptyStringNullArray(result)) {
                const agency = result.body || result;



                if (agency && agency.status) {
                    // Usar el ID del status para la lógica interna y el nombre para mostrar
                    this.agencyStatus = agency.status.id;
                    this.agencyStatusName = agency.status.name; // Guardar el nombre para mostrar
                    this.showBanner = true;
                    this.updateBannerText();
                    this.updateTooltipText();
                    this.updateStatusIcon();
                    this.updateStatusColor();
                } else {
                    this.showBanner = false;
                }
            } else {
                this.showBanner = false;
            }

            this._changeDetectorRef.markForCheck();
        });
    }

    private updateBannerText(): void {
        this._translocoService.selectTranslate('navigation.agencyStatus.status', { status: this.agencyStatusName })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((translation) => {
                this.bannerText = translation;
                this._changeDetectorRef.markForCheck();
            });
    }

    private updateTooltipText(): void {
        this._translocoService.selectTranslate('navigation.agencyStatus.tooltip', { status: this.agencyStatusName })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((translation) => {
                this.tooltipText = translation;
                this._changeDetectorRef.markForCheck();
            });
    }

    private updateStatusIcon(): void {
        if (!this.agencyStatus) {
            this.statusIcon = 'mat_outline:info';
            return;
        }

        switch (this.agencyStatus) {
            case 1: // Pendiente de validar
                this.statusIcon = 'mat_outline:schedule';
                break;
            case 2: // Orientación
                this.statusIcon = 'mat_outline:school';
                break;
            case 3: // Visita Pre-operacional
                this.statusIcon = 'mat_outline:visibility';
                break;
            case 4: // No cumple con los requisitos
                this.statusIcon = 'mat_outline:error';
                break;
            case 5: // Cumple con los requisitos
                this.statusIcon = 'mat_outline:check_circle';
                break;
            case 6: // Rechazado
                this.statusIcon = 'mat_outline:cancel';
                break;
            case 7: // Aprobado
                this.statusIcon = 'mat_outline:verified';
                break;
            case 8: // Visita Inicial
                this.statusIcon = 'mat_outline:home';
                break;
            default:
                this.statusIcon = 'mat_outline:info';
                break;
        }
    }

    private updateStatusColor(): void {
        if (!this.agencyStatus) {
            this.statusColor = 'blue';
            return;
        }

        switch (this.agencyStatus) {
            case 1: // Pendiente de validar
                this.statusColor = 'yellow';
                break;
            case 2: // Orientación
                this.statusColor = 'blue';
                break;
            case 3: // Visita Pre-operacional
                this.statusColor = 'purple';
                break;
            case 4: // No cumple con los requisitos
                this.statusColor = 'red';
                break;
            case 5: // Cumple con los requisitos
                this.statusColor = 'green';
                break;
            case 6: // Rechazado
                this.statusColor = 'red';
                break;
            case 7: // Aprobado
                this.statusColor = 'green';
                break;
            case 8: // Visita Inicial
                this.statusColor = 'indigo';
                break;
            default:
                this.statusColor = 'blue';
                break;
        }
    }
}
