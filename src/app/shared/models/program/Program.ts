import { AgencyResponse } from '../agency/AgencyResponse';
import { AlternativeCommunication } from './AlternativeCommunication';
import { FederalFundingCertification } from './FederalFundingCertification';
import { FoodAuthority } from '../catalog/FoodAuthority';
import { OperatingPolicy } from '../household/OperatingPolicy';
import { Site } from '../site/Site';

export interface Program {
    id: number;
    name: string;
    description: string;
    agencyId?: number;
}

export interface ProgramInscription {
    id: number;
    agency: AgencyResponse;
    program: Program;
    applicationNumber: string;
    isPublic: boolean;
    totalNumberSchools: number;
    hasBasicEducationCertification: boolean;
    isAeaMenuCreated: boolean;
    exemptionRequirement: string;
    exemptionStatus: string;
    participatingAuthority: FoodAuthority;
    operatingPolicy: OperatingPolicy;
    hasCompletedCivilRightsQuestionnaire: boolean;
    needsInformationInOtherLanguages: boolean;
    informationInOtherLanguages: string;
    needsInterpreter: boolean;
    interpreterLanguages: string;
    needsAlternativeCommunication: boolean;
    alternativeCommunication: AlternativeCommunication;
    needsFederalRelayService: boolean;
    showEvidence: boolean;
    showEvidenceDescription: string;
    snackPercentage: number;
    reducedSnackPercentage: number;
    federalFundingCertification: FederalFundingCertification;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
    sites: Site[];
    federalFundingSources: any[];//FederalFundingSource[];
    requiredDocuments: any[];//RequiredDocument[];
}
