import { OptionSelection } from '../OptionSelection';

export interface SchoolParticipantResponse {
  id: number;
  schoolId: number;
  participantType: OptionSelection;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}
