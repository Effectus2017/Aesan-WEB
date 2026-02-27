import { AgencyStatusResponse } from './AgencyStatusResponse';
import { City } from '../City';
import { Program } from '../Program';
import { Region } from '../Region';
import { Staff } from '../Staff';
import { InscriptionResponse } from './InscriptionResponse';

/**
 * Modelo de respuesta para una agencia (contrato API).
 */
export interface AgencyResponse {
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
  // Campos adicionales usados en listas/UI
  isActive?: boolean;
  isListable?: boolean;
  appointmentCoordinated?: boolean;
  appointmentDate?: string;
  rejectionJustification?: string;
  deadlineToCompleteRegistration?: string;
}
