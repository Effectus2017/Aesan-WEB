import { KeyboardShortcutConfig } from '../models/common/KeyboardShortcut';

/**
 * Constantes para shortcuts comunes
 */
export const KeyboardShortcuts = {
  save: { key: 's', ctrl: true },
  saveAlt: 'Enter',
  cancel: 'Escape',
  delete: { key: 'Delete', shift: true },
  add: { key: 'a', ctrl: true },
  addAlt: 'Enter',
  edit: { key: 'e', ctrl: true },
  search: { key: 'f', ctrl: true },
  close: 'Escape',
  enter: 'Enter',
  escape: 'Escape',
} as const;

/**
 * Detecta si estamos en Mac (usa Cmd en lugar de Ctrl)
 */
export function isMac(): boolean {
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

/**
 * Formatea un KeyboardShortcutConfig a string legible
 * @param config Configuración del shortcut
 * @returns String formateado (ej: "Ctrl+S", "Alt+Enter", "Enter")
 */
export function formatShortcut(config: KeyboardShortcutConfig | string): string {
  if (typeof config === 'string') {
    return formatKeyName(config);
  }

  const parts: string[] = [];

  // En Mac, usar Cmd en lugar de Ctrl cuando corresponda
  if (config.ctrl && !config.meta) {
    parts.push(isMac() ? 'Cmd' : 'Ctrl');
  }
  if (config.alt) {
    parts.push('Alt');
  }
  if (config.shift) {
    parts.push('Shift');
  }
  if (config.meta) {
    parts.push('Cmd');
  }

  // Agregar la tecla principal
  parts.push(formatKeyName(config.key));

  return parts.join('+');
}

/**
 * Formatea múltiples shortcuts separados por " o "
 * @param configs Array de configuraciones de shortcuts
 * @returns String formateado (ej: "Enter o Ctrl+S")
 */
export function formatMultipleShortcuts(
  configs: (KeyboardShortcutConfig | string)[]
): string {
  return configs.map((config) => formatShortcut(config)).join(' o ');
}

/**
 * Formatea el nombre de una tecla para mostrar
 * @param key Nombre de la tecla
 * @returns Nombre formateado
 */
function formatKeyName(key: string): string {
  const keyMap: Record<string, string> = {
    Enter: 'Enter',
    Escape: 'Escape',
    Delete: 'Delete',
    Backspace: 'Backspace',
    Tab: 'Tab',
    Space: 'Space',
    ArrowUp: '↑',
    ArrowDown: '↓',
    ArrowLeft: '←',
    ArrowRight: '→',
    Home: 'Home',
    End: 'End',
    PageUp: 'Page Up',
    PageDown: 'Page Down',
    Insert: 'Insert',
  };

  // Si está en el mapa, usar el nombre formateado
  if (keyMap[key]) {
    return keyMap[key];
  }

  // Si es una letra, convertir a mayúscula
  if (key.length === 1 && /[a-zA-Z]/.test(key)) {
    return key.toUpperCase();
  }

  // Devolver tal cual
  return key;
}

/**
 * Normaliza un KeyboardShortcutInput a un array de KeyboardShortcutConfig
 * @param input Input del shortcut (puede ser string, config o array)
 * @returns Array de configuraciones normalizadas
 */
export function normalizeShortcutInput(
  input: string | KeyboardShortcutConfig | (string | KeyboardShortcutConfig)[] | null | undefined
): KeyboardShortcutConfig[] {
  if (!input) {
    return [];
  }

  if (typeof input === 'string') {
    return [{ key: input }];
  }

  if (Array.isArray(input)) {
    return input.map((item) =>
      typeof item === 'string' ? { key: item } : item
    );
  }

  return [input];
}

/**
 * Genera un ID único para un shortcut basado en su configuración
 * @param config Configuración del shortcut
 * @returns ID único
 */
export function generateShortcutId(config: KeyboardShortcutConfig): string {
  const parts = [
    config.ctrl ? 'ctrl' : '',
    config.alt ? 'alt' : '',
    config.shift ? 'shift' : '',
    config.meta ? 'meta' : '',
    config.key.toLowerCase(),
  ].filter(Boolean);

  return parts.join('-');
}
