export interface SponsorType {
  id: number;
  name: string;
  nameEN: string;
  isActive: boolean;
  displayOrder: number;
  selectionNotification?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
