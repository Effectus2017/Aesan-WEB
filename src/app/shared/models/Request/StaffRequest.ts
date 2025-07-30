export interface StaffRequest {
  id?: number;
  firstName: string;
  middleName?: string;
  fatherLastName: string;
  motherLastName: string;
  statusId: number;
  positionId: number;
  staffTypeId: number;
  birthDate: string;
  email: string;
  postalAddress: string;
  cityId: number;
  regionId: number;
  areaCode: string;
  comments?: string;
  userId?: string;
  isActive: boolean;
}
