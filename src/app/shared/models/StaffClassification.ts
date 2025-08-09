export interface StaffClassification {
  id: number;
  name: string;
  nameEn: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface StaffClassificationList {
  id: number;
  name: string;
  nameEn: string;
  sortOrder: number;
}
