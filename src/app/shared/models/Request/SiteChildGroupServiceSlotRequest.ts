/** Slot de servicio por grupo (SiteChildGroupService). La API espera fromTime y toTime (camelCase). */
export interface SiteChildGroupServiceSlotRequest {
  id?: number;
  serviceTypeId: number;
  isOffered: boolean;
  /** Hora inicio. */
  fromTime?: string;
  /** Hora fin. */
  toTime?: string;
}
