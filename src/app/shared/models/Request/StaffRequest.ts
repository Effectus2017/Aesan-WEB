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
  birthDate?: string;
  email: string;
  postalAddress: string;
  cityId: number;
  regionId: number;
  areaCode: string;
  comments?: string;
  userId?: string;
  isActive: boolean;
  // Campos de revisión (solo para empleados)
  reviewResultId?: number;
  reviewDate?: string;
  reviewJustification?: string;
}
