import { City } from './City';
import { Region } from './Region';
import { EducationLevel } from './EducationLevel';
import { OrganizationType } from './OrganizationType';
import { KitchenType } from './KitchenType';
import { GroupType } from './GroupType';
import { DeliveryType } from './DeliveryType';
import { SponsorType } from './SponsorType';
import { CenterType } from './CenterType';

export interface School {
  id: number;
  name: string;

  // Dirección Física
  address: string;
  zipCode: number;
  city: City;
  region: Region;
  latitude?: number;
  longitude?: number;

  // Dirección Postal
  postalAddress?: string;
  postalZipCode?: number;
  postalCity?: City;
  postalRegion?: Region;
  sameAsPhysicalAddress?: boolean;

  // Información Administrativa
  organizationType?: OrganizationType;
  centerType?: CenterType;
  nonProfit?: boolean;
  startDate?: string;
  baseYear?: number;
  renewalYear?: number;
  educationLevel?: EducationLevel;
  operatingDays?: string;

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
  EducationLevelId?: number;
  OperatingPeriodId?: number;
  OrganizationTypeId?: number;
  KitchenTypeId?: number;
  GroupTypeId?: number;
  DeliveryTypeId?: number;
  SponsorTypeId?: number;
  ApplicantTypeId?: number;
  ResidentialTypeId?: number;

  // Si la escuela es la principal
  isMainSchool?: boolean;
}
