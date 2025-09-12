export interface SchoolParticipantRequest {
  id?: number;
  schoolId: number;
  participantTypeId: number;
  isActive?: boolean;
}
