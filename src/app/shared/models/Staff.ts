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
  birthDate: string;
  email: string;
  postalAddress: string;
  cityId: number;
  cityName: string;
  regionId: number;
  regionName: string;
  areaCode: string;
  comments?: string;
  userId?: string;
  userName?: string;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
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
  email: string;
  cityName: string;
  regionName: string;
  userName?: string;
  isActive: boolean;
}
