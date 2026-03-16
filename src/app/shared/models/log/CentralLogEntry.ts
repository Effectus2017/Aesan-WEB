import type { PagedResult } from '../common/PagedResult';

/**
 * DTO unificado para entradas del centro de logs (todas las categorías).
 * Respuesta de GET /api/logs (cada elemento dentro de PagedResult.data).
 */
export interface CentralLogEntry {
  category: string;
  id: number;
  timestamp: string;
  summary: string;
  status?: string;
  payload?: string;
  userId?: string;
  level?: string;
}

/** Respuesta paginada de GET /api/logs (data + count). */
export type LogsPagedResponse = PagedResult<CentralLogEntry>;
