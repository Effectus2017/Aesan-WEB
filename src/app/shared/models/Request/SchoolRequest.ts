export interface SchoolRequest {
    id?: number;
    name: string;

    // Dirección Física
    address: string;
    zipCode: number;
    cityId: number;
    regionId: number;
    latitude: number;
    longitude: number;

    // Dirección Postal
    postalAddress: string;
    postalZipCode: number;
    postalCityId: number;
    postalRegionId: number;

    // Datos de la Escuela
    educationLevelId: number;
    operatingPeriodId: number;
    organizationTypeId: number;
    applicantTypeId: number;
    operatingPolicyId: number;
    sponsorTypeId: number;
    deliveryTypeId: number;
    groupTypeId: number;
    kitchenTypeId: number;
    facilityIds?: number[];
    mealTypeIds?: number[];
}
