export interface AgencyRequest {
    Name?: string;
    StatusId?: number;
    ProgramId?: number;

    // Datos de la Agencia
    SdrNumber?: number;
    UieNumber?: number;
    EinNumber?: number;

    // Datos de la Ciudad y Región
    CityId?: number;
    RegionId?: number;
    Latitude?: number;
    Longitude?: number;

    // Dirección y Teléfono
    Address?: string;
    Phone?: string;
    ZipCode?: number;
    PostalAddress?: string;

}
