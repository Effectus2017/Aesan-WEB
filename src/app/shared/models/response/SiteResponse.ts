import { City } from '../location/City';
import { Region } from '../location/Region';
import { EducationLevelResponse } from './EducationLevelResponse';
import { OrganizationType } from '../catalog/OrganizationType';
import { KitchenType } from '../catalog/KitchenType';
import { GroupType } from '../catalog/GroupType';
import { DeliveryType } from '../catalog/DeliveryType';
import { SponsorType } from '../catalog/SponsorType';
import { CenterType } from '../catalog/CenterType';
import { AreaType } from '../catalog/AreaType';
import { SiteDayCareHomeResponse } from './SiteDayCareHomeResponse';
import { SiteParticipantResponse } from './SiteParticipantResponse';
import { SitePersonInChargeResponse } from './SitePersonInChargeResponse';
import { SiteChildGroupResponse } from './SiteChildGroupResponse';
import { SiteLocation } from '../site/SiteLocation';
import { OptionSelection } from '../common/OptionSelection';
import { SiteSatellite } from '../site/SiteSatellite';
import { SchoolResponse } from './SchoolResponse';
import { DayOfWeekResponse } from '../calendar/DayOfWeekResponse';

/**
 * Modelo de respuesta de la API para un sitio (equivalente a Api.Models.SiteResponse).
 */
export interface SiteResponse {
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
  operatingDaysOfWeek?: DayOfWeekResponse[];
  operatingStartTime?: string;
  operatingEndTime?: string;

  /** Inicio de la primera clase académica (Horario Académico PDAM) */
  firstAcademicClassStartTime?: string;
  /** Finalización de la última clase académica (Horario Académico PDAM) */
  lastAcademicClassEndTime?: string;

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
  diningRoomCapacity?: number;

  // ===== RELACIONES CON MODELOS RESPONSE =====
  personInCharge?: SitePersonInChargeResponse;
  dayCareHome?: SiteDayCareHomeResponse;
  participants?: SiteParticipantResponse[];
  childGroups?: SiteChildGroupResponse[];

  // Campos adicionales
  communityId?: number;
  walkersId?: number;
  siteTypeId?: number;
  experienceId?: number;
  reviewResultId?: number;
  /** Catálogo resuelto (p. ej. PSAV/PACNA vista de sitio). */
  reviewResult?: OptionSelection;
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
  mainSite?: SiteResponse;

  typeOfApplicant?: OptionSelection;
  relationshipType?: OptionSelection;

  // Site Location
  siteLocationId?: number;

  // Estado de actividad
  isActive?: boolean;
  inactiveJustification?: string;
  inactiveDate?: string;
  /**
   * ¿Brindó servicio de raciones durante su periodo de funcionamiento?
   * Did it provide ration service during its operating period?
   * Solo se usa cuando el sitio está inactivo
   */
  providedRationsService?: boolean | null;

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

  allowedOperatingDays?: DayOfWeekResponse[];
}
