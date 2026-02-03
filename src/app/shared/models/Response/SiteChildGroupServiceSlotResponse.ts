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
  /** Fechas de operación donde este servicio está cargado (formato "Jueves(6)"). */
  operatingDates?: ServiceSlotOperatingDate[];
}

/** Fecha de operación por slot (nombre del día + día del mes + fecha ISO para enviar al API). */
export interface ServiceSlotOperatingDate {
  dayName: string;
  dayOfMonth: number;
  /** Fecha en formato ISO o YYYY-MM-DD (desde la API; se envía en update-site-child-groups). */
  date?: string;
}

/** Slot mínimo para lista de serviceSlots en un grupo (sin id, childGroupId, etc.). */
export type SiteChildGroupServiceSlotMinimal = Pick<
  SiteChildGroupServiceSlotResponse,
  'serviceTypeId' | 'isOffered' | 'from' | 'to'
>;

/** Slot de servicio en contexto de calendario (startTime/endTime). */
export interface SiteCalendarServiceSlot {
  childGroupId: number;
  serviceTypeId: number;
  startTime?: string;
  endTime?: string;
}

/** Slot para mostrar en tabla (horas + nombre + label). */
export interface ServiceSlotDisplay {
  from?: string;
  to?: string;
  fromTime?: string;
  toTime?: string;
  serviceTypeName?: string;
  serviceTypeId?: number;
  label?: string;
}

/**
 * Normaliza un slot de respuesta (from/fromTime, to/toTime) al formato de request (fromTime, toTime).
 * Usar al cargar childGroups desde la API en formularios de sitios.
 */
export function normalizeServiceSlotFromResponse(
  slot: SiteChildGroupServiceSlotResponse
): SiteChildGroupServiceSlotRequest {
  return {
    serviceTypeId: slot.serviceTypeId,
    isOffered: slot.isOffered,
    fromTime: slot.from ?? slot.fromTime,
    toTime: slot.to ?? slot.toTime,
  };
}
