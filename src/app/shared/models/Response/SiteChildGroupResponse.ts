import { SiteChildGroupServiceSlotResponse } from './SiteChildGroupServiceSlotResponse';

export interface SiteChildGroupResponse {
  id: number;
  siteId: number;
  groupName: string;
  groupNameEN?: string;
  numberOfChildren: number;
  createdAt: string;
  updatedAt?: string;
  serviceSlots?: SiteChildGroupServiceSlotResponse[];
}
