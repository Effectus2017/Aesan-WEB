import { FormGroup } from '@angular/forms';
import { SiteOperatingDayService } from 'app/shared/models/SiteOperatingDayService';
import { SiteOperatingDay } from 'app/shared/models/SiteOperatingDay';

export interface SiteCalendarServiceEditModalData {
  form: FormGroup;
  service: SiteOperatingDayService;
  siteId: number;
  operatingDay?: SiteOperatingDay;
  // Horas de funcionamiento del sitio (opcional, para validación de rango)
  operatingStartTime?: string; // Hora de inicio del día de funcionamiento del sitio
  operatingEndTime?: string; // Hora de fin del día de funcionamiento del sitio
}
