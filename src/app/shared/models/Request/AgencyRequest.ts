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
    // Imagen - Logo
    imageUrl?: string;
    email?: string;
    phone?: string;
    administrationTitle?: string;
    // Campos de estado
    isActive?: boolean;
    isListable?: boolean;
    // Programas
    programs?: number[];
    monitorId?: string;
    assignedBy?: string;

    // ------------------------------------------------------------
    // Para Agencia Inscripción (REGISTRO)
    // ------------------------------------------------------------

    // ¿Es una organización sin fines de lucro?
    // Is it a non-profit organization?
    // Si (1) y No (2)
    nonProfit?: boolean;
    // ¿Posee Certificación de Registro de Educación Básica?
    // Does it have a Basic Education Registry Certificate?
    // En Proceso (3), Otorgado (4), Denegado (5)
    basicEducationRegistryId?: number;
    // ¿Ha sido denegado o descalificado de fondos estatales en los últimos siete años?
    // Si (1) y No (2)
    stateFundsDenied?: boolean;
    // ¿Ha sido denegado o descalificado de fondos federales en los últimos siete años?
    // Si (1) y No (2)
    federalFundsDenied?: boolean;
    // ¿El Auspiciador ofrece programas atléticos organizados que participan en deportes competitivos interestelares o a nivel comunitario?
    // Si (1) y No (2)
    organizedAthleticPrograms?: boolean;
    // ¿Está interesado en participar en el servicio de merienda y cena en riesgo?
    // Is the Sponsor interested in participating in the at-risk snack and dinner service?
    // Si (1) y No (2)
    atRiskService?: boolean;
    // Service Time
    serviceTime?: Date;
    // ¿En qué estatus se encuentra su Exención Contributiva?
    // In what status is your Tax Exemption?
    // En Proceso (3), Otorgado (4), Denegado (5)
    taxExemptionStatusId?: number;
    // ¿Qué tipo de Exención Contributiva tiene?
    // What type of Tax Exemption does it have?
    // Estatal (11), Federal (12)
    taxExemptionTypeId?: number;
    // Tipo de Entidad
    // Type of Entity
    // Gobierno (13), Privado (14)
    typeOfEntityId?: number;
    // Tipo de Solicitante
    // Type of Applicant
    // Laico (15), Base de fe (16)
    typeOfApplicantId?: number;
    // ¿De poseer un contrato Público Alianza especifique su modalidad?
    // If you have a Public Alliance contract, please specify the type of contract
    // Socio-Económico (17), Híbrido (18)
    publicAllianceContractId?: number;
    // National Youth Program
    // ¿Su Institución es un Programa Nacional de Juventud?
    // Si (1) y No (2)
    nationalYouthProgram?: boolean;
    // ¿Es usted una Agencia Auspiciadora de Hogares? (Solo para programa PACNA)
    // Are you a Day Care Homes? (Only for PACNA program)
    // Si (1) y No (2)
    isDayCareHome?: boolean;
}

export interface UpdateAgencyProgramRequest {
    agencyId?: number;
    statusId?: number;
    programId?: number;
    userId?: string;
}

// Para modificar la inscripción de la agencia (NO REGISTRO)
export interface UpdateAgencyInscriptionRequest {
    agencyId?: number;
    statusId?: number;
    rejectionJustification?: string;
    appointmentCoordinated?: boolean;
    appointmentDate?: string;
}
