import { FormGroup } from '@angular/forms';
import { SiteOperatingDay } from '../SiteOperatingDay';

export interface SiteCalendarAddModalData {
  form: FormGroup;
  operatingDay?: SiteOperatingDay;
  date?: Date;
  siteId: number;
}

