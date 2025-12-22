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
    selector: 'agency-code-banner',
    templateUrl: './agency-code-banner.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgIf, MatIconModule, MatTooltipModule]
})
export class AgencyCodeBannerComponent implements OnInit, OnDestroy {
    private _changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
    private _translocoService: TranslocoService = inject(TranslocoService);
    private _agencyService: AgencyService = inject(AgencyService);
    private _router: Router = inject(Router);
    private _unsubscribeAll: Subject<void> = new Subject<void>();

    agencyCode: string | null = null;
    showBanner: boolean = false;
    bannerText: string = '';
    tooltipText: string = '';
    codeIcon: string = 'mat_outline:badge';

    /**
     * Constructor
     */
    constructor() {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this._loadAgencyCode();

        // Subscribe to route changes
        this._router.events
            .pipe(
                filter(event => event instanceof NavigationEnd),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this._loadAgencyCode();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Carga el agencyCode de la agencia actual
     */
    private _loadAgencyCode(): void {
        // Suscribirse al observable de la agencia actual
        this._agencyService.agency$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
            if (!isNullOrUndefinedEmptyStringNullArray(result)) {
                const agency = result.body || result;
                if (agency && agency.agencyCode) {
                    this.agencyCode = agency.agencyCode;
                    this.showBanner = true;
                    this._updateBannerText();
                    this._updateTooltipText();
                } else {
                    this.showBanner = false;
                    this.agencyCode = null;
                }
            } else {
                this.showBanner = false;
                this.agencyCode = null;
            }

            this._changeDetectorRef.markForCheck();
        });
    }

    /**
     * Actualiza el texto del banner según el idioma activo
     */
    private _updateBannerText(): void {
        if (!this.agencyCode) {
            this.bannerText = '';
            return;
        }

        const params: any = { code: this.agencyCode };

        this._translocoService.selectTranslate('navigation.agencyCode.banner', params)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((translation) => {
                this.bannerText = translation;
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Actualiza el texto del tooltip según el idioma activo
     */
    private _updateTooltipText(): void {
        this._translocoService.selectTranslate('navigation.agencyCode.tooltip', { code: this.agencyCode })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((translation) => {
                this.tooltipText = translation;
                this._changeDetectorRef.markForCheck();
            });
    }
}

