import { SchoolRequest } from './SchoolRequest';
import { FederalFundingSourceRequest } from './FederalFundingSourceRequest';

export interface ProgramInscriptionRequest {
  agencyId: number;
  programId: number;
  applicationNumber: string;
  isPublic: boolean;
  totalNumberSchools: number;
  hasBasicEducationCertification: boolean;
  isAeaMenuCreated: boolean;
  exemptionRequirement: string;
  exemptionStatus: string;
  participatingAuthorityId: number;
  operatingPolicyId: number;
  hasCompletedCivilRightsQuestionnaire: boolean;
  needsInformationInOtherLanguages: boolean;
  informationInOtherLanguages?: string;
  needsInterpreter: boolean;
  interpreterLanguages?: string;
  needsAlternativeCommunication: boolean;
  alternativeCommunicationId?: number;
  needsFederalRelayServiceId: number;
  showEvidenceId: number;
  showEvidenceDescription?: string;
  snackPercentage?: number;
  reducedSnackPercentage?: number;
  federalFundingCertificationId?: number;
  schools?: SchoolRequest[];
  federalFundingSources?: FederalFundingSourceRequest[];
  requiredDocumentIds?: number[];
}
