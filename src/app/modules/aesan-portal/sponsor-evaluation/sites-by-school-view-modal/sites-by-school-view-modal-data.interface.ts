import { AgencyResponse } from 'app/shared/models/agency/AgencyResponse';
import { SchoolSiteTableResponse } from 'app/shared/models/response/SchoolSiteTableResponse';
import type { SponsorEvaluationSiteViewVariant } from 'app/shared/models/response/SiteEditModalData';

/** Reexport: variante de programa en evaluación de auspiciadores. */
export type { SponsorEvaluationSiteViewVariant };

/** Datos que recibe `SitesBySchoolViewModalComponent` al abrirlo desde view-pdam, view-psav o view-pacna. */
export interface SitesBySchoolViewModalData {
  schoolId: number;
  schoolName: string;
  siteViewVariant: SponsorEvaluationSiteViewVariant;
  agency?: AgencyResponse;
  /** Filas opcionales para fallback si falla la carga remota. */
  data?: SchoolSiteTableResponse[];
}
