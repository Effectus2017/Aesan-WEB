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
}



