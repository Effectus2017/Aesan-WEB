import { FormGroup } from '@angular/forms';
import { SiteOperatingDay } from 'app/shared/models/SiteOperatingDay';

export interface SiteCalendarServiceAddModalData {
  form: FormGroup;
  operatingDay: SiteOperatingDay;
  siteId: number;
  // Información para filtrar servicios según programa y day care
  programs?: number[]; // IDs de programas de la agencia
  isDayCareHome?: boolean; // Si es day care home (PACNA)
  // Horas de funcionamiento del sitio (opcional, para validación de rango)
  operatingStartTime?: string; // Hora de inicio del día de funcionamiento del sitio
  operatingEndTime?: string; // Hora de fin del día de funcionamiento del sitio
}

