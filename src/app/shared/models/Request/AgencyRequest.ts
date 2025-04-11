export interface AgencyRequest {
    name?: string;
    statusId?: number;
    // Datos de la Agencia
    sdrNumber?: number;
    uieNumber?: number;
    einNumber?: number;
    // Dirección Física
    address?: string;
    zipCode?: string;
    cityId?: number;
    regionId?: number;
    latitude?: number;
    longitude?: number;
    // Dirección Postal
    postalAddress?: string;
    postalCityId?: number;
    postalRegionId?: number;
    postalZipCode?: string;
    // Imágen - Logo
    imageUrl?: string;
    email?: string;
    phone?: string;
    administrationTitle?: string;
    // Campos de elegibilidad
    nonProfit?: boolean;
    basicEducationRegistry?: number;
    federalFundsDenied?: boolean;
    stateFundsDenied?: boolean;
    organizedAthleticPrograms?: boolean;
    atRiskService?: boolean;
    // Service Time
    serviceTime?: Date;
    // Tax Exemption
    taxExemptionStatus?: number;
    taxExemptionType?: number;
    // Campos de estado
    isActive?: boolean;
    isListable?: boolean;
    // Programas
    programs?: number[];
    monitorId?: string;
    assignedBy?: string;
}

export interface UpdateAgencyProgramRequest {
    agencyId?: number;
    statusId?: number;
    programId?: number;
    userId?: string;
}

export interface UpdateAgencyInscriptionRequest {
    agencyId?: number;
    statusId?: number;
    rejectionJustification?: string;
    appointmentCoordinated?: boolean;
    appointmentDate?: string;
}
