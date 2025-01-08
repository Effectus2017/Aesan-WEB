export interface UpdateAgencyProgramRequest {
  agencyId: number;
  programId: number;
  statusId: number;
  userId: string;
  comment: string;
  appointmentCoordinated: boolean;
  appointmentDate?: Date;
}
