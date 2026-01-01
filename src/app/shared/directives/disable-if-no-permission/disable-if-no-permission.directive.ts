import { AfterViewInit, Directive, ElementRef, inject, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';

/**
 * Directiva de atributo que deshabilita un elemento (botón) cuando el usuario
 * no tiene el permiso requerido.
 *
 * Esta directiva verifica permisos usando AuthService y deshabilita el elemento
 * cuando el usuario no tiene el permiso especificado.
 *
 * @example
 * ```html
 * <button mat-raised-button [appDisableIfNoPermission]="'site.create'">
 *   Agregar
 * </button>
 * ```
 */
@Directive({
  selector: '[appDisableIfNoPermission]',
  standalone: true,
})
export class DisableIfNoPermissionDirective implements OnInit, AfterViewInit, OnDestroy {
  @Input() appDisableIfNoPermission?: string;

  private readonly _authService = inject(AuthService);
  private readonly _elementRef = inject(ElementRef);
  private readonly _renderer = inject(Renderer2);
  private _mutationObserver?: MutationObserver;
  private _lastKnownHasPermission: boolean | null = null;

  /**
   * Inicializa la directiva
   */
  ngOnInit(): void {
    // Log solo en desarrollo si es necesario para debugging
    // console.log('[DisableIfNoPermissionDirective] ngOnInit - Directiva inicializada', {
    //   permission: this.appDisableIfNoPermission
    // });
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
          const disabledByDirective = element.getAttribute('data-disabled-by-permission');
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
   * Verifica el permiso y deshabilita el elemento si es necesario
   * Solo actualiza si el estado cambió para evitar operaciones innecesarias
   * @private
   */
  private _checkAndDisable(): void {
    const element = this._elementRef.nativeElement;

    // Si no hay permiso especificado, no hacer nada
    if (!this.appDisableIfNoPermission) {
      return;
    }

    // Verificar si el usuario tiene el permiso
    const hasPermission = this._authService.hasPermission(this.appDisableIfNoPermission);

    // Optimización: solo actualizar si el estado cambió
    if (this._lastKnownHasPermission === hasPermission) {
      return;
    }

    this._lastKnownHasPermission = hasPermission;

    // Si NO tiene el permiso, deshabilitar el elemento
    if (!hasPermission) {
      // Deshabilitar el elemento
      element.disabled = true;
      this._renderer.setProperty(element, 'disabled', true);
      this._renderer.setAttribute(element, 'disabled', 'true');
      this._renderer.addClass(element, 'mat-button-disabled');
      this._renderer.setAttribute(
        element,
        'data-disabled-by-permission',
        'true'
      );
    } else {
      // Solo remover el disabled si fue establecido por esta directiva
      const disabledByDirective = element.getAttribute('data-disabled-by-permission');
      if (disabledByDirective === 'true') {
        this._renderer.setProperty(element, 'disabled', false);
        this._renderer.removeAttribute(element, 'disabled');
        this._renderer.removeClass(element, 'mat-button-disabled');
        this._renderer.removeAttribute(
          element,
          'data-disabled-by-permission'
        );
      }
    }
  }
}

