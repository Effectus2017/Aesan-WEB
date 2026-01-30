/** Slot de servicio por grupo (SiteChildGroupService) desde la API. */
export interface SiteChildGroupServiceSlotResponse {
  id: number;
  childGroupId: number;
  serviceTypeId: number;
  isOffered: boolean;
  from?: string;
  to?: string;
  createdAt?: string;
  updatedAt?: string;
  serviceTypeName?: string;
  serviceTypeNameEN?: string;
}
