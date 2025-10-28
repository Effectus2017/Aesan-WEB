import { FormGroup } from '@angular/forms';
import { CalendarEvent } from 'angular-calendar';
import { SiteOperatingDay } from '../SiteOperatingDay';

export interface SiteCalendarEditModalData {
  form: FormGroup;
  event: CalendarEvent | null;
  operatingDay: SiteOperatingDay;
  siteId: number;
}

