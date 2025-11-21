import { City } from "./City";
import { OptionSelection } from "./OptionSelection";
import { Region } from "./Region";
import { StaffClassification } from "./StaffClassification";
import { StaffType } from "./StaffType";
import { SiteListItem } from "./SiteListItem";
import { Site } from "./Site";

export interface Staff {
  id: number;
  firstName: string;
  middleName?: string;
  fatherLastName: string;
  motherLastName: string;
  statusId: number;
  statusName: string;
  positionId: number;
  positionName: string;
  staffTypeId: number;
  staffTypeName: string;
  staffTypeNameEn: string;
  staffClassificationId?: number;
  staffClassificationName?: string;
  staffClassificationNameEn?: string;
  contractStartDate?: string; // Fecha de inicio de contrato
  contractEndDate?: string; // Fecha de finalización de contrato
  birthDate: string;
  email: string;
  postalAddress: string;
  cityId: number;
  cityName: string;
  regionId: number;
  regionName: string;
  areaCode: string;
  agencyId?: number;
  agencyName?: string;
  comments?: string;
  userId?: string;
  userName?: string;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
  // Campos de revisión (solo para empleados)
  reviewResultId?: number;
  reviewDate?: string;
  reviewJustification?: string;

  // Datos de la relación SchoolStaff
  schoolId?: number;
  isPrimary?: boolean;
  // Site
  site?: Site;
  //
  city?: City;
  // Region
  region?: Region;
  // Status
  status?: OptionSelection;
  // Position
  position?: OptionSelection;
  // Staff type
  staffType?: StaffType;
  // Staff classification
  staffClassification?: StaffClassification;
  // School (objeto completo)
  school?: SiteListItem;
}

export interface StaffList {
  id: number;
  firstName: string;
  middleName?: string;
  fatherLastName: string;
  motherLastName: string;
  statusName: string;
  positionName: string;
  staffTypeName: string;
  staffTypeNameEn: string;
  staffClassificationName?: string;
  staffClassificationNameEn?: string;
  email: string;
  cityName: string;
  regionName: string;
  userName?: string;
  isActive: boolean;
}
