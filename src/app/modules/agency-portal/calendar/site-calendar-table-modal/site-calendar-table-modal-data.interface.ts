import { CalendarEvent } from 'angular-calendar';
import type { Observable } from 'rxjs';
import { GenericTableConfig, OnGenericTableHandler } from '../../../../shared/components/generic-table/generic-table.interface';
import { SiteCalendarTableModalComponent } from './site-calendar-table-modal.component';
import { SiteChildGroupResponse } from 'app/shared/models/response/SiteChildGroupResponse';
import { SiteOperatingDay } from 'app/shared/models/site/SiteOperatingDay';

export interface SiteCalendarTableModalData {
  date: Date;
  events: CalendarEvent[];
  tableConfig: GenericTableConfig;
  handler: OnGenericTableHandler;
  siteId: number;
  /** Grupos del sitio; necesario para asociar servicios a un grupo al agregar desde el calendario */
  childGroups?: SiteChildGroupResponse[];
  onEventAdded?: () => void; // Callback para actualizar la tabla
  onEventUpdated?: () => void; // Callback para actualizar la tabla después de editar
  modalComponent?: SiteCalendarTableModalComponent; // Referencia al componente del modal
  /** Límites de horario del sitio para modales hijos (alta de día). */
  siteOperatingStartTime?: string;
  siteOperatingEndTime?: string;
  commitAddOperatingDay?: (operatingDay: SiteOperatingDay, formValue: Record<string, unknown>) => Observable<void>;
  commitCreateService?: (operatingDayId: number, formValue: Record<string, unknown>) => Observable<void>;
}
