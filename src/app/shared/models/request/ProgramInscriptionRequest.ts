import { SiteRequest } from './SiteRequest';
import { FederalFundingSourceRequest } from './FederalFundingSourceRequest';

export interface ProgramInscriptionRequest {
  agencyId: number;
  programId: number;
  applicationNumber: string;
  isPublic: boolean;
  totalNumberSites: number;
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
  // ¿Desde cuándo su Entidad ofrece servicios? (PACNA)
  servicesOfferedSince?: string; // ISO string (YYYY-MM-DD)
  snackPercentage?: number;
  reducedSnackPercentage?: number;
  federalFundingCertificationId?: number;
  sites?: SiteRequest[];
  federalFundingSources?: FederalFundingSourceRequest[];
  requiredDocumentIds?: number[];
}
