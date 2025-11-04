import { FormGroup } from '@angular/forms';
import { SiteOperatingDayService } from 'app/shared/models/SiteOperatingDayService';
import { SiteOperatingDay } from 'app/shared/models/SiteOperatingDay';

export interface SiteCalendarServiceEditModalData {
  form: FormGroup;
  service: SiteOperatingDayService;
  siteId: number;
  operatingDay?: SiteOperatingDay;
}
