export interface DTOSchoolStaff {
    id: number;
    schoolId: number;
    staffId: number;
    assignmentDate: Date;
    isPrimary: boolean;
    startDate?: Date;
    endDate?: Date;
    comments?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt?: Date;

    // Información del Staff
    staffFirstName: string;
    staffMiddleName?: string;
    staffFatherLastName: string;
    staffMotherLastName: string;
    staffEmail: string;
    staffPositionId: number;
    staffTypeId: number;
    contractStartDate?: Date;
    contractEndDate?: Date;
    birthDate: Date;
    postalAddress: string;
    staffCityId: number;
    staffRegionId: number;
    areaCode: string;
    staffComments?: string;
    staffUserId?: string;
    staffIsActive: boolean;

    // Información del Sitio
    schoolName: string;
    address: string;
    schoolCityId: number;
    schoolRegionId: number;
    zipCode: string;
    latitude?: number;
    longitude?: number;
    postalCityId?: number;
    postalRegionId?: number;
    postalZipCode?: string;
    sameAsPhysicalAddress?: boolean;
    organizationTypeId: number;
    centerTypeId?: number;
    nonProfit?: boolean;
    baseYear?: number;
    renewalYear?: number;
    operatingFromDate?: Date;
    operatingToDate?: Date;
    operatingDaysCalculated?: number;
    kitchenTypeId?: number;
    groupTypeId?: number;
    deliveryTypeId?: number;
    sponsorTypeId?: number;
    applicantTypeId?: number;
    residentialTypeId?: number;
    operatingPolicyId?: number;
    areaTypeId?: number;
    hasWarehouse?: boolean;
    hasDiningRoom?: boolean;
    administratorAuthorizedName?: string;
    sitePhone?: string;
    extension?: string;
    mobilePhone?: string;
    breakfast?: boolean;
    breakfastFrom?: string; // TimeSpan como string
    breakfastTo?: string; // TimeSpan como string
    lunch?: boolean;
    lunchFrom?: string; // TimeSpan como string
    lunchTo?: string; // TimeSpan como string
    snack?: boolean;
    snackFrom?: string; // TimeSpan como string
    snackTo?: string; // TimeSpan como string
    dinner?: boolean;
    dinnerFrom?: string; // TimeSpan como string
    dinnerTo?: string; // TimeSpan como string
    snackNight?: boolean;
    snackNightFrom?: string; // TimeSpan como string
    snackNightTo?: string; // TimeSpan como string
    communityId?: number;
    walkersId?: number;
    siteTypeId?: number;
    experienceId?: number;
    reviewResultId?: number;
    reviewDate?: Date;
    reviewJustification?: string;
    schoolIsActive: boolean;
    inactiveJustification?: string;
    inactiveDate?: Date;
    schoolCreatedAt: Date;
    schoolUpdatedAt?: Date;


    // Información de la posición del staff
    staffPositionName: string;
    staffPositionNameEn: string;

    // Información del tipo de staff
    staffTypeName: string;
    staffTypeNameEn: string;

    // Información de la ciudad del staff
    staffCityName: string;
    staffCityNameEn: string;

    // Información de la región del staff
    staffRegionName: string;
    staffRegionNameEn: string;

    // Información de la agencia del sitio
    agencyName: string;
    agencyIsActive: boolean;
}
