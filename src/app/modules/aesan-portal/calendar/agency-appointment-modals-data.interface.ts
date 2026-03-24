import type { Observable } from 'rxjs';
import { AgencyAppointment } from 'app/shared/models/agency/AgencyAppointment';
import { AgencyAppointmentRequest } from 'app/shared/models/agency/AgencyAppointmentRequest';

export interface AgencyAppointmentAddModalData {
  agencyId: number;
  date: Date;
  commitSave?: (request: AgencyAppointmentRequest) => Observable<void>;
}

export interface AgencyAppointmentEditModalData {
  appointment: AgencyAppointment;
  commitSave?: (request: AgencyAppointmentRequest) => Observable<void>;
  commitDelete?: () => Observable<void>;
}
