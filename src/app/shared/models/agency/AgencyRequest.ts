/**
 * Modelo de petición para crear/actualizar una agencia.
 */
export interface AgencyRequest {
  name?: string;
  statusId?: number;
  sdrNumber?: number;
  uieNumber?: number;
  einNumber?: number;
  address?: string;
  zipCode?: string;
  cityId?: number;
  regionId?: number;
  latitude?: number;
  longitude?: number;
  postalAddress?: string;
  postalCityId?: number;
  postalRegionId?: number;
  postalZipCode?: string;
  imageUrl?: string;
  email?: string;
  phone?: string;
  administrationTitle?: string;
  isActive?: boolean;
  isListable?: boolean;
  programs?: number[];
  monitorId?: string;
  assignedBy?: string;
  nonProfit?: boolean;
  basicEducationRegistry?: boolean;
  extendedHours?: boolean;
  servicesOfferedSince?: string;
  stateFundsDenied?: boolean;
  stateFundsDeniedReason?: string;
  federalFundsDenied?: boolean;
  federalFundsDeniedReason?: string;
  taxExemptionStatusId?: number;
  taxExemptionTypeId?: number;
  typeOfEntityId?: number;
  typeOfApplicantId?: number;
  publicAllianceContractId?: number;
  nationalYouthProgram?: boolean;
  isDayCareHomeId?: number;
  participatesInHeadStartProgramId?: number | null;
  boardMeetingsPerYear?: number;
  boardMeetsRegularly?: boolean;
  boardExecutiveAuthority?: number[];
}
