import { AfterViewInit, Directive, ElementRef, inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { AgencyStatusStorageService } from '../../services/agency-status-storage.service';

/**
 * Directiva de atributo que deshabilita un elemento (botón) cuando la agencia
 * tiene el registro completado o cuando la fecha límite ha expirado.
 *
 * Esta directiva lee los datos desde localStorage (codificados) y no se suscribe
 * a observables, mejorando el rendimiento.
 *
 * @example
 * ```html
 * <button mat-raised-button [appDisableIfAgencyRestricted]>
 *   Guardar
 * </button>
 * ```
 */
@Directive({
  selector: '[appDisableIfAgencyRestricted]',
  standalone: true,
})
export class DisableIfAgencyRestrictedDirective implements OnInit, AfterViewInit, OnDestroy {
  private readonly _agencyStatusStorageService = inject(AgencyStatusStorageService);
  private readonly _elementRef = inject(ElementRef);
  private readonly _renderer = inject(Renderer2);
  private _mutationObserver?: MutationObserver;
  private _lastKnownStatus: boolean | null = null;

  /**
   * Inicializa la directiva
   */
  ngOnInit(): void {
    // Log solo en desarrollo si es necesario para debugging
    // console.log('[DisableIfAgencyRestrictedDirective] ngOnInit - Directiva inicializada');
  }

  /**
   * Se ejecuta después de que la vista se haya inicializado
   * Usamos esto para asegurarnos de que Angular Material haya procesado los bindings
   */
  ngAfterViewInit(): void {
    // Ejecutar inmediatamente
    this._checkAndDisable();

    // Usar MutationObserver solo para detectar cambios externos en disabled
    // (no los que nosotros mismos hacemos)
    this._setupMutationObserver();
  }

  ngOnDestroy(): void {
    if (this._mutationObserver) {
      this._mutationObserver.disconnect();
    }
  }

  /**
   * Configura un MutationObserver para detectar cambios externos en el atributo disabled
   * Solo reacciona si el cambio no fue hecho por esta directiva
   * @private
   */
  private _setupMutationObserver(): void {
    const element = this._elementRef.nativeElement;

    this._mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'disabled') {
          // Solo verificar si el cambio no fue hecho por esta directiva
          const disabledByDirective = element.getAttribute('data-disabled-by-agency-restriction');
          if (disabledByDirective !== 'true') {
            // Cambio externo, verificar si necesitamos forzarlo
            setTimeout(() => {
              this._checkAndDisable();
            }, 0);
          }
        }
      });
    });

    this._mutationObserver.observe(element, {
      attributes: true,
      attributeFilter: ['disabled']
    });
  }

  /**
   * Verifica el estado de restricción de la agencia y deshabilita el elemento si es necesario
   * Solo actualiza si el estado cambió para evitar operaciones innecesarias
   * @private
   */
  private _checkAndDisable(): void {
    const element = this._elementRef.nativeElement;
    const status = this._agencyStatusStorageService.getAgencyRestrictedStatus();

    // Si no hay datos, no hacer nada (no deshabilitar hasta tener datos válidos)
    if (!status) {
      return;
    }

    const isRestricted = status.isCompleted || status.isExpired;

    // Optimización: solo actualizar si el estado cambió
    if (this._lastKnownStatus === isRestricted) {
      return;
    }

    this._lastKnownStatus = isRestricted;

    if (isRestricted) {
      // Deshabilitar el elemento
      element.disabled = true;
      this._renderer.setProperty(element, 'disabled', true);
      this._renderer.setAttribute(element, 'disabled', 'true');
      this._renderer.addClass(element, 'mat-button-disabled');
      this._renderer.setAttribute(
        element,
        'data-disabled-by-agency-restriction',
        'true'
      );
    } else {
      // Solo remover el disabled si fue establecido por esta directiva
      const disabledByDirective = element.getAttribute('data-disabled-by-agency-restriction');
      if (disabledByDirective === 'true') {
        this._renderer.setProperty(element, 'disabled', false);
        this._renderer.removeAttribute(element, 'disabled');
        this._renderer.removeAttribute(element, 'data-disabled-by-agency-restriction');
        this._renderer.removeClass(element, 'mat-button-disabled');
      }
    }
  }
}

