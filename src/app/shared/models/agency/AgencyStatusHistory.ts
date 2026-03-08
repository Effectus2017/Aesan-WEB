export interface AgencyStatusHistory {
  id: number;
  agencyId: number;
  /** Nombre de la agencia; en UI se muestra como "Auspiciador". */
  agencyName?: string;
  statusId: number;
  statusName: string;
  changedBy: string;
  changedByName: string;
  changedAt: string;
  justification?: string;
}

export interface AgencyStatusHistoryPagedResponse {
  data: AgencyStatusHistory[];
  totalCount: number;
  page: number;
  pageSize: number;
}