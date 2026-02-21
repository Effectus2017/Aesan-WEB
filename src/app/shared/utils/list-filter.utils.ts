import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';

/** Tipos de columna que no participan en filtros (solo visuales o acciones). */
const NON_FILTERABLE_TYPES = new Set<ColumnSchema['type']>([
  'button',
  'image',
  'file-type',
  'file-size',
  'content-type-text',
  'check',
]);

/**
 * Devuelve las columnas del schema que deben mostrarse en el panel de filtros.
 * Excluye tipos no filterables y columnas con filterable === false.
 */
export function getFilterableColumns(schema: ColumnSchema[]): ColumnSchema[] {
  return schema.filter((col) => {
    if (col.filterable === false) return false;
    if (NON_FILTERABLE_TYPES.has(col.type)) return false;
    return true;
  });
}

/**
 * Obtiene el nombre del parámetro para el filtro de una columna.
 * Para key array (ej. combined-text) usa el primer key; si existe filterParamName en el futuro se podría usar.
 */
export function getFilterParamKey(col: ColumnSchema): string {
  if (typeof col.key === 'string') return col.key;
  return col.key[0] ?? '';
}

/**
 * Convierte un paramKey (que puede contener '.') en un nombre válido para FormControl.
 * FormGroup no permite puntos en las claves.
 */
export function sanitizeParamKeyForForm(paramKey: string): string {
  return paramKey.replace(/\./g, '_');
}
