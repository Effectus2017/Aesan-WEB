/**
 * DTO unificado para entradas del centro de logs (todas las categorías).
 * Respuesta de GET /api/logs.
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

export interface LogsPageResponse {
  items: CentralLogEntry[];
  totalCount: number;
  page: number;
  pageSize: number;
}
