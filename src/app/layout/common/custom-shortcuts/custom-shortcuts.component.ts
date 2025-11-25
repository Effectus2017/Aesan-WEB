import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@ngneat/transloco';
import { AgencyService } from 'app/shared/services/agency.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { AuthService } from 'app/core/auth/auth.service';
import { Subject } from 'rxjs';

@Component({
    selector       : 'custom-shortcuts',
    templateUrl    : './custom-shortcuts.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs       : 'customShortcuts',
    standalone     : true,
    imports        : [MatButtonModule, MatIconModule, MatTooltipModule, TranslocoModule],
})
export class CustomShortcutsComponent implements OnInit, OnDestroy
{
    @ViewChild('customShortcutsOrigin') private _customShortcutsOrigin: MatButton;
    @ViewChild('customShortcutsPanel') private _customShortcutsPanel: TemplateRef<any>;

    sending: boolean = false;
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
     * Send test message using template
     */
    sendTestMessage(): void
    {
        if (this.sending) return;

        // Obtener la agencia del usuario actual logueado
        const agencyId = this._authService.getAgencyId();
        
        if (!agencyId) {
            console.error('No se pudo obtener el AgencyId del usuario actual');
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
