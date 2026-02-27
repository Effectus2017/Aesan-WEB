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
  zipCode: string;
  agencyId?: number;
  agencyName?: string;
  comments?: string;
  userId?: string;
  userName?: string;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
  isSiteAdmin?: boolean;
  // Campos de revisión (solo para empleados)
  reviewResultId?: number;
  reviewDate?: string;
  reviewJustification?: string;

  // Campos específicos para Miembros de la Junta
  tenureDuration?: number; // Tiempo de duración del cargo (numérico)
  tenureDurationUnitId?: number; // Referencia a OptionSelection con optionKey = 'tenureDurationUnit'
  tenureDurationUnitName?: string;
  tenureDurationUnitNameEN?: string;
  receivesProgramSalaryId?: number; // Referencia a OptionSelection con optionKey = 'yesNo' (¿Recibe salario del programa?)
  receivesProgramSalaryName?: string;
  receivesProgramSalaryNameEN?: string;
  /** @deprecated Usar salaryOrigins. La API devuelve modelos completos. */
  salaryOriginIds?: number[];

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
  // Tenure duration unit (objeto completo)
  tenureDurationUnit?: OptionSelection;
  // Receives program salary (objeto completo)
  receivesProgramSalary?: OptionSelection;
  /** Origen del Salario (opciones seleccionadas para mat-select multiple) */
  salaryOrigins?: OptionSelection[];
  // School (objeto completo)
  school?: SiteListItem;
  /** Contratos por clasificación (Administrativo/Operacional), poblado en GetById */
  classificationContracts?: StaffClassificationContract[];
}

/** Contrato por clasificación (Administrativo u Operacional) de un staff */
export interface StaffClassificationContract {
  id: number;
  staffId: number;
  staffClassificationId: number;
  staffClassificationName?: string;
  staffClassificationNameEn?: string;
  positionId: number;
  positionName?: string;
  positionNameEn?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  scheduleFrom?: string;
  scheduleTo?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
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
  staffClassificationId?: number;
  staffClassificationName?: string;
  staffClassificationNameEn?: string;
  administrativePositionName?: string;
  administrativePositionNameEN?: string;
  operationalPositionName?: string;
  operationalPositionNameEN?: string;
  displayPosition?: string; // Campo calculado para mostrar en la tabla
  email: string;
  cityName: string;
  regionName: string;
  userName?: string;
  isActive: boolean;
  hasRelationships?: boolean;
  isSiteAdmin?: boolean;
  comments?: string;
}
