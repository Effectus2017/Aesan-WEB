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
    // Si (1) y No (2)
    basicEducationRegistry?: boolean;
    // ¿Está interesado en participar de horario extendido? (Solo para PACNA)
    // Are you interested in participating in extended hours? (Only for PACNA)
    // Si (1) y No (2)
    extendedHours?: boolean;
    // ¿Desde cuándo su Entidad ofrece servicios? (Solo para PACNA)
    servicesOfferedSince?: string; // ISO date (YYYY-MM-DD)
    // ¿Ha sido denegado o descalificado de fondos estatales en los últimos siete años?
    // Si (1) y No (2)
    stateFundsDenied?: boolean;
    // ¿Razón por la cual fue descalificado o denegado de fondos estatales?
    // Reason why the sponsor was disqualified or denied state funds?
    // Se activa cuando stateFundsDenied = true
    stateFundsDeniedReason?: string;
    // ¿Ha sido denegado o descalificado de fondos federales en los últimos siete años?
    // Si (1) y No (2)
    federalFundsDenied?: boolean;
  // ¿Razón por la cual fue descalificado o denegado de fondos federales?
  // Reason why the sponsor was disqualified or denied federal funds?
  // Se activa cuando federalFundsDenied = true
  federalFundsDeniedReason?: string;
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
    // De poseer un contrato Público Alianza, especifique su modalidad
    // If you have a Public Alliance contract, please specify the type of contract
    // Socio-Económico (17), Híbrido (18)
    publicAllianceContractId?: number;
    // National Youth Program
    // ¿Su Institución es un Programa Nacional de Juventud?
    // Si (1) y No (2)
    nationalYouthProgram?: boolean;
    // ¿Es usted una Entidad Auspiciadora de Hogares? (Solo para programa PACNA)
    // Are you a Day Care Homes? (Only for PACNA program)
    // No (ID), Sí (ID), Ambos (ID) - Ahora usa OptionSelection
    isDayCareHomeId?: number;
    // ¿Su Entidad participa actualmente en alguno de los siguientes programas? (Solo para PSAV)
    // Does your Entity currently participate in any of the following programs? (Only for PSAV)
    // Early Head Start, Head Start, N/A
    participatesInHeadStartProgramId?: number | null;
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
