export interface SiteParticipantRequest {
  id?: number;
  siteId: number;
  participantTypeId: number;
  isActive?: boolean;
}
