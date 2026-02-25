export interface AgencyStatusHistory {
  id: number;
  agencyId: number;
  statusId: number;
  statusName: string;
  changedBy: string;
  changedByName: string;
  changedAt: string;
  justification?: string;
  previousStatusId?: number;
  previousStatusName?: string;
}

export interface AgencyStatusHistoryPagedResponse {
  data: AgencyStatusHistory[];
  totalCount: number;
  page: number;
  pageSize: number;
}
