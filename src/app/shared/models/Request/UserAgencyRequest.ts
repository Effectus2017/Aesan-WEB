import { UserRequest } from "./UserRequest";
import { AgencyRequest } from "./AgencyRequest";

export interface UserAgencyRequest {
    Agency: AgencyRequest;
    User: UserRequest;
}
