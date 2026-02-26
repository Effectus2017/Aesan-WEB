export interface AgencyAppointmentRequest {
  id?: number;
  agencyId: number;
  appointmentDate: string; // ISO format YYYY-MM-DD
  startTime: string; // format HH:MM:SS
  endTime: string; // format HH:MM:SS
  comment?: string;
}
