/**
 * Modelo de petición para estado de agencia.
 */
export interface AgencyStatusRequest {
  name: string;
  nameEN: string;
  isActive: boolean;
  displayOrder: number;
}
