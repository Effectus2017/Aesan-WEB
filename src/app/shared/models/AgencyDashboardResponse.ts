/**
 * Modelo de respuesta para las métricas del dashboard de agencia
 */
export interface AgencyDashboardResponse {
  /**
   * Total de escuelas de la agencia
   */
  totalSchools: number;

  /**
   * Total de sitios de la agencia
   */
  totalSites: number;

  /**
   * Fecha de última actualización
   */
  lastUpdated: string;
}

