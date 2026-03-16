/**
 * Contenedor para respuestas paginadas. Alineado con la API (PagedResult<T>).
 */
export interface PagedResult<T> {
  data: T[];
  count: number;
}
