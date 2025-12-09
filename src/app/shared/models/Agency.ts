import { AgencyStatus } from "./AgencyStatus";
import { City } from "./City";
import { Program } from "./Program";
import { Region } from "./Region";
import { OptionSelection } from "./OptionSelection";
import { Staff } from "./Staff";

export interface Agency {
    id?: number;
    name?: string;
    statusId?: number;
    // Identification
    sdrNumber?: number;
    uieNumber?: string;
    einNumber?: number;
    // Address
    address?: string;
    phone?: string;
    zipCode?: number;

    // Location
    city?: City;
    region?: Region;
    latitude?: number;
    longitude?: number;

    // Postal Address
    postalAddress?: string;
    postalZipCode?: number;
    postalCity?: City;
    postalRegion?: Region;

    // Contact
    email?: string;
    // Dates
    createdAt?: Date;
    updatedAt?: Date;

    // Status
    isActive?: boolean;
    isListable?: boolean;
    isRecurrent?: boolean;

    // Status
    status?: AgencyStatus;
    // Program
    programs?: Program[];
    // User
    user?: Staff;
    monitor?: Staff;
    // Cita coordinada
    appointmentCoordinated?: boolean;
    appointmentDate?: string;
    // Justificación de Rechazo
    rejectionJustification?: string;
    // Deadline to complete the registration of the Sites
    deadlineToCompleteRegistration?: string;
    // inscription
    inscription?: InscriptionResponse;
}


class InscriptionResponse {
    appointmentCoordinated?: boolean;
    appointmentDate?: string | null;
    basicEducationRegistry?: boolean | null;
    extendedHours?: boolean | null;
    comments?: string | null;
    deadlineToCompleteRegistration?: string | null;
    completedRegistrationDate?: string | null;
    federalFundsDenied?: boolean;
    federalFundsDeniedReason?: string | null;
    id?: number;
    isDayCareHomeId?: number;
    isDayCareHome?: OptionSelection | null;
    nationalYouthProgram?: boolean;
    nonProfit?: boolean;
    publicAllianceContract?: OptionSelection | null;
    publicAllianceContractId?: number | null;
    rejectionJustification?: string | null;
    stateFundsDenied?: boolean;
    stateFundsDeniedReason?: string | null;
    taxExemptionStatus?: OptionSelection | null;
    taxExemptionStatusId?: number | null;
    taxExemptionType?: OptionSelection | null;
    taxExemptionTypeId?: number | null;
    typeOfApplicant?: OptionSelection | null;
    typeOfApplicantId?: number | null;
    typeOfEntity?: OptionSelection | null;
    typeOfEntityId?: number | null;
    // ¿Su Entidad participa actualmente en alguno de los siguientes programas? (Solo para PSAV)
    // Does your Entity currently participate in any of the following programs? (Only for PSAV)
    // Early Head Start, Head Start, N/A
    participatesInHeadStartProgramId?: number | null;
    participatesInHeadStartProgram?: OptionSelection | null;
}
