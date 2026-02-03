/** Objeto de fecha de operación (desde API); en payload se envían solo strings. */
export interface ServiceSlotOperatingDateItem {
  dayName?: string;
  dayOfMonth?: number;
  date?: string;
}

/** Slot de servicio por grupo (SiteChildGroupService). La API espera fromTime y toTime (camelCase). */
export interface SiteChildGroupServiceSlotRequest {
  id?: number;
  serviceTypeId: number;
  isOffered: boolean;
  /** Hora inicio. */
  fromTime?: string;
  /** Hora fin. */
  toTime?: string;
  /** Fechas de operación: desde API es array de { date? }; en payload se envía string[] (ISO o YYYY-MM-DD). */
  operatingDates?: string[] | ServiceSlotOperatingDateItem[];
}
