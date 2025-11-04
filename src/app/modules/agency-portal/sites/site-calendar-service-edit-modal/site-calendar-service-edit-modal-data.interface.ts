import { FormGroup } from '@angular/forms';
import { SiteOperatingDayService } from 'app/shared/models/SiteOperatingDayService';

export interface SiteCalendarServiceEditModalData {
  form: FormGroup;
  service: SiteOperatingDayService;
  siteId: number;
}
