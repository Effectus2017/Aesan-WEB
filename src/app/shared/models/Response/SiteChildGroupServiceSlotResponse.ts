import { SiteChildGroupServiceSlotRequest } from '../Request/SiteChildGroupServiceSlotRequest';

/** Slot de servicio por grupo (SiteChildGroupService) desde la API. */
export interface SiteChildGroupServiceSlotResponse {
  id: number;
  childGroupId: number;
  serviceTypeId: number;
  isOffered: boolean;
  /** Hora inicio (API puede enviar `from` o `fromTime`). */
  from?: string;
  /** Hora fin (API puede enviar `to` o `toTime`). */
  to?: string;
  /** Alias usado por la API en lugar de `from`. */
  fromTime?: string;
  /** Alias usado por la API en lugar de `to`. */
  toTime?: string;
  createdAt?: string;
  updatedAt?: string;
  serviceTypeName?: string;
  serviceTypeNameEN?: string;
}

/**
 * Normaliza un slot de respuesta (from/fromTime, to/toTime) al formato de request (from, to).
 * Usar al cargar childGroups desde la API en formularios de sitios.
 */
export function normalizeServiceSlotFromResponse(
  slot: SiteChildGroupServiceSlotResponse
): SiteChildGroupServiceSlotRequest {
  return {
    serviceTypeId: slot.serviceTypeId,
    isOffered: slot.isOffered,
    from: slot.from ?? slot.fromTime,
    to: slot.to ?? slot.toTime,
  };
}
