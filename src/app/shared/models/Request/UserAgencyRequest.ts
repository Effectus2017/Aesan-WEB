import { StaffRequest } from "./StaffRequest";
import { AgencyRequest } from "./AgencyRequest";

export interface UserAgencyRequest {
    agency: AgencyRequest;
    staff?: StaffRequest;  // Cambiado de 'user' a 'staff'
}
