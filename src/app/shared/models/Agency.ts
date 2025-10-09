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
    uieNumber?: number;
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
    atRiskService?: boolean;
    basicEducationRegistry?: boolean | null;
    extendedHours?: boolean | null;
    comments?: string | null;
    deadlineToCompleteRegistration?: string | null;
    federalFundsDenied?: boolean;
    federalFundsDeniedReason?: string | null;
    id?: number;
    isDayCareHome?: boolean;
    nationalYouthProgram?: boolean;
    nonProfit?: boolean;
    organizedAthleticPrograms?: boolean;
    publicAllianceContract?: OptionSelection | null;
    publicAllianceContractId?: number | null;
    rejectionJustification?: string | null;
    serviceTime?: string | null;
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
}
