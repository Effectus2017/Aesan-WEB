import type { Observable } from 'rxjs';
import { SiteVisit } from 'app/shared/models/agency/SiteVisit';
import { VisitTypeDropdownItem } from 'app/shared/models/agency/SiteVisit';
import { SiteVisitRequest } from 'app/shared/models/agency/SiteVisitRequest';

export interface AgencyAppointmentAddModalData {
  agencyId: number;
  siteId: number;
  visitTypes: VisitTypeDropdownItem[];
  date: Date;
  commitSave?: (request: SiteVisitRequest) => Observable<void>;
}

export interface AgencyAppointmentEditModalData {
  visit: SiteVisit;
  agencyId: number;
  siteId: number;
  visitTypes: VisitTypeDropdownItem[];
  commitSave?: (request: SiteVisitRequest) => Observable<void>;
  commitDelete?: () => Observable<void>;
}
