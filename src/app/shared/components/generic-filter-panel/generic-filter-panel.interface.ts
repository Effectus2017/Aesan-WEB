import type { GenericFilterResult } from 'app/shared/components/generic-table/generic-table.interface';

/**
 * Schema específico para definir filtros del panel, independiente del columns-schema de la tabla.
 */
export interface FilterSchema {
  key: string | string[];
  type: 'text' | 'date' | 'date-time' | 'boolean' | 'combined-text';
  label: string;
  /** Para combined-text: claves que se combinan. */
  keys?: string[];
}

/**
 * Handler que debe implementar el componente padre cuando usa el panel de filtros con filtersSchema.
 * Obligatorio para que el panel pueda notificar "aplicar" y "restablecer" sin depender de outputs.
 */
export interface OnGenericFilterHandlers {
  /** Recibe los filtros listos para la API (construidos desde filtersSchema + form). */
  onFiltersApply(filters: GenericFilterResult): void;
  /** Se invoca al pulsar Restablecer; el padre debe limpiar appliedFilters y recargar. */
  onFiltersReset(): void;
}

/** Configuración de un campo de filtro para la vista (derivada de FilterSchema). */
export interface GenericFilterFieldConfig {
  /** Schema del filtro (FilterSchema). */
  filter: FilterSchema;
  /** Clave original (puede tener '.') para el resultado emitido. */
  paramKey: string;
  /** Nombre del FormControl (sin '.') para formControlName. */
  formControlKey: string;
  type: FilterSchema['type'];
  label: string;
  /** Solo para date/date-time: clave del control "hasta". */
  paramKeyTo?: string;
  formControlKeyTo?: string;
}
