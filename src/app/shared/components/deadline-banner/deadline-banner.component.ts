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
import { AgencyResponse } from 'app/shared/models/agency/AgencyResponse';
import { isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { NotificationService } from 'app/shared/services/notification.service';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';

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
    private _notificationService: NotificationService = inject(NotificationService);
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

        console.log('[DeadlineBanner] Route check:', {
            isAdminPortal: this.isAdminPortal,
            daysRemaining: this.daysRemaining,
            isExpired: this.isExpired
        });

        // Recalcular la visibilidad del banner cuando cambia la ruta
        if (this.daysRemaining !== null) {
            this.showBanner = !this.isAdminPortal && (this.daysRemaining > 0 || this.isExpired);
            console.log('[DeadlineBanner] Banner visibility after route check:', this.showBanner);
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
                const agency = result.body || result;

                // Verificar si el registro ya está completado - si es así, ocultar el banner
                const completedRegistrationDate = agency?.inscription?.completedRegistrationDate;
                if (completedRegistrationDate) {
                    console.log('[DeadlineBanner] Registration already completed, hiding banner');
                    this.showBanner = false;
                    this._changeDetectorRef.markForCheck();
                    return;
                }

                // Buscar la fecha límite primero en inscription, luego en el nivel superior como fallback
                const deadlineDate = agency?.inscription?.deadlineToCompleteRegistration
                    || agency?.deadlineToCompleteRegistration;

                // Log para debugging
                console.log('[DeadlineBanner] Agency data:', {
                    hasAgency: !!agency,
                    hasInscription: !!agency?.inscription,
                    completedRegistrationDate: completedRegistrationDate,
                    deadlineFromInscription: agency?.inscription?.deadlineToCompleteRegistration,
                    deadlineFromAgency: agency?.deadlineToCompleteRegistration,
                    finalDeadline: deadlineDate
                });

                if (deadlineDate) {
                    this._calculateDaysRemaining(deadlineDate);
                } else {
                    console.log('[DeadlineBanner] No deadline date found, hiding banner');
                    this.showBanner = false;
                    this._changeDetectorRef.markForCheck();
                }
            } else {
                console.log('[DeadlineBanner] No agency data available');
                this.showBanner = false;
                this._changeDetectorRef.markForCheck();
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

        // Validar que la fecha sea válida
        if (isNaN(deadline.getTime())) {
            console.error('[DeadlineBanner] Invalid deadline date:', deadlineDate);
            this.showBanner = false;
            this._changeDetectorRef.markForCheck();
            return;
        }

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

        console.log('[DeadlineBanner] Calculated days:', {
            deadlineDate,
            daysRemaining: daysDiff,
            isExpired: this.isExpired,
            isUrgent: this.isUrgent,
            isAdminPortal: this.isAdminPortal,
            showBanner: this.showBanner
        });

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
            // Usa las traducciones de confirmación con mensaje más resumido
            this._fuseConfirmationService.open({
                title: this._translocoService.translate('navigation.deadline.confirmation.title', { days: this.daysRemaining }),
                message: this._translocoService.translate('navigation.deadline.confirmation.message'),
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
                    this._completeRegistration();
                }
            });
        }
    }

    /**
     * Completa el registro de la agencia usando la misma lógica que el botón de completar en accesos rápidos
     */
    private _completeRegistration(): void {
        // Obtener la agencia del usuario actual logueado
        const agencyId = this._authService.getAgencyId();

        if (!agencyId) {
            console.error('[DeadlineBanner] No se pudo obtener el AgencyId del usuario actual');
            this._notificationService.showErrorDialog('dialog.error.messageSendError');
            return;
        }

        console.log('[DeadlineBanner] AgencyId obtenido del usuario:', agencyId);

        // Usar formato ISO para la fecha (el backend lo parsea automáticamente)
        const now = new Date();
        const queryParameters: QueryParameters = {
            AgencyId: agencyId,
            CompletedRegistrationDate: now.toISOString()
        };

        console.log('[DeadlineBanner] Enviando request con parámetros:', queryParameters);

        this._agencyService.updateCompletedRegistrationDate(queryParameters).subscribe({
            next: (response) => {
                console.log('[DeadlineBanner] Respuesta exitosa:', response);
                this._notificationService.showSuccessDialog('dialog.success.messageSent');
                // Ocultar el banner después de completar
                this.showBanner = false;
                this._changeDetectorRef.markForCheck();
                // Recargar los datos de la agencia para actualizar el estado
                this._loadAgencyData();
            },
            error: (error) => {
                console.error('[DeadlineBanner] Error al completar registro:', error);
                console.error('[DeadlineBanner] Error details:', {
                    status: error.status,
                    statusText: error.statusText,
                    message: error.message,
                    error: error.error
                });
                const errorMessage = error.error?.message || error.message || 'Error desconocido';
                this._notificationService.showErrorDialog('dialog.error.messageSendError');
            },
        });
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
