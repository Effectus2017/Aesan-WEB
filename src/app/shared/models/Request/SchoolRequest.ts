
export interface SchoolRequest {
    Id: number;
    Name: string;
    EducationLevelId: number;
    OperatingPeriodId: number;
    Address: string;
    CityId: number;
    RegionId: number;
    ZipCode: number;
    OrganizationTypeId: number;
    FacilityIds: number[];
    MealTypeIds: number[];
}
