import { CalendarEvent } from 'angular-calendar';
import { GenericTableConfig, OnGenericTableHandler } from '../../../../shared/components/generic-table/generic-table.interface';
import { SiteCalendarTableModalComponent } from './site-calendar-table-modal.component';
import { SiteChildGroupResponse } from 'app/shared/models/response/SiteChildGroupResponse';

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
}
