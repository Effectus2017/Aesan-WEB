export interface SchoolRequest {
    id?: number;
    name: string;
    educationLevelId: number;
    operatingPeriodId: number;
    address: string;
    cityId: number;
    regionId: number;
    zipCode: number;
    organizationTypeId: number;
    facilityIds?: number[];
    mealTypeIds?: number[];
}
