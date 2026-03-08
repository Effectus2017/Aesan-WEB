/**
 * Configuración de un atajo de teclado
 */
export interface KeyboardShortcutConfig {
  /** Tecla principal (ej: 'Enter', 's', 'Escape') */
  key: string;
  /** Si se requiere Ctrl (o Cmd en Mac) */
  ctrl?: boolean;
  /** Si se requiere Alt */
  alt?: boolean;
  /** Si se requiere Shift */
  shift?: boolean;
  /** Si se requiere Meta (Cmd en Mac) */
  meta?: boolean;
}

/**
 * Tipo para definir un shortcut
 * Puede ser una tecla simple, una configuración completa, o un array de ambos
 */
export type KeyboardShortcutInput =
  | string
  | KeyboardShortcutConfig
  | (string | KeyboardShortcutConfig)[];

/**
 * Información completa de un shortcut registrado
 */
export interface KeyboardShortcut {
  /** ID único del shortcut */
  id: string;
  /** Etiqueta/acción del shortcut */
  label: string;
  /** Descripción del shortcut */
  description?: string;
  /** Categoría para agrupar shortcuts */
  category?: string;
  /** Configuración del shortcut */
  config: KeyboardShortcutConfig | KeyboardShortcutConfig[];
  /** Formato legible del shortcut (ej: "Ctrl+S", "Enter") */
  formatted: string;
  /** Elemento HTML del botón asociado (opcional) */
  element?: HTMLElement;
}

/**
 * Categorías comunes para shortcuts
 */
export type ShortcutCategory =
  | 'formularios'
  | 'modales'
  | 'crud'
  | 'navegacion'
  | 'acciones'
  | 'sitios'
  | 'calendario'
  | 'general';
