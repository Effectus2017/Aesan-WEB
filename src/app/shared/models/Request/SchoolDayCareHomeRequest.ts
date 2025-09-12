export interface SchoolDayCareHomeRequest {
  id?: number;
  schoolId: number;
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
