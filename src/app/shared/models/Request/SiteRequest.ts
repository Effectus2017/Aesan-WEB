import { SiteDayCareHomeRequest } from './SiteDayCareHomeRequest';
import { SiteParticipantRequest } from './SiteParticipantRequest';
import { SiteEducationLevelRequest } from './SiteEducationLevelRequest';
import { SiteChildGroupRequest } from './SiteChildGroupRequest';
import { SitePersonInChargeRequest } from './SitePersonInChargeRequest';

export interface SiteRequest {
    // ===== CAMPOS PRINCIPALES DE SITE =====
    id?: number;
    agencyId?: number;
    schoolId?: number;
    mainSiteId?: number;
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
    operatingStartTime?: string;
    operatingEndTime?: string;
    operatingDaysOfWeek?: number[]; // Días de la semana en que opera el sitio (1=Lunes, 2=Martes, ..., 7=Domingo)

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
    diningRoomCapacity?: number;

    // Persona a Cargo
    personInCharge?: SitePersonInChargeRequest;

    // Campos adicionales
    communityId?: number;
    walkersId?: number;
    siteTypeId?: number;
    experienceId?: number;
    reviewResultId?: number;
    reviewDate?: string;
    reviewJustification?: string;

    // Si el sitio es el principal
    isMainSite?: boolean;

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
     * De poseer un contrato Público Alianza, especifique su modalidad
     * If you have a Public Alliance contract, please specify the type of contract
     * Socio-Económico (17), Híbrido (18)
     */
    publicAllianceContractId?: number;

    /**
     * ¿Es un centro o institución afiliada?
     * Is it an affiliated center or institution?
     * Solo para programa PACNA
     */
    isAffiliatedCenter?: boolean;

    /**
     * ID que indica si el sitio es un Centro (No) o un Hogar (Sí)
     * ID indicating if the site is a Center (No) or a Home (Yes)
     * Solo para sitios de agencias con programa PACNA
     */
    isDayCareHomeId?: number;

    /**
     * IDs de programas de la agencia
     * Agency program IDs
     * Se obtiene desde el frontend para determinar la lógica de días de funcionamiento
     */
    programIds?: number[];

    // ===== RELACIONES CON MODELOS REQUEST =====
    dayCareHome?: SiteDayCareHomeRequest;
    participants?: SiteParticipantRequest[];
    educationLevels?: SiteEducationLevelRequest[];
    childGroups?: SiteChildGroupRequest[];
}
