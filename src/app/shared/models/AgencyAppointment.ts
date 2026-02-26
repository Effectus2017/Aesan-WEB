export interface AgencyAppointment {
  id: number;
  agencyId: number;
  date: string; // ISO format YYYY-MM-DD
  startTime: string; // format HH:MM:SS
  endTime: string; // format HH:MM:SS
  comment?: string;
}

export interface AgencyCalendarResponse {
  agencyId: number;
  agencyName: string;
  appointments: AgencyAppointment[];
}
