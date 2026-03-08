import { FormGroup } from '@angular/forms';
import { SiteOperatingDay } from 'app/shared/models/site/SiteOperatingDay';
import { SiteChildGroupResponse } from 'app/shared/models/response/SiteChildGroupResponse';

export interface SiteCalendarServiceAddModalData {
  form: FormGroup;
  operatingDay: SiteOperatingDay;
  siteId: number;
  /** Grupos del sitio; el usuario debe seleccionar uno al agregar un servicio */
  childGroups?: SiteChildGroupResponse[];
  // Información para filtrar servicios según programa y day care
  programs?: number[]; // IDs de programas de la agencia
  isDayCareHome?: boolean; // Si es day care home (PACNA)
  // Horas de funcionamiento del sitio (opcional, para validación de rango)
  operatingStartTime?: string; // Hora de inicio del día de funcionamiento del sitio
  operatingEndTime?: string; // Hora de fin del día de funcionamiento del sitio
  /** Servicios ya existentes ese día por grupo; para excluir tipos y validar tiempo mínimo */
  existingServiceSlots?: Array<{
    childGroupId: number;
    serviceTypeId: number;
    startTime?: string;
    endTime?: string;
  }>;
}

