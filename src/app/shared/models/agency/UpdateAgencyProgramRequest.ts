/**
 * Modelo de petición para actualizar programa de agencia.
 */
export interface UpdateAgencyProgramRequest {
  agencyId: number;
  programId: number;
  statusId: number;
  userId: string;
  comment: string;
  appointmentCoordinated: boolean;
  appointmentDate?: Date;
}
