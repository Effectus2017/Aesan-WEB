import { AgencyStatus } from "./AgencyStatus";
import { City } from "./City";
import { Program } from "./Program";
import { Region } from "./Region";

export interface Agency {
    name?: string;
    statusId?: number;

    sdrNumber?: number;
    uieNumber?: number;
    einNumber?: number;

    address?: string;
    postalCode?: number;
    latitude?: number;
    longitude?: number;
    phone?: string;
    email?: string;

    createdAt?: Date;
    updatedAt?: Date;

    city?: City;
    region?: Region;
    status?: AgencyStatus;
    program?: Program;
    user?: User;
}

export interface User {
    firstName: string;
    middleName: string;
    fatherLastName: string;
    motherLastName: string;
    administrationTitle: string;
}

