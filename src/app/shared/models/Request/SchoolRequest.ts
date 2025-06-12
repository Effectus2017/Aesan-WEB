export interface SchoolRequest {
    id?: number;
    name?: string;

    // Dirección Física
    address?: string;
    zipCode?: number;
    cityId?: number;
    regionId?: number;
    latitude?: number;
    longitude?: number;

    // Dirección Postal
    postalAddress?: string;
    postalZipCode?: number;
    postalCityId?: number;
    postalRegionId?: number;
    sameAsPhysicalAddress?: boolean;

    // Información Administrativa
    organizationTypeId?: number;
    centerTypeId?: number;
    nonProfit?: boolean;
    startDate?: string;
    baseYear?: number;
    renewalYear?: number;
    educationLevelId?: number;
    operatingDays?: number;

    // Información Operacional
    kitchenTypeId?: number;
    groupTypeId?: number;
    deliveryTypeId?: number;
    sponsorTypeId?: number;
    applicantTypeId?: number;
    residentialTypeId?: number;
    operatingPolicyId?: number;
    hasWarehouse?: boolean;
    hasDiningRoom?: boolean;

    // Administrador/Representante Autorizado
    administratorAuthorizedName?: string;
    sitePhone?: string;
    extension?: string;
    mobilePhone?: string;

    // Servicios y Horarios
    breakfast?: boolean;
    breakfastFrom?: string;
    breakfastTo?: string;
    lunch?: boolean;
    lunchFrom?: string;
    lunchTo?: string;
    snack?: boolean;
    snackFrom?: string;
    snackTo?: string;

    // Si la escuela es la principal
    isMainSchool?: boolean;

}
