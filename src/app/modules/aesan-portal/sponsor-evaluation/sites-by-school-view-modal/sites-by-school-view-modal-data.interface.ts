import { AgencyResponse } from 'app/shared/models/agency/AgencyResponse';
import { SchoolSiteTableResponse } from 'app/shared/models/response/SchoolSiteTableResponse';

/** Programa / variante de modal de solo lectura para un sitio (evaluación de auspiciadores). */
export type SponsorEvaluationSiteViewVariant = 'pdam' | 'psav' | 'pacna-centro' | 'pacna-hogar';

/** Datos que recibe `SitesBySchoolViewModalComponent` al abrirlo desde view-pdam, view-psav o view-pacna. */
export interface SitesBySchoolViewModalData {
  schoolId: number;
  schoolName: string;
  siteViewVariant: SponsorEvaluationSiteViewVariant;
  agency?: AgencyResponse;
  /** Filas opcionales para fallback si falla la carga remota. */
  data?: SchoolSiteTableResponse[];
}
