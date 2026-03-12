export interface SiteDayCareHomeRequest {
  id?: number;
  siteId: number;
  isAuthorizedToOperate?: boolean;
  hasFamilyDepartmentLicense?: boolean;
  numberOfEnrolledChildren?: number;
  numberOfProviderChildren?: number;
  numberOfParticipantsWithBloodTies?: number;
  numberOfParticipantsWithoutBloodTies?: number;
  minorsLiveWithProvider?: boolean;
  relationshipTypeId?: number;
  offersServiceToImmigrantChildren?: boolean;
  homeTypeId?: number;
  administratorAuthorizedName?: string;
  administratorBirthDate?: string;
  offersServiceToDifferentGroups?: boolean;
}
