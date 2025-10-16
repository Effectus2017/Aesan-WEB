export interface SiteChildGroupRequest {
  id?: number;
  siteId: number;
  groupName: string;
  groupNameEN: string;
  numberOfChildren: number;
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
