import { Agency } from "./Agency";
import { AlternativeCommunication } from "./AlternativeCommunication";
import { FederalFundingCertification } from "./FederalFundingCertification";
import { FoodAuthority } from "./FoodAuthority";
import { OperatingPolicy } from "./OperatingPolicy";
import { Site } from "./Site";

export interface Program {
    id: number;
    name: string;
    description: string;
    agencyId?: number;
}

export interface ProgramInscription {
    id: number;
    agency: Agency;
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
