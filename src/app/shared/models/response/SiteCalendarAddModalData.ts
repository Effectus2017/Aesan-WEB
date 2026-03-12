import { FormGroup } from '@angular/forms';
import { SiteOperatingDay } from '../site/SiteOperatingDay';

export interface SiteCalendarAddModalData {
  form: FormGroup;
  operatingDay?: SiteOperatingDay;
  date?: Date;
  siteId: number;
  /** Horario de operación del sitio (ej. "08:00:00"). Si no existe, no se restringe. */
  siteOperatingStartTime?: string;
  siteOperatingEndTime?: string;
}

