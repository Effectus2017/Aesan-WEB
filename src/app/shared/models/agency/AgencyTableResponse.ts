import { AgencyStatusResponse } from './AgencyStatusResponse';
import { City } from '../location/City';
import { Program } from '../program/Program';
import { Region } from '../location/Region';
import { Staff } from '../staff/Staff';
import { InscriptionResponse } from './InscriptionResponse';

/**
 * Modelo de respuesta para filas de la tabla de agencias.
 * Misma estructura que AgencyResponse (contrato get-all-agencies-from-db cuando isList=false).
 * Se puede ir reduciendo de a poco según necesidad.
 */
export interface AgencyTableResponse {
  id?: number;
  name?: string;
  statusId?: number;
  sdrNumber?: number;
  uieNumber?: number;
  einNumber?: number;
  agencyCode?: string;
  address?: string;
  phone?: string;
  zipCode?: number;
  city?: City;
  region?: Region;
  latitude?: number;
  longitude?: number;
  postalAddress?: string;
  postalZipCode?: number;
  postalCity?: City;
  postalRegion?: Region;
  email?: string;
  createdAt?: Date;
  updatedAt?: Date;
  imageURL?: string;
  isRecurrent?: boolean;
  status?: AgencyStatusResponse;
  programs?: Program[];
  user?: Staff;
  assignedUsers?: Staff[];
  inscription?: InscriptionResponse;
}
