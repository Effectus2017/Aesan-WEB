import { OptionSelection } from '../common/OptionSelection';

export interface SiteDayCareHomeResponse {
  id: number;
  siteId: number;
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
