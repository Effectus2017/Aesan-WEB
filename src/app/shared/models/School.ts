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

export interface School {
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
  nonProfit?: boolean;
  startDate?: string;
  baseYear?: number;
  renewalYear?: number;
  educationLevel?: EducationLevel; // DEPRECATED - usar educationLevels
  educationLevels?: EducationLevel[]; // Nueva propiedad para múltiples niveles
  operatingDays?: number;

  // Información Operacional
  kitchenType?: KitchenType;
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

  // Servicios y Horarios
  breakfast?: boolean;
  breakfastFrom?: string;
  breakfastTo?: string;
  lunch?: boolean;
  lunchFrom?: string;
  lunchTo?: string;
  snack?: boolean;
  snackFrom?: string;
  snackTo?: string;

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
  // Si la escuela es la principal
  isMainSchool?: boolean;
  mainSchoolId?: number;
  mainSchool?: School;

  // Estado de actividad
  isActive?: boolean;
  inactiveJustification?: string;
  inactiveDate?: string;

  // Satélites
  satellites?: SchoolSatellite[];
}

export interface SchoolList {
  id: number;
  name: string;
}

export interface SchoolSatellite {
  id: number;
  mainSchoolId: number;
  satelliteSchoolId: number;
  satelliteSchoolName: string;
  assignmentDate: string;
  comment: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
