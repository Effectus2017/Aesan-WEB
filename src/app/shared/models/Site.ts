import { City } from './City';
import { Region } from './Region';
import { EducationLevel } from './EducationLevel';
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
import { SiteLocation } from './SiteLocation';
import { OptionSelection } from './OptionSelection';

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
  educationLevel?: EducationLevel; // DEPRECATED - usar educationLevels
  educationLevels?: EducationLevel[]; // Nueva propiedad para múltiples niveles
  operatingFromDate?: string;
  operatingToDate?: string;
  operatingDaysCalculated?: number;

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

  // Administrador/Representante Autorizado
  administratorAuthorizedName?: string;
  sitePhone?: string;
  extension?: string;
  mobilePhone?: string;

  // ===== RELACIONES CON MODELOS RESPONSE =====
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
}

export interface SiteList {
  id: number;
  name: string;
}

export interface SiteSatellite {
  id: number;
  mainSiteId: number;
  satelliteSiteId: number;
  satelliteSiteName: string;
  assignmentDate: string;
  comment: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
