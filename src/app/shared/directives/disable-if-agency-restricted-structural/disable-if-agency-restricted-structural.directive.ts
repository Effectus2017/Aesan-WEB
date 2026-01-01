import { Directive, ElementRef, inject, OnInit, Renderer2 } from '@angular/core';
import { AgencyStatusStorageService } from '../../services/agency-status-storage.service';

/**
 * Directiva estructural que deshabilita un elemento (botón) cuando la agencia
 * tiene el registro completado o cuando la fecha límite ha expirado.
 *
 * Esta directiva lee los datos desde localStorage (hasheados) y no se suscribe
 * a observables, mejorando el rendimiento.
 *
 * @example
 * ```html
 * <button mat-raised-button *appDisableIfAgencyRestrictedStructural>
 *   Guardar
 * </button>
 * ```
 */
@Directive({
  selector: '[appDisableIfAgencyRestrictedStructural]',
  standalone: true,
})
export class DisableIfAgencyRestrictedStructuralDirective implements OnInit {
  private readonly _agencyStatusStorageService = inject(AgencyStatusStorageService);
  private readonly _elementRef = inject(ElementRef);
  private readonly _renderer = inject(Renderer2);

  /**
   * Inicializa la directiva y verifica el estado de la agencia
   */
  ngOnInit(): void {
    this._checkAndDisable();
  }

  /**
   * Verifica el estado de restricción de la agencia y deshabilita el elemento si es necesario
   * @private
   */
  private _checkAndDisable(): void {
    const status = this._agencyStatusStorageService.getAgencyRestrictedStatus();
    
    // Si no hay datos, no hacer nada (no deshabilitar hasta tener datos válidos)
    if (!status) {
      return;
    }

    const isRestricted = status.isCompleted || status.isExpired;

    if (isRestricted) {
      // Deshabilitar el elemento
      this._renderer.setAttribute(
        this._elementRef.nativeElement,
        'disabled',
        'true'
      );
      // Agregar atributo de datos para identificar que fue deshabilitado por esta directiva
      this._renderer.setAttribute(
        this._elementRef.nativeElement,
        'data-disabled-by-agency-restriction',
        'true'
      );
    } else {
      // Solo remover el disabled si fue establecido por esta directiva
      const disabledByDirective = this._elementRef.nativeElement.getAttribute(
        'data-disabled-by-agency-restriction'
      );
      if (disabledByDirective === 'true') {
        this._renderer.removeAttribute(this._elementRef.nativeElement, 'disabled');
        this._renderer.removeAttribute(
          this._elementRef.nativeElement,
          'data-disabled-by-agency-restriction'
        );
      }
    }
  }
}

