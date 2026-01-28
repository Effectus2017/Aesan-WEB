import { SiteServiceRequest } from './SiteServiceRequest';

export interface SiteChildGroupRequest {
  id?: number;
  siteId: number;
  groupName: string;
  groupNameEN: string;
  numberOfChildren: number;
  services?: SiteServiceRequest[];
}

export interface SiteChildGroupResponse {
  id: number;
  siteId: number;
  groupName: string;
  groupNameEN: string;
  numberOfChildren: number;
  createdAt: string;
  updatedAt?: string;
}
