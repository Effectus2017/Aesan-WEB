
export interface AgencyRequest {
    name?: string;
    statusId?: number;
    cityId?: number;
    regionId?: number;
    programId?: number;


    sdrNumber?: string;
    uieNumber?: number;
    einNumber?: number;

    address?: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
}

export interface UserRequest {
    firstName: string;
    middleName: string;
    fatherLastName: string;
    motherLastName: string;
    administrationTitle: string;
}
