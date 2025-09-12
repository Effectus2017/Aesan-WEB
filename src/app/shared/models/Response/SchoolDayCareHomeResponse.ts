import { OptionSelection } from '../OptionSelection';

export interface SchoolDayCareHomeResponse {
  id: number;
  schoolId: number;
  isAuthorizedToOperate?: boolean;
  hasFamilyDepartmentLicense?: boolean;
  numberOfEnrolledChildren?: number;
  numberOfProviderChildren?: number;
  numberOfParticipantsWithBloodTies?: number;
  numberOfParticipantsWithoutBloodTies?: number;
  minorsLiveWithProvider?: boolean;
  relationshipType?: OptionSelection;
  offersServiceToImmigrantChildren?: boolean;
  homeType?: OptionSelection;
  administratorAuthorizedName?: string;
  administratorBirthDate?: string;
  offersServiceToDifferentGroups?: boolean;
  createdAt: string;
  updatedAt?: string;
}
