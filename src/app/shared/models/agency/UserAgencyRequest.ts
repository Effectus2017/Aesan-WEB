import { AgencyRequest } from './AgencyRequest';
import { StaffRequest } from '../request/StaffRequest';

/**
 * Modelo de petición para usuario-agencia (registro).
 */
export interface UserAgencyRequest {
  agency: AgencyRequest;
  staff?: StaffRequest;
}
