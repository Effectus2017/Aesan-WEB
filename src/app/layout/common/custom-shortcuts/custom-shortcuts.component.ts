import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { AgencyService } from 'app/shared/services/agency.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { AuthService } from 'app/core/auth/auth.service';
import { isAgencyRole } from 'app/shared/constants/role-keys';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Subject, takeUntil, take } from 'rxjs';

@Component({
    selector       : 'custom-shortcuts',
    templateUrl    : './custom-shortcuts.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs       : 'customShortcuts',
    standalone     : true,
    imports        : [MatButtonModule, MatIconModule, MatTooltipModule, TranslocoModule, NgIf],
})
export class CustomShortcutsComponent implements OnInit, OnDestroy
{
    @ViewChild('customShortcutsOrigin') private _customShortcutsOrigin: MatButton;
    @ViewChild('customShortcutsPanel') private _customShortcutsPanel: TemplateRef<any>;

    sending: boolean = false;
    showCompleteButton: boolean = false;
    isRegistrationCompleted: boolean = false;
    private _overlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef,
        private _agencyService: AgencyService,
        private _notificationService: NotificationService,
        private _authService: AuthService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _translocoService: TranslocoService,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Verificar visibilidad del botón Completar
        this._checkCompleteButtonVisibility();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();

        // Dispose the overlay
        if ( this._overlayRef )
        {
            this._overlayRef.dispose();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Open the shortcuts panel
     */
    openPanel(): void
    {
        // Return if the shortcuts panel or its origin is not defined
        if ( !this._customShortcutsPanel || !this._customShortcutsOrigin )
        {
            return;
        }

        // Create the overlay if it doesn't exist
        if ( !this._overlayRef )
        {
            this._createOverlay();
        }

        // Attach the portal to the overlay
        this._overlayRef.attach(new TemplatePortal(this._customShortcutsPanel, this._viewContainerRef));
    }

    /**
     * Close the shortcuts panel
     */
    closePanel(): void
    {
        this._overlayRef.detach();
    }

    /**
     * Muestra el modal de confirmación antes de completar el registro
     */
    sendTestMessage(): void
    {
        if (this.sending || this.isRegistrationCompleted) return;

        // Obtener los días restantes desde la agencia para el título del modal
        this._agencyService.agency$.pipe(take(1)).subscribe((result: any) => {
            if (result && result.body) {
                const agency = result.body;
                const deadlineDate = agency?.inscription?.deadlineToCompleteRegistration 
                    || agency?.deadlineToCompleteRegistration;
                
                let daysRemaining = 0;
                if (deadlineDate) {
                    const deadline = new Date(deadlineDate);
                    const now = new Date();
                    deadline.setHours(0, 0, 0, 0);
                    now.setHours(0, 0, 0, 0);
                    const timeDiff = deadline.getTime() - now.getTime();
                    daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
                }

                // Modal de confirmación para tiempo restante - botones aceptar/cancelar
                // Usa el mismo modal que el deadline-banner
                this._fuseConfirmationService.open({
                    title: this._translocoService.translate('navigation.deadline.confirmation.title', { days: daysRemaining }),
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
            } else {
                // Si no hay datos de agencia, usar título genérico
                this._fuseConfirmationService.open({
                    title: this._translocoService.translate('navigation.deadline.confirmation.title', { days: 0 }),
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
        });
    }

    /**
     * Completa el registro de la agencia
     * Método privado que contiene la lógica de completar el registro
     */
    private _completeRegistration(): void
    {
        if (this.sending) return;

        // Obtener la agencia del usuario actual logueado
        const agencyId = this._authService.getAgencyId();
        
        if (!agencyId) {
            console.error('[CustomShortcuts] No se pudo obtener el AgencyId del usuario actual');
            this._notificationService.showErrorDialog('dialog.error.messageSendError');
            return;
        }

        console.log('[CustomShortcuts] AgencyId obtenido del usuario:', agencyId);

        this.sending = true;
        this._changeDetectorRef.markForCheck();

        // Llamar al endpoint que usa templates
        // Usar formato ISO para la fecha (el backend lo parsea automáticamente)
        const now = new Date();
        const queryParameters: QueryParameters = {
            AgencyId: agencyId,
            CompletedRegistrationDate: now.toISOString()
        };

        console.log('[CustomShortcuts] Enviando request con parámetros:', queryParameters);
        console.log('[CustomShortcuts] URL completa será:', `/agency/update-completed-registration-date?AgencyId=${agencyId}&CompletedRegistrationDate=${now.toISOString()}`);

        this._agencyService.updateCompletedRegistrationDate(queryParameters).subscribe({
            next: (response) => {
                console.log('[CustomShortcuts] Respuesta exitosa:', response);
                this.sending = false;
                this._changeDetectorRef.markForCheck();
                this._notificationService.showSuccessDialog('dialog.success.messageSent');
                this.closePanel(); // Cerrar el panel después de enviar
                // Recargar la visibilidad del botón para actualizar el estado
                this._checkCompleteButtonVisibility();
            },
            error: (error) => {
                console.error('[CustomShortcuts] Error al completar registro:', error);
                console.error('[CustomShortcuts] Error details:', {
                    status: error.status,
                    statusText: error.statusText,
                    message: error.message,
                    error: error.error
                });
                this.sending = false;
                this._changeDetectorRef.markForCheck();
                const errorMessage = error.error?.message || error.message || 'Error desconocido';
                this._notificationService.showErrorDialog('dialog.error.messageSendError');
            },
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Check if the Complete button should be visible
     */
    private _checkCompleteButtonVisibility(): void
    {
        // Verificar el rol del usuario
        const userRole = this._authService.getUserRole();
        const isAgencyRoleUser = isAgencyRole(userRole);

        // Si no es rol de agencia, ocultar el botón
        if (!isAgencyRoleUser) {
            this.showCompleteButton = false;
            this._changeDetectorRef.markForCheck();
            return;
        }

        // Verificar si la agencia es NUTRE y si el registro ya está completado
        this._agencyService.agency$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
            if (result && result.body) {
                const agency = result.body;
                const isNutreAgency = agency && (
                    agency.id === 1 ||
                    agency.id === '1' ||
                    agency.id == 1 ||
                    (agency.name && agency.name.toLowerCase() === 'nutre')
                );

                // Verificar si el registro ya está completado
                const completedRegistrationDate = agency?.inscription?.completedRegistrationDate;
                this.isRegistrationCompleted = !!completedRegistrationDate;

                // Mostrar el botón solo si es rol de agencia Y la agencia NO es Nutre
                this.showCompleteButton = isAgencyRole && !isNutreAgency;
                this._changeDetectorRef.markForCheck();
            } else {
                // Si no hay información de agencia, ocultar el botón por seguridad
                this.showCompleteButton = false;
                this.isRegistrationCompleted = false;
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    /**
     * Create the overlay
     */
    private _createOverlay(): void
    {
        // Create the overlay
        this._overlayRef = this._overlay.create({
            hasBackdrop     : true,
            backdropClass   : 'fuse-backdrop-on-mobile',
            scrollStrategy  : this._overlay.scrollStrategies.block(),
            positionStrategy: this._overlay.position()
                .flexibleConnectedTo(this._customShortcutsOrigin._elementRef.nativeElement)
                .withLockedPosition(true)
                .withPush(true)
                .withPositions([
                    {
                        originX : 'start',
                        originY : 'bottom',
                        overlayX: 'start',
                        overlayY: 'top',
                    },
                    {
                        originX : 'start',
                        originY : 'top',
                        overlayX: 'start',
                        overlayY: 'bottom',
                    },
                    {
                        originX : 'end',
                        originY : 'bottom',
                        overlayX: 'end',
                        overlayY: 'top',
                    },
                    {
                        originX : 'end',
                        originY : 'top',
                        overlayX: 'end',
                        overlayY: 'bottom',
                    },
                ]),
        });

        // Detach the overlay from the portal on backdrop click
        this._overlayRef.backdropClick().subscribe(() =>
        {
            this._overlayRef.detach();
        });
    }
}
