/** Payload crear/actualizar visita de sitio. */
export interface SiteVisitRequest {
  id?: number;
  agencyId: number;
  siteId: number;
  visitTypeId: number;
  /** YYYY-MM-DD */
  visitDate: string;
  startTime: string;
  endTime: string;
  comment?: string | null;
}
