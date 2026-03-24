import { FormGroup } from '@angular/forms';
import { CalendarEvent } from 'angular-calendar';
import type { Observable } from 'rxjs';
import { SiteOperatingDay } from '../site/SiteOperatingDay';

export interface SiteCalendarEditModalData {
  form: FormGroup;
  event: CalendarEvent | null;
  operatingDay: SiteOperatingDay;
  siteId: number;
  /** Horario de operación del sitio (ej. "08:00:00"). Si no existe, no se restringe. */
  siteOperatingStartTime?: string;
  siteOperatingEndTime?: string;
  /** Edición iniciada desde la tabla del modal del día. */
  fromTable?: boolean;
  /** Id de fila en tabla (contexto fromTable). */
  tableRowId?: unknown;
  /** Persistencia: el modal permanece abierto hasta que el observable emita éxito. */
  commitSave?: (formValue: Record<string, unknown>) => Observable<void>;
  commitDelete?: () => Observable<void>;
}

