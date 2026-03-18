import { SiteResponse } from './SiteResponse';
import { AgencyResponse } from '../agency/AgencyResponse';

/**
 * Datos que recibe el modal de vista de sitio (PACNA, PDAM o PSAV) en evaluación de auspiciadores.
 */
export interface SiteEditModalData {
  site: SiteResponse;
  agency?: AgencyResponse;
}
