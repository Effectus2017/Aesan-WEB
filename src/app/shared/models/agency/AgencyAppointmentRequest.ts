/**
 * Modelo de petición para cita de agencia.
 */
export interface AgencyAppointmentRequest {
  id?: number;
  agencyId: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  comment?: string;
}
