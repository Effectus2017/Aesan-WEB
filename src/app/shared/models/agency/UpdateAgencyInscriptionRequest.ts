/**
 * Modelo de petición para actualizar la inscripción de una agencia (no registro).
 */
export interface UpdateAgencyInscriptionRequest {
  agencyId?: number;
  statusId?: number;
  rejectionJustification?: string;
  appointmentCoordinated?: boolean;
  appointmentDate?: string;
}
