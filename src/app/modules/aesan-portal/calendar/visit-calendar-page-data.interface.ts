import { VisitTypeDropdownItem } from 'app/shared/models/agency/SiteVisit';
import { SiteResponse } from 'app/shared/models/response/SiteResponse';

/** Igual que site-calendar: `route.snapshot.data['data']` tras el resolver (payloads ya en .body). */
export interface VisitCalendarPageData {
  siteId: number;
  site: SiteResponse | null;
  visitTypes: VisitTypeDropdownItem[];
}
