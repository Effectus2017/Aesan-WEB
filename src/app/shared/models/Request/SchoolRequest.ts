import { SchoolServiceRequest } from './SchoolServiceRequest';
import { SchoolDayCareHomeRequest } from './SchoolDayCareHomeRequest';
import { SchoolParticipantRequest } from './SchoolParticipantRequest';
import { SchoolEducationLevelRequest } from './SchoolEducationLevelRequest';
import { SchoolChildGroupRequest } from './SchoolChildGroupRequest';

export interface SchoolRequest {
    // ===== CAMPOS PRINCIPALES DE SCHOOL =====
    id?: number;
    agencyId?: number;
    mainSchoolId?: number;
    name?: string;

    // Dirección Física
    address?: string;
    zipCode?: number;
    cityId?: number;
    regionId?: number;
    latitude?: number;
    longitude?: number;

    // Dirección Postal
    postalAddress?: string;
    postalZipCode?: number;
    postalCityId?: number;
    postalRegionId?: number;
    sameAsPhysicalAddress?: boolean;

    // Información Administrativa
    organizationTypeId?: number;
    centerTypeId?: number;

    nonProfit?: boolean;
    startDate?: string;
    baseYear?: number;
    renewalYear?: number;
    operatingFromDate?: string;
    operatingToDate?: string;
    operatingDaysCalculated?: number;

    /**
     * ¿Cuánto tiempo lleva el sitio ofreciendo servicios con una matrícula establecida?
     * How long has the school/site been providing services with an established enrollment)
     */
    serviceTime?: string;

    // Información Operacional
    kitchenTypeId?: number;
    groupTypeId?: number;
    deliveryTypeId?: number;
    sponsorTypeId?: number;
    applicantTypeId?: number;
    areaTypeId?: number;
    locationTypeId?: number;
    residentialTypeId?: number;
    operatingPolicyId?: number;
    hasWarehouse?: boolean;
    hasDiningRoom?: boolean;

    // Administrador/Representante Autorizado
    administratorAuthorizedName?: string;
    sitePhone?: string;
    extension?: string;
    mobilePhone?: string;

    // Campos adicionales
    communityId?: number;
    walkersId?: number;
    siteTypeId?: number;
    experienceId?: number;
    reviewResultId?: number;
    reviewDate?: string;
    reviewJustification?: string;

    // Si la escuela es la principal
    isMainSchool?: boolean;

    // Site Location - Determined by Group Type
    // Mobile: for "Servicio en Camiones" (Truck Service)
    // Fixed: for all other group types
    siteLocationId?: number;

    // Estado de actividad
    isActive?: boolean;
    inactiveJustification?: string;
    inactiveDate?: string;

    // Matrícula General
    generalEnrollment?: number;

    // Número de Sitio
    siteNumber?: number;

    // ===== CAMPOS ESPECÍFICOS PARA PACNA =====

    /**
     * ¿El sitio ofrece programas atléticos organizados que participan en deportes competitivos interescolares o a nivel comunitario?
     * Does the site offer organized athletic programs engaged in interscholastic or community level competitive sports?
     * Solo para programa PACNA
     */
    organizedAthleticPrograms?: boolean;

    /**
     * ¿El sitio está interesado en participar en el servicio de merienda y cena en riesgo?
     * Is the site interested in participating in the at-risk snack and dinner service?
     * Solo para programa PACNA
     */
    atRiskService?: boolean;

    /**
     * Indica si la agencia es Day Care Home
     * Indicates if the agency is Day Care Home
     * Se obtiene de la inscripción de la agencia
     */
    isDayCareHome?: boolean;

    // ===== RELACIONES CON MODELOS REQUEST =====
    services?: SchoolServiceRequest[];
    dayCareHome?: SchoolDayCareHomeRequest;
    participants?: SchoolParticipantRequest[];
    educationLevels?: SchoolEducationLevelRequest[];
    childGroups?: SchoolChildGroupRequest[];
}
