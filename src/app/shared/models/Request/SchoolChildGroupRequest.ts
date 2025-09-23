export interface SchoolChildGroupRequest {
  id?: number;
  schoolId: number;
  groupName: string;
  groupNameEN: string;
  numberOfChildren: number;
}

export interface SchoolChildGroupResponse {
  id: number;
  schoolId: number;
  groupName: string;
  groupNameEN: string;
  numberOfChildren: number;
  createdAt: string;
  updatedAt?: string;
}
