export interface StaffType {
  id: number;
  name: string;
  nameEn: string;
  optionKey: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface StaffTypeList {
  id: number;
  name: string;
  nameEn: string;
  optionKey: string;
  sortOrder: number;
  isActive: boolean;
}
