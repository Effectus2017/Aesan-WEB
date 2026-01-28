/**
 * Tipo de servicio por programa (AESAN-257).
 * Incluye IsStrongService y MinimumMinutesToNextService desde ServiceTypeProgram.
 */
export interface ServiceTypeByProgram {
  id: number;
  name: string;
  nameEN: string;
  code: string;
  displayOrder: number;
  isStrongService: boolean;
  minimumMinutesToNextService: number | null;
  isActive: boolean;
}
