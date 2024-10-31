export interface AgencyRequest {
    Name?: string;
    StatusId?: number;
    CityId?: number;
    RegionId?: number;
    ProgramId?: number;

    SdrNumber?: number;
    UieNumber?: number;
    EinNumber?: number;

    Address?: string;
    PostalCode?: number;
    Latitude?: number;
    Longitude?: number;
    Phone?: string;
}
