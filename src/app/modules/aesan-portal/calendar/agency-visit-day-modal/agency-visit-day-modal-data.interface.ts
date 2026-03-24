import { Observable } from 'rxjs';
import { SiteVisit, VisitTypeDropdownItem } from 'app/shared/models/agency/SiteVisit';
import { SiteVisitRequest } from 'app/shared/models/agency/SiteVisitRequest';

/** Datos para el modal «Visitas del día» (lista + alta/edición encadenados). */
export interface AgencyVisitDayModalData {
  date: Date;
  /** Lectura en vivo desde el calendario padre tras recargar visitas. */
  getVisitsForDay: () => SiteVisit[];
  visitTypes: VisitTypeDropdownItem[];
  agencyId: number;
  siteId: number;
  commitCreateVisit$: (request: SiteVisitRequest) => Observable<void>;
  commitUpdateVisit$: (request: SiteVisitRequest) => Observable<void>;
  commitDeleteVisit$: (id: number) => Observable<void>;
}
