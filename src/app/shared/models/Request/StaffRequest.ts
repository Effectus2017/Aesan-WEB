export interface StaffRequest {
  id?: number;
  firstName: string;
  middleName?: string;
  fatherLastName: string;
  motherLastName: string;
  statusId: number;
  positionId: number;
  staffTypeId: number;
  staffClassificationId?: number;
  contractStartDate?: string; // Fecha de inicio de contrato
  contractEndDate?: string; // Fecha de finalización de contrato
  birthDate?: string;
  email: string;
  postalAddress: string;
  cityId: number;
  regionId: number;
  areaCode: string;
  agencyId?: number;
  comments?: string;
  userId?: string;
  isActive: boolean;
  // Campos de revisión (solo para empleados)
  reviewResultId?: number;
  reviewDate?: string;
  reviewJustification?: string;
}
