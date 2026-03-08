import { OptionSelection } from '../common/OptionSelection';

export interface SiteParticipantResponse {
  id: number;
  siteId: number;
  participantType: OptionSelection;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}
