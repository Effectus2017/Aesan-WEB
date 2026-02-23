import { ColumnSchema } from 'app/shared/components/generic-table/generic-table.interface';
import { FilterSchema } from 'app/shared/components/generic-filter-panel/generic-filter-panel.interface';

/** Keys que se envían como número en la request; si el valor no es válido se envía null. */
const NUMERIC_FILTER_KEYS = new Set(['uieNumber', 'sdrNumber', 'einNumber']);

/**
 * Construye los requestParameters para un GET de lista que usa filtersSchema.
 * Combina los parámetros base (take, skip, etc.) con los valores del form para cada key del schema.
 * Centraliza la lógica de extracción y conversión (numérica, NaN → null) para que las listas no la dupliquen.
 *
 * @param filtersSchema Schema de filtros del módulo (p. ej. VALIDATION_TO_PROGRAM_FILTERS_SCHEMA).
 * @param form Objeto form (header + appliedFilters).
 * @param baseParams Parámetros fijos de la lista (take, skip, alls, isList, etc.).
 * @returns Objeto con baseParams más un valor por cada key del schema.
 */
export function buildRequestParamsFromFiltersSchema<T extends Record<string, unknown>>(
  filtersSchema: FilterSchema[] | undefined,
  form: Record<string, unknown>,
  baseParams: T
): T {
  const result = { ...baseParams } as Record<string, unknown>;
  if (!filtersSchema?.length) return result as T;
  for (const f of filtersSchema) {
    const paramKey = getFilterParamKey(f);
    if (f.type === 'date' || f.type === 'date-time') {
      const paramKeyFrom = paramKey + 'From';
      const paramKeyTo = paramKey + 'To';
      const rawFrom = form[paramKeyFrom];
      const rawTo = form[paramKeyTo];
      result[paramKeyFrom] = normalizeDateParam(rawFrom);
      result[paramKeyTo] = normalizeDateParam(rawTo);
      continue;
    }
    const raw = form[paramKey];
    let value: string | number | null =
      raw === undefined || raw === null || raw === ''
        ? null
        : NUMERIC_FILTER_KEYS.has(paramKey)
          ? Number(raw)
          : (raw as string);
    if (NUMERIC_FILTER_KEYS.has(paramKey) && typeof value === 'number' && Number.isNaN(value)) {
      value = null;
    }
    result[paramKey] = value;
  }
  return result as T;
}

function normalizeDateParam(raw: unknown): string | null {
  if (raw === undefined || raw === null || raw === '') return null;
  if (raw instanceof Date) {
    const y = raw.getFullYear();
    const m = String(raw.getMonth() + 1).padStart(2, '0');
    const d = String(raw.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.substring(0, 10);
    return trimmed;
  }
  return null;
}

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
 * Obtiene el nombre del parámetro para el filtro.
 * Acepta ColumnSchema o FilterSchema (ambos tienen key: string | string[]).
 * Para key array (ej. combined-text) usa el primer key.
 */
export function getFilterParamKey(col: { key: string | string[] }): string {
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
