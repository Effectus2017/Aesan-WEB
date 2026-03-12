import { FormGroup } from '@angular/forms';
import { CalendarEvent } from 'angular-calendar';
import { SiteOperatingDay } from '../site/SiteOperatingDay';

export interface SiteCalendarEditModalData {
  form: FormGroup;
  event: CalendarEvent | null;
  operatingDay: SiteOperatingDay;
  siteId: number;
  /** Horario de operación del sitio (ej. "08:00:00"). Si no existe, no se restringe. */
  siteOperatingStartTime?: string;
  siteOperatingEndTime?: string;
}

