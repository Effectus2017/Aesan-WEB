import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import { BehaviorSubject, Observable, Subject, takeUntil, filter } from 'rxjs';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AgencyService } from 'app/shared/services/agency.service';
import { AuthService } from 'app/core/auth/auth.service';
import { Agency } from 'app/shared/models/Agency';
import { isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { DeadlineConfirmationDialogComponent } from './deadline-confirmation-dialog.component';

@Component({
    selector: 'deadline-banner',
    templateUrl: './deadline-banner.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgIf, MatIconModule, MatTooltipModule]
})
export class DeadlineBannerComponent implements OnInit, OnDestroy {
    private _changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
    private _translocoService: TranslocoService = inject(TranslocoService);
    private _agencyService: AgencyService = inject(AgencyService);
    private _authService: AuthService = inject(AuthService);
    private _snackBar: MatSnackBar = inject(MatSnackBar);
    private _dialog: MatDialog = inject(MatDialog);
    private _router: Router = inject(Router);
    private _activatedRoute: ActivatedRoute = inject(ActivatedRoute);
    private _unsubscribeAll: Subject<void> = new Subject<void>();

    daysRemaining: number | null = null;
    showBanner: boolean = false;
    bannerText: string = '';
    tooltipText: string = '';
    isUrgent: boolean = false;
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
            this.showBanner = !this.isAdminPortal && this.daysRemaining > 0;
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
        // Solo mostrar el banner si no estamos en el portal de administrador y quedan días
        this.showBanner = !this.isAdminPortal && daysDiff > 0;
        this.isUrgent = daysDiff <= 3; // Rojo cuando quedan 3 días o menos

        this._updateBannerText();
        this._updateTooltipText();
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Actualiza el texto del banner según el idioma activo
     */
    private _updateBannerText(): void {
        this._translocoService.selectTranslate('navigation.deadline.daysRemaining', { days: this.daysRemaining })
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
        this._translocoService.selectTranslate('navigation.deadline.tooltip', { days: this.daysRemaining })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((translation) => {
                this.tooltipText = translation;
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Maneja el click en el banner
     */
    onBannerClick(): void {
        const dialogRef = this._dialog.open(DeadlineConfirmationDialogComponent, {
            width: '400px',
            disableClose: false,
            autoFocus: false
        });

        dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result) {
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
