import { AfterViewInit, Directive, ElementRef, Input, inject, OnDestroy, OnInit, Renderer2, NgZone } from '@angular/core';
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
 * <button mat-raised-button [appDisableIfAgencyRestricted]="true">
 *   Guardar
 * </button>
 * ```
 */
@Directive({
  selector: '[appDisableIfAgencyRestricted]',
  standalone: true,
})
export class DisableIfAgencyRestrictedDirective implements OnInit, AfterViewInit, OnDestroy {
  @Input() appDisableIfAgencyRestricted: boolean = true;

  private readonly _agencyStatusStorageService = inject(AgencyStatusStorageService);
  private readonly _elementRef = inject(ElementRef);
  private readonly _renderer = inject(Renderer2);
  private readonly _ngZone = inject(NgZone);
  private _mutationObserver?: MutationObserver;
  private _lastKnownStatus: boolean | null = null;
  private _checkInterval?: number;

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

    // Configurar verificación periódica para asegurar que el estado se mantenga
    this._setupPeriodicCheck();
  }

  ngOnDestroy(): void {
    if (this._mutationObserver) {
      this._mutationObserver.disconnect();
    }
    if (this._checkInterval) {
      clearInterval(this._checkInterval);
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
            // Cambio externo, verificar y forzar el estado correcto
            // Usar requestAnimationFrame para asegurar que se ejecute después de que Angular termine
            requestAnimationFrame(() => {
              this._checkAndDisable(true); // Forzar verificación
            });
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
   * Configura una verificación periódica para asegurar que el estado se mantenga
   * Esto es necesario porque Angular puede sobrescribir el disabled después de que la directiva lo establece
   * @private
   */
  private _setupPeriodicCheck(): void {
    // Verificar cada 100ms si la agencia está restringida y el botón está habilitado
    // Esto asegura que incluso si Angular sobrescribe el disabled, lo volveremos a establecer
    this._ngZone.runOutsideAngular(() => {
      this._checkInterval = window.setInterval(() => {
        const element = this._elementRef.nativeElement;
        const status = this._agencyStatusStorageService.getAgencyRestrictedStatus();

        if (status && (status.isCompleted || status.isExpired)) {
          // Si la agencia está restringida y el botón está habilitado, forzar deshabilitarlo
          if (!element.disabled) {
            this._ngZone.run(() => {
              this._checkAndDisable(true);
            });
          }
        }
      }, 100);
    });
  }

  /**
   * Verifica el estado de restricción de la agencia y deshabilita el elemento si es necesario
   * @param forceCheck Si es true, fuerza la verificación incluso si el estado no cambió
   * @private
   */
  private _checkAndDisable(forceCheck: boolean = false): void {
    // Si la directiva está deshabilitada, no hacer nada
    if (this.appDisableIfAgencyRestricted === false) {
      return;
    }

    const element = this._elementRef.nativeElement;
    const status = this._agencyStatusStorageService.getAgencyRestrictedStatus();

    // Si no hay datos, no hacer nada (no deshabilitar hasta tener datos válidos)
    if (!status) {
      return;
    }

    const isRestricted = status.isCompleted || status.isExpired;

    // Si no es un force check y el estado no cambió, verificar si necesitamos forzar
    if (!forceCheck && this._lastKnownStatus === isRestricted) {
      // Pero si la agencia está restringida y el botón está habilitado, forzar deshabilitarlo
      if (isRestricted && !element.disabled) {
        forceCheck = true;
      } else {
        return;
      }
    }

    this._lastKnownStatus = isRestricted;

    if (isRestricted) {
      // Deshabilitar el elemento SIEMPRE si está restringido
      // Angular Material aplica automáticamente los estilos de deshabilitado
      // cuando el atributo disabled está presente, no necesitamos agregar clases manualmente
      element.disabled = true;
      this._renderer.setProperty(element, 'disabled', true);
      this._renderer.setAttribute(element, 'disabled', 'true');
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
      }
    }
  }
}

