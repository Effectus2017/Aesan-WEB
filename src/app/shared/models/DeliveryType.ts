export interface DeliveryType {
  id: number;
  name: string;
  nameEN: string;
  isActive: boolean;
  displayOrder: number;
  requiresPermission?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
