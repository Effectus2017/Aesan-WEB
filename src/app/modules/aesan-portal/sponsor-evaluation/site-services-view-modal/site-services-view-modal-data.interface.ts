import { SiteEditModalData } from 'app/shared/models/response/SiteEditModalData';
import { SponsorEvaluationSiteViewVariant } from '../sites-by-school-view-modal/sites-by-school-view-modal-data.interface';

/** Datos del modal de solo lectura de servicios por grupo (evaluación de auspiciadores). */
export interface SiteServicesViewModalData extends SiteEditModalData {
  siteViewVariant: SponsorEvaluationSiteViewVariant;
}
