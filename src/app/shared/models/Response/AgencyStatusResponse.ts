/**
 * Modelo de respuesta para el estado de una agencia (API).
 */
export interface AgencyStatusResponse {
  id: number;
  name: string;
  nameEN: string;
  isActive: boolean;
  displayOrder: number;
}
