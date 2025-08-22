import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoService } from '@ngneat/transloco';
import { BehaviorSubject, Observable, Subject, takeUntil, filter } from 'rxjs';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AgencyService } from 'app/shared/services/agency.service';
import { AuthService } from 'app/core/auth/auth.service';
import { Agency } from 'app/shared/models/Agency';
import { isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';

@Component({
    selector: 'deadline-banner',
    templateUrl: './deadline-banner.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, MatIconModule, MatTooltipModule]
})
export class DeadlineBannerComponent implements OnInit, OnDestroy {
    private _changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
    private _translocoService: TranslocoService = inject(TranslocoService);
    private _agencyService: AgencyService = inject(AgencyService);
    private _authService: AuthService = inject(AuthService);
    private _snackBar: MatSnackBar = inject(MatSnackBar);
    private _fuseConfirmationService: FuseConfirmationService = inject(FuseConfirmationService);
    private _router: Router = inject(Router);
    private _activatedRoute: ActivatedRoute = inject(ActivatedRoute);
    private _unsubscribeAll: Subject<void> = new Subject<void>();

    daysRemaining: number | null = null;
    showBanner: boolean = false;
    bannerText: string = 'Cargando...';
    tooltipText: string = 'Cargando...';
    isUrgent: boolean = false;
    isExpired: boolean = false;
    isAdminPortal: boolean = false;

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
        this._checkCurrentRoute();
        this._loadAgencyData();

        // Subscribe to route changes
        this._router.events
            .pipe(
                filter(event => event instanceof NavigationEnd),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this._checkCurrentRoute();
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
     * Verifica si estamos en el portal de administrador
     */
    private _checkCurrentRoute(): void {
        const rootRoute = this._activatedRoute.snapshot.root;
        const childRoutes = rootRoute.children;

        if (childRoutes.length > 0) {
            const currentRoute = childRoutes[0].routeConfig?.path;
            this.isAdminPortal = currentRoute === 'admin-portal';
        } else {
            this.isAdminPortal = false;
        }

        // Recalcular la visibilidad del banner cuando cambia la ruta
        if (this.daysRemaining !== null) {
            this.showBanner = !this.isAdminPortal && (this.daysRemaining > 0 || this.isExpired);
            this._changeDetectorRef.markForCheck();
        }
    }

    /**
     * Carga los datos de la agencia y calcula los días restantes
     */
    private _loadAgencyData(): void {
        // Suscribirse al observable de la agencia actual
        this._agencyService.agency$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
            if (!isNullOrUndefinedEmptyStringNullArray(result)) {
                const agency = result.body;

                if (agency.deadlineToCompleteRegistration) {
                    this._calculateDaysRemaining(agency.deadlineToCompleteRegistration);
                } else {
                    this.showBanner = false;
                }
            }
            // Verificar la ruta actual después de cargar los datos de la agencia
            this._checkCurrentRoute();
        });
    }

    /**
     * Calcula los días restantes hasta la fecha límite
     */
    private _calculateDaysRemaining(deadlineDate: string): void {
        const deadline = new Date(deadlineDate);
        const now = new Date();

        // Reset time to start of day for accurate day calculation
        deadline.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);

        const timeDiff = deadline.getTime() - now.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        this.daysRemaining = daysDiff;
        this.isExpired = daysDiff <= 0; // Tiempo caducado cuando días <= 0
        this.isUrgent = daysDiff > 0 && daysDiff <= 3; // Rojo cuando quedan 3 días o menos (pero no caducado)

        // Mostrar el banner si no estamos en el portal de administrador y (quedan días O ha caducado)
        this.showBanner = !this.isAdminPortal && (daysDiff > 0 || this.isExpired);

        this._updateBannerText();
        this._updateTooltipText();
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Actualiza el texto del banner según el idioma activo
     */
    private _updateBannerText(): void {
        if (this.isExpired) {
            // Texto para tiempo caducado
            this._translocoService.selectTranslate('navigation.deadline.expired')
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((translation) => {
                    this.bannerText = translation;
                    this._changeDetectorRef.markForCheck();
                });
        } else {
            // Texto para días restantes
            this._translocoService.selectTranslate('navigation.deadline.daysRemaining', { days: this.daysRemaining })
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((translation) => {
                    this.bannerText = translation;
                    this._changeDetectorRef.markForCheck();
                });
        }
    }

    /**
     * Actualiza el texto del tooltip según el idioma activo
     */
    private _updateTooltipText(): void {
        if (this.isExpired) {
            // Tooltip para tiempo caducado
            this._translocoService.selectTranslate('navigation.deadline.tooltipExpired')
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((translation) => {
                    this.tooltipText = translation;
                    this._changeDetectorRef.markForCheck();
                });
        } else {
            // Tooltip para días restantes
            this._translocoService.selectTranslate('navigation.deadline.tooltip', { days: this.daysRemaining })
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((translation) => {
                    this.tooltipText = translation;
                    this._changeDetectorRef.markForCheck();
                });
        }
    }

    /**
     * Maneja el click en el banner
     */
    onBannerClick(): void {
        if (this.isExpired) {
            // Modal informativo para tiempo expirado - solo botón de cerrar
            this._fuseConfirmationService.open({
                title: this.bannerText,
                message: this.tooltipText,
                icon: {
                    show: true,
                    name: 'heroicons_outline:x-circle',
                    color: 'error'
                },
                actions: {
                    confirm: {
                        show: true,
                        label: this._translocoService.translate('navigation.deadline.understood'),
                        color: 'primary'
                    },
                    cancel: {
                        show: false
                    }
                },
                dismissible: true
            });
        } else {
            // Modal de confirmación para tiempo restante - botones aceptar/cancelar
            this._fuseConfirmationService.open({
                title: this.bannerText,
                message: this.tooltipText,
                icon: {
                    show: true,
                    name: 'heroicons_outline:exclamation-triangle',
                    color: 'warning'
                },
                actions: {
                    confirm: {
                        show: true,
                        label: this._translocoService.translate('navigation.deadline.confirm'),
                        color: 'primary'
                    },
                    cancel: {
                        show: true,
                        label: this._translocoService.translate('navigation.deadline.cancel')
                    }
                },
                dismissible: true
            }).afterClosed().subscribe((result) => {
                if (result === 'confirmed') {
                    // TODO: Implementar la lógica para marcar como completado
                    this._snackBar.open('Función de completar registro en desarrollo', 'Cerrar', {
                        duration: 3000,
                        horizontalPosition: 'center',
                        verticalPosition: 'top'
                    });
                }
            });
        }
    }

    /**
     * Método público para forzar la actualización del banner
     * Útil para testing y debugging
     */
    forceUpdate(): void {
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Método para testing - Simula diferentes estados del banner
     */
    simulateState(state: 'normal' | 'urgent' | 'expired'): void {
        switch (state) {
            case 'normal':
                this.daysRemaining = 10;
                this.isExpired = false;
                this.isUrgent = false;
                break;
            case 'urgent':
                this.daysRemaining = 2;
                this.isExpired = false;
                this.isUrgent = true;
                break;
            case 'expired':
                this.daysRemaining = -1;
                this.isExpired = true;
                this.isUrgent = false;
                break;
        }

        this.showBanner = !this.isAdminPortal && (this.daysRemaining > 0 || this.isExpired);
        this._updateBannerText();
        this._updateTooltipText();
        this._changeDetectorRef.markForCheck();
    }
}
