export interface AgencyRequest {
    Id?: number;
    Name?: string;
    StatusId?: number;
    // Datos de la Agencia
    SdrNumber?: number;
    UieNumber?: number;
    EinNumber?: number;
    // Dirección
    Address?: string;
    ZipCode?: number;
    CityId?: number;
    RegionId?: number;
    Latitude?: number;
    Longitude?: number;
    // Dirección Postal
    PostalAddress?: string;
    PostalZipCode?: number;
    PostalCityId?: number;
    PostalRegionId?: number;
    // Datos del usuario
    Email?: string;
    Phone?: string;
    // Nuevos campos de elegibilidad
    NonProfit?: boolean;
    FederalFundsDenied?: boolean;
    StateFundsDenied?: boolean;
    // Datos del usuario
    FirstName?: string;
    MiddleName?: string;
    FatherLastName?: string;
    MotherLastName?: string;
    AdministrationTitle?: string;
    // Programas
    Programs?: number[];
}
