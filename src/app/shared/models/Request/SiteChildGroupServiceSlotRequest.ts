/** Slot de servicio por grupo (SiteChildGroupService). */
export interface SiteChildGroupServiceSlotRequest {
  id?: number;
  serviceTypeId: number;
  isOffered: boolean;
  from?: string;
  to?: string;
}
