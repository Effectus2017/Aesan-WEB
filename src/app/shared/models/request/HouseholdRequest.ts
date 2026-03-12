export interface HouseholdRequest {
    id?: number;
    street: string;
    apartment: string;
    cityId: number;
    regionId: number;
    zipCode: string;
    phone: string;
    email: string;
    completedBy: string;
    completedDate: string;
}
