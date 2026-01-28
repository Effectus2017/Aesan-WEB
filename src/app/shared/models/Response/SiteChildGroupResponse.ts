import { SiteServiceResponse } from './SiteServiceResponse';

export interface SiteChildGroupResponse {
  id: number;
  siteId: number;
  groupName: string;
  numberOfChildren: number;
  createdAt: string;
  updatedAt?: string;
  services?: SiteServiceResponse[];
}
