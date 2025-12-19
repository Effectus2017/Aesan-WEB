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
    selector: 'current-program-banner',
    templateUrl: './current-program-banner.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgIf, MatIconModule, MatTooltipModule]
})
export class CurrentProgramBannerComponent implements OnInit, OnDestroy {
    private _changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
    private _translocoService: TranslocoService = inject(TranslocoService);
    private _agencyService: AgencyService = inject(AgencyService);
    private _router: Router = inject(Router);
    private _unsubscribeAll: Subject<void> = new Subject<void>();

    currentProgram: string | null = null;
    completedRegistrationDate: string | null = null;
    showBanner: boolean = false;
    bannerText: string = '';
    tooltipText: string = '';
    programIcon: string = 'mat_outline:domain';

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
        this._loadCurrentProgram();

        // Subscribe to route changes
        this._router.events
            .pipe(
                filter(event => event instanceof NavigationEnd),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this._loadCurrentProgram();
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
     * Carga el programa actual de la agencia
     */
    private _loadCurrentProgram(): void {
        // Suscribirse al observable de la agencia actual
        this._agencyService.agency$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
            if (!isNullOrUndefinedEmptyStringNullArray(result)) {
                const agency = result.body || result;
                if (agency && agency.programs && agency.programs.length > 0) {
                    // Tomar el primer programa de la agencia
                    const firstProgram = agency.programs[0];
                    this.currentProgram = firstProgram.name;

                    // Extraer la fecha de completado de la inscripción
                    if (agency.inscription?.completedRegistrationDate) {
                        this.completedRegistrationDate = this._formatDate(agency.inscription.completedRegistrationDate);
                    } else {
                        this.completedRegistrationDate = null;
                    }

                    this.showBanner = true;
                    this._updateBannerText();
                    this._updateTooltipText();
                    this._updateProgramIcon();
                } else {
                    this.showBanner = false;
                    this.completedRegistrationDate = null;
                }
            } else {
                this.showBanner = false;
                this.completedRegistrationDate = null;
            }

            this._changeDetectorRef.markForCheck();
        });
    }

    /**
     * Actualiza el texto del banner según el idioma activo
     */
    private _updateBannerText(): void {
        const params: any = { program: this.currentProgram };

        // Determinar qué clave de traducción usar según si existe la fecha
        const translationKey = this.completedRegistrationDate
            ? 'navigation.currentProgram.programWithDate'
            : 'navigation.currentProgram.program';

        // Incluir la fecha de completado si existe
        if (this.completedRegistrationDate) {
            params.completedDate = this.completedRegistrationDate;
        }

        this._translocoService.selectTranslate(translationKey, params)
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
        this._translocoService.selectTranslate('navigation.currentProgram.tooltip', { program: this.currentProgram })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((translation) => {
                this.tooltipText = translation;
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Actualiza el icono según el programa
     */
    private _updateProgramIcon(): void {
        if (!this.currentProgram) {
            this.programIcon = 'mat_outline:domain';
            return;
        }

        switch (this.currentProgram.toUpperCase()) {
            case 'PDAM':
                this.programIcon = 'mat_outline:domain';
                break;
            case 'PSAV':
                this.programIcon = 'mat_outline:domain';
                break;
            case 'PACNA':
                this.programIcon = 'mat_outline:domain';
                break;
            case 'PFHF':
                this.programIcon = 'mat_outline:domain';
                break;
            case 'PAF':
                this.programIcon = 'mat_outline:domain';
                break;
            case 'PDFE':
                this.programIcon = 'mat_outline:domain';
                break;
            default:
                this.programIcon = 'mat_outline:domain';
                break;
        }
    }

    /**
     * Formatea la fecha en formato largo según el idioma activo
     * Ejemplo: "15 de octubre de 2025" (es) o "October 15, 2025" (en)
     */
    private _formatDate(dateString: string | null | undefined): string | null {
        if (!dateString) {
            return null;
        }

        try {
            const date = new Date(dateString);

            // Validar que la fecha sea válida
            if (isNaN(date.getTime())) {
                return null;
            }

            // Obtener el idioma actual
            const currentLang = this._translocoService.getActiveLang() || 'es';

            // Formatear la fecha según el idioma
            const formatter = new Intl.DateTimeFormat(currentLang === 'es' ? 'es-PR' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            return formatter.format(date);
        } catch (error) {
            console.error('Error formateando fecha:', error);
            return null;
        }
    }
}
