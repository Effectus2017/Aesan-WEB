import { FormGroup } from '@angular/forms';
import { SiteOperatingDay } from 'app/shared/models/SiteOperatingDay';

export interface SiteCalendarServiceAddModalData {
  form: FormGroup;
  operatingDay: SiteOperatingDay;
  siteId: number;
}

