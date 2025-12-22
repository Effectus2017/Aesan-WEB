import { City } from './City';
import { Region } from './Region';
import { EducationLevelResponse } from './Response/EducationLevelResponse';
import { OrganizationType } from './OrganizationType';
import { KitchenType } from './KitchenType';
import { GroupType } from './GroupType';
import { DeliveryType } from './DeliveryType';
import { SponsorType } from './SponsorType';
import { CenterType } from './CenterType';
import { AreaType } from './AreaType';
import { SiteServiceResponse } from './Response/SiteServiceResponse';
import { SiteDayCareHomeResponse } from './Response/SiteDayCareHomeResponse';
import { SiteParticipantResponse } from './Response/SiteParticipantResponse';
import { SitePersonInChargeResponse } from './Response/SitePersonInChargeResponse';
import { SiteLocation } from './SiteLocation';
import { OptionSelection } from './OptionSelection';
import { SiteSatellite } from './SiteSatellite';
import { SchoolResponse } from './Response/SchoolResponse';

export interface Site {
  id: number;
  agencyId: number;
  name: string;

  // Dirección
  cityId?: number;
  regionId?: number;

  // Dirección Física
  address: string;
  zipCode: number;
  city?: City;
  region?: Region;
  latitude?: number;
  longitude?: number;

  // Dirección Postal
  postalCityId?: number;
  postalRegionId?: number;
  postalAddress?: string;
  postalZipCode?: number;
  postalCity?: City;
  postalRegion?: Region;
  sameAsPhysicalAddress?: boolean;

  // Información Administrativa
  organizationType?: OrganizationType;
  centerType?: CenterType;
  areaType?: AreaType;
  locationType?: AreaType;
  nonProfit?: boolean;
  startDate?: string;
  baseYear?: number;
  renewalYear?: number;
  educationLevel?: EducationLevelResponse; // DEPRECATED - usar educationLevels
  educationLevels?: EducationLevelResponse[]; // Nueva propiedad para múltiples niveles
  operatingFromDate?: string;
  operatingToDate?: string;
  operatingDaysCalculated?: number;
  operatingDaysOfWeek?: number[];
  operatingStartTime?: string;
  operatingEndTime?: string;

  /**
   * ¿Cuánto tiempo lleva el sitio ofreciendo servicios con una matrícula establecida?
   * How long has the school/site been providing services with an established enrollment?
   */
  serviceTime?: string;

  // Información Operacional
  kitchenType?: KitchenType;
  siteLocation?: SiteLocation;
  groupType?: GroupType;
  deliveryType?: DeliveryType;
  sponsorType?: SponsorType;
  applicantType?: any;
  residentialType?: any;
  operatingPolicy?: any;

  hasWarehouse?: boolean;
  hasDiningRoom?: boolean;

  // ===== RELACIONES CON MODELOS RESPONSE =====
  personInCharge?: SitePersonInChargeResponse;
  services?: SiteServiceResponse[];
  dayCareHome?: SiteDayCareHomeResponse;
  participants?: SiteParticipantResponse[];

  // Campos adicionales
  communityId?: number;
  walkersId?: number;
  siteTypeId?: number;
  experienceId?: number;
  reviewResultId?: number;
  reviewDate?: string;
  reviewJustification?: string;

  // Id de la escuela
  centerTypeId?: number;
  educationLevelId?: number; // DEPRECATED - usar educationLevelIds
  educationLevelIds?: number[]; // Nueva propiedad para múltiples IDs
  operatingPeriodId?: number;
  organizationTypeId?: number;
  kitchenTypeId?: number;
  groupTypeId?: number;
  deliveryTypeId?: number;
  sponsorTypeId?: number;
  applicantTypeId?: number;
  residentialTypeId?: number;
  operatingPolicyId?: number;
  areaTypeId?: number;
  // Si el sitio es el principal
  isMainSite?: boolean;
  mainSiteId?: number;
  mainSite?: Site;

  typeOfApplicant?: OptionSelection;
  relationshipType?: OptionSelection;

  // Site Location
  siteLocationId?: number;

  // Estado de actividad
  isActive?: boolean;
  inactiveJustification?: string;
  inactiveDate?: string;

  // Satélites
  satellites?: SiteSatellite[];

  // Matrícula General
  generalEnrollment?: number;

  // Número de Sitio y Código de Agencia
  siteNumber?: number;
  agencyCode?: string;
  siteCode?: string;

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
  publicAllianceContract?: OptionSelection;

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
  isDayCareHome?: OptionSelection;

  // Escuela relacionada
  school?: SchoolResponse;
  schoolName?: string; // Propiedad de conveniencia para mostrar el nombre de la escuela
}


