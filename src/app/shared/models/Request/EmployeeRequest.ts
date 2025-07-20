export interface EmployeeRequest {
  id?: number;
  firstName: string;
  middleName?: string;
  fatherLastName: string;
  motherLastName: string;
  statusId: number;
  titleId: number;
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
