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

    // ===== RELACIONES CON MODELOS REQUEST =====
    services?: SchoolServiceRequest[];
    dayCareHome?: SchoolDayCareHomeRequest;
    participants?: SchoolParticipantRequest[];
    educationLevels?: SchoolEducationLevelRequest[];
    childGroups?: SchoolChildGroupRequest[];
}
