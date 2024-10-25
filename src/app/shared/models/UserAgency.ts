
export interface AgencyRequest {
    name?: string;
    statusId?: number;
    stateDepartmentRegistration?: string;
    uieNumber?: number;
    einNumber?: number;
    address?: string;
    cityId?: number;
    regionId?: number;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
    programs?: number[];
}

export interface UserRequest {
    firstName: string;
    middleName: string;
    fatherLastName: string;
    motherLastName: string;
    administrationTitle: string;
}
