import type { SiteEditModalData, SponsorEvaluationSiteViewVariant } from 'app/shared/models/response/SiteEditModalData';

/** Datos del modal de solo lectura de servicios por grupo (evaluación de auspiciadores). */
export interface SiteServicesViewModalData extends SiteEditModalData {
  siteViewVariant: SponsorEvaluationSiteViewVariant;
}
