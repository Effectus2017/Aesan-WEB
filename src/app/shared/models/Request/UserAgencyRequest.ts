import { UserRequest } from "./UserRequest";
import { AgencyRequest } from "./AgencyRequest";

export interface UserAgencyRequest {
    agency: AgencyRequest;
    user: UserRequest;
}
