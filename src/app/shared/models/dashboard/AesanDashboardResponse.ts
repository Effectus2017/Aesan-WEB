/**
 * Modelo de respuesta para las métricas del dashboard AESAN
 */
export interface AesanDashboardResponse {
  /**
   * Conteos de agencias por estado
   */
  agencyStatusCounts: AgencyStatusCounts;

  /**
   * Total de agencias
   */
  totalAgencies: number;

  /**
   * Fecha de última actualización
   */
  lastUpdated: string;
}

/**
 * Conteos de agencias por estado
 */
export interface AgencyStatusCounts {
  /**
   * Agencias pendientes de validación (StatusId = 1)
   */
  pendingValidationCount: number;

  /**
   * Agencias en orientación (StatusId = 2)
   */
  orientationCount: number;

  /**
   * Agencias aprobadas (StatusId = 7)
   */
  approvedCount: number;

  /**
   * Agencias rechazadas (StatusId = 6)
   */
  rejectedCount: number;
}
