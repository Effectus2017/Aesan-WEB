/** Visita de sitio (calendario sponsor-evaluation). */
export interface SiteVisit {
  id: number;
  siteId: number;
  siteName: string;
  visitTypeId: number;
  visitTypeCode: string;
  visitTypeNameEs: string;
  visitTypeNameEN: string;
  date: string;
  startTime: string;
  endTime: string;
  comment?: string | null;
}

export interface VisitTypeDropdownItem {
  id: number;
  code: string;
  nameEs: string;
  nameEN: string;
  sortOrder: number;
  ruleMaxWeeksFromProgramStart?: number | null;
}

export interface SiteVisitCalendarResponse {
  agencyId: number;
  agencyName: string;
  visits: SiteVisit[];
}
