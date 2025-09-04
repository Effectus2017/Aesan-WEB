// Corresponder a modelos Staff de la API
export interface StaffRequest {
    id?: number;
    firstName: string;
    middleName?: string;
    fatherLastName: string;
    motherLastName?: string;
    statusId?: number;
    positionId?: number;
    staffTypeId?: number;
    staffClassificationId?: number;
    contractStartDate?: Date;
    contractEndDate?: Date;
    birthDate?: Date;
    email: string;
    phoneNumber?: string;
    imageURL?: string;
    postalAddress?: string;
    cityId?: number;
    regionId?: number;
    areaCode?: string;
    agencyId?: number;
    comments?: string;
    userId?: string;
    isActive?: boolean;
    reviewResultId?: number;
    reviewDate?: Date;
    reviewJustification?: string;
}
