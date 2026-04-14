import { SiteResponse } from './SiteResponse';
import { AgencyResponse } from '../agency/AgencyResponse';

/** Variante de programa en evaluación de auspiciadores (servicios por grupo, resolución de tipos). */
export type SponsorEvaluationSiteViewVariant = 'pdam' | 'psav' | 'pacna-centro' | 'pacna-hogar';

/**
 * Datos que recibe el modal de vista de sitio (PACNA, PDAM o PSAV) en evaluación de auspiciadores.
 */
export interface SiteEditModalData {
  site: SiteResponse;
  agency?: AgencyResponse;
  /** Contexto evaluación AESAN: necesario para resolver tipos de servicio al mostrar servicios por grupo. */
  siteViewVariant?: SponsorEvaluationSiteViewVariant;
}
