import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  AfterViewInit,
  OnDestroy,
  inject,
  Renderer2,
} from '@angular/core';
import { KeyboardShortcutsService } from '../services/keyboard-shortcuts.service';
import {
  KeyboardShortcut,
  KeyboardShortcutConfig,
  KeyboardShortcutInput,
} from '../models/common/KeyboardShortcut';
import {
  formatShortcut,
  formatMultipleShortcuts,
  normalizeShortcutInput,
  generateShortcutId,
} from '../utils/keyboard-shortcuts';

/**
 * Directiva que permite activar botones con atajos de teclado personalizados.
 * Reemplaza la funcionalidad de enter-to-add-button.directive.ts con capacidades extendidas.
 *
 * @example
 * ```html
 * <!-- Shortcut simple -->
 * <button [appKeyboardShortcut]="'Enter'">Guardar</button>
 *
 * <!-- Shortcut con combinación -->
 * <button [appKeyboardShortcut]="{ key: 's', ctrl: true }">Guardar</button>
 *
 * <!-- Modo compatibilidad (busca botones con data-* attributes) -->
 * <div [appKeyboardShortcut]="null" [compatibilityMode]="true">
 *   <button data-add-button>Agregar</button>
 * </div>
 * ```
 */
@Directive({
  selector: '[appKeyboardShortcut]',
  standalone: true,
})
export class KeyboardShortcutDirective implements OnInit, AfterViewInit, OnDestroy {
  @Input() appKeyboardShortcut: KeyboardShortcutInput | null = null;
  @Input() shortcutLabel?: string;
  @Input() shortcutDescription?: string;
  @Input() shortcutCategory?: string;
  @Input() showInTooltip: boolean = true;
  @Input() showAsBadge: boolean = false;
  @Input() ignoreInputs: boolean = true;
  @Input() compatibilityMode: boolean = false;

  private readonly _elementRef = inject(ElementRef<HTMLElement>);
  private readonly _renderer = inject(Renderer2);
  private readonly _shortcutsService = inject(KeyboardShortcutsService);

  private _shortcutId?: string;
  private _badgeElement?: HTMLElement;
  private _originalTooltip?: string;
  private _compatibilityShortcutIds: string[] = [];

  ngOnInit(): void {
    const element = this._elementRef.nativeElement;

    // Modo compatibilidad: se registrará en AfterViewInit cuando el DOM esté listo
    if (this.compatibilityMode || (!this.appKeyboardShortcut && this.compatibilityMode !== false)) {
      return;
    }

    // Modo normal: configurar shortcut personalizado
    if (this.appKeyboardShortcut) {
      const configs = normalizeShortcutInput(this.appKeyboardShortcut);
      if (configs.length > 0) {
        this._setupShortcut(configs, element);
      }
    }
  }

  ngAfterViewInit(): void {
    // En modo compatibilidad, esperar a que el DOM esté completamente renderizado
    if (this.compatibilityMode || (!this.appKeyboardShortcut && this.compatibilityMode !== false)) {
      // Usar setTimeout para asegurar que todos los *ngIf y contenido dinámico esté renderizado
      setTimeout(() => {
        this._registerCompatibilityShortcuts(this._elementRef.nativeElement);
      }, 0);
    }
  }

  ngOnDestroy(): void {
    // Remover shortcut del servicio
    if (this._shortcutId) {
      this._shortcutsService.unregisterShortcut(this._shortcutId);
    }

    // Remover shortcuts de compatibilidad
    if (this._compatibilityShortcutIds && this._compatibilityShortcutIds.length > 0) {
      this._compatibilityShortcutIds.forEach((id) => {
        this._shortcutsService.unregisterShortcut(id);
      });
      this._compatibilityShortcutIds = [];
    }

    // Remover badge si existe
    if (this._badgeElement) {
      this._badgeElement.remove();
    }

    // Restaurar tooltip original
    if (this._originalTooltip) {
      const element = this._elementRef.nativeElement;
      if (element.hasAttribute('matTooltip')) {
        this._renderer.setAttribute(element, 'matTooltip', this._originalTooltip);
      } else if (element.hasAttribute('title')) {
        this._renderer.setAttribute(element, 'title', this._originalTooltip);
      }
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Modo compatibilidad
    if (this.compatibilityMode || (!this.appKeyboardShortcut && this.compatibilityMode !== false)) {
      this._handleCompatibilityMode(event);
      return;
    }

    // Modo normal
    if (this.appKeyboardShortcut) {
      this._handleNormalMode(event);
    }
  }

  private _handleCompatibilityMode(event: KeyboardEvent): void {
    // Solo procesar Enter
    if (event.key !== 'Enter') {
      return;
    }

    // Prevenir comportamiento por defecto
    event.preventDefault();
    event.stopPropagation();

    // Solo activar si no estamos en un campo de entrada de texto
    if (this.ignoreInputs) {
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }
    }

    const container = this._elementRef.nativeElement;

    // Prioridad 1: Buscar botón de servicio
    const addServiceButton = container.querySelector(
      'button[data-add-service-button]'
    ) as HTMLButtonElement;
    if (addServiceButton && !addServiceButton.disabled) {
      addServiceButton.click();
      return;
    }

    // Prioridad 2: Buscar botón de evento
    const addEventButton = container.querySelector(
      'button[data-add-event-button]'
    ) as HTMLButtonElement;
    if (addEventButton && !addEventButton.disabled) {
      addEventButton.click();
      return;
    }

    // Prioridad 3: Buscar botón genérico add
    const addButton = container.querySelector(
      'button[data-add-button]'
    ) as HTMLButtonElement;
    if (addButton && !addButton.disabled) {
      addButton.click();
      return;
    }
  }

  private _handleNormalMode(event: KeyboardEvent): void {
    const configs = normalizeShortcutInput(this.appKeyboardShortcut);
    if (configs.length === 0) {
      return;
    }

    // Verificar si algún shortcut coincide
    const matches = configs.some((config) => this._matchesShortcut(event, config));

    if (!matches) {
      return;
    }

    // Para Ctrl + A, siempre permitir incluso en inputs (sobrescribe el comportamiento de seleccionar todo)
    const isCtrlA = configs.some(
      (config) => config.key.toLowerCase() === 'a' && config.ctrl === true
    );

    // Ignorar si está en inputs (excepto para Ctrl + A)
    if (this.ignoreInputs && !isCtrlA) {
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }
    }

    // Prevenir comportamiento por defecto
    event.preventDefault();
    event.stopPropagation();

    // Activar el botón
    const element = this._elementRef.nativeElement;
    if (element instanceof HTMLButtonElement && !element.disabled) {
      element.click();
    } else if (element.tagName === 'BUTTON' && !(element as HTMLButtonElement).disabled) {
      (element as HTMLButtonElement).click();
    }
  }

  private _matchesShortcut(event: KeyboardEvent, config: KeyboardShortcutConfig): boolean {
    // Verificar tecla
    const keyMatches =
      event.key === config.key ||
      event.key.toLowerCase() === config.key.toLowerCase() ||
      event.code === `Key${config.key.toUpperCase()}`;

    if (!keyMatches) {
      return false;
    }

    // Verificar modificadores
    const ctrlMatches = config.ctrl === undefined ? true : event.ctrlKey === config.ctrl;
    const altMatches = config.alt === undefined ? true : event.altKey === config.alt;
    const shiftMatches = config.shift === undefined ? true : event.shiftKey === config.shift;
    const metaMatches = config.meta === undefined ? true : event.metaKey === config.meta;

    return ctrlMatches && altMatches && shiftMatches && metaMatches;
  }

  private _setupShortcut(configs: KeyboardShortcutConfig[], element: HTMLElement): void {
    // Generar ID único
    const primaryConfig = configs[0];
    this._shortcutId = `shortcut-${generateShortcutId(primaryConfig)}-${Date.now()}`;

    // Formatear shortcut para mostrar
    const formatted =
      configs.length > 1
        ? formatMultipleShortcuts(configs)
        : formatShortcut(primaryConfig);

    // Actualizar tooltip
    if (this.showInTooltip) {
      this._updateTooltip(element, formatted);
    }

    // Agregar badge si está habilitado
    if (this.showAsBadge) {
      this._addBadge(element, formatted);
    }

    // Registrar en el servicio si tiene label
    if (this.shortcutLabel) {
      const shortcut: KeyboardShortcut = {
        id: this._shortcutId,
        label: this.shortcutLabel,
        description: this.shortcutDescription,
        category: this.shortcutCategory,
        config: configs.length > 1 ? configs : primaryConfig,
        formatted,
        element,
      };
      this._shortcutsService.registerShortcut(shortcut);
    }
  }

  private _updateTooltip(element: HTMLElement, formatted: string): void {
    // Guardar tooltip original
    const existingTooltip =
      element.getAttribute('matTooltip') || element.getAttribute('title');
    if (existingTooltip && !this._originalTooltip) {
      this._originalTooltip = existingTooltip;
    }

    // Actualizar tooltip
    const newTooltip = existingTooltip
      ? `${existingTooltip} (${formatted})`
      : formatted;

    if (element.hasAttribute('matTooltip')) {
      this._renderer.setAttribute(element, 'matTooltip', newTooltip);
    } else {
      this._renderer.setAttribute(element, 'title', newTooltip);
    }
  }

  private _addBadge(element: HTMLElement, formatted: string): void {
    // Crear badge
    this._badgeElement = this._renderer.createElement('span');
    this._renderer.addClass(this._badgeElement, 'keyboard-shortcut-badge');
    this._renderer.setStyle(this._badgeElement, 'display', 'inline-block');
    this._renderer.setStyle(this._badgeElement, 'margin-left', '8px');
    this._renderer.setStyle(this._badgeElement, 'padding', '2px 6px');
    this._renderer.setStyle(this._badgeElement, 'background', 'rgba(0, 0, 0, 0.1)');
    this._renderer.setStyle(this._badgeElement, 'border-radius', '4px');
    this._renderer.setStyle(this._badgeElement, 'font-size', '0.75rem');
    this._renderer.setStyle(this._badgeElement, 'font-weight', '500');
    this._renderer.setStyle(this._badgeElement, 'color', 'rgba(0, 0, 0, 0.6)');
    this._renderer.setProperty(this._badgeElement, 'textContent', formatted);

    // Agregar al elemento
    this._renderer.appendChild(element, this._badgeElement);
  }

  private _registerCompatibilityShortcuts(container: HTMLElement): void {
    const enterConfig: KeyboardShortcutConfig = { key: 'Enter' };
    const formatted = formatShortcut(enterConfig);

    // Buscar y registrar botón de servicio
    const addServiceButton = container.querySelector(
      'button[data-add-service-button]'
    ) as HTMLButtonElement;
    if (addServiceButton) {
      const label = addServiceButton.textContent?.trim() || 'Agregar Servicio';
      const id = `compat-service-${Date.now()}-${Math.random()}`;
      this._compatibilityShortcutIds.push(id);

      this._shortcutsService.registerShortcut({
        id,
        label,
        description: 'Agregar un nuevo servicio',
        category: 'modales',
        config: enterConfig,
        formatted,
        element: addServiceButton,
      });
    }

    // Buscar y registrar botón de evento
    const addEventButton = container.querySelector(
      'button[data-add-event-button]'
    ) as HTMLButtonElement;
    if (addEventButton) {
      const label = addEventButton.textContent?.trim() || 'Agregar Evento';
      const id = `compat-event-${Date.now()}-${Math.random()}`;
      this._compatibilityShortcutIds.push(id);

      this._shortcutsService.registerShortcut({
        id,
        label,
        description: 'Agregar un nuevo evento',
        category: 'modales',
        config: enterConfig,
        formatted,
        element: addEventButton,
      });
    }

    // Buscar y registrar botón genérico add
    const addButton = container.querySelector(
      'button[data-add-button]'
    ) as HTMLButtonElement;
    if (addButton) {
      const label = addButton.textContent?.trim() || 'Agregar';
      const id = `compat-add-${Date.now()}-${Math.random()}`;
      this._compatibilityShortcutIds.push(id);

      this._shortcutsService.registerShortcut({
        id,
        label,
        description: 'Agregar un nuevo elemento',
        category: 'modales',
        config: enterConfig,
        formatted,
        element: addButton,
      });
    }
  }
}
