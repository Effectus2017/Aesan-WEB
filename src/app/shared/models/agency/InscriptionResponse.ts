import { OptionSelection } from '../common/OptionSelection';

/**
 * Modelo de respuesta para la inscripción de una agencia (API).
 */
export interface InscriptionResponse {
  appointmentCoordinated?: boolean;
  appointmentDate?: string | null;
  basicEducationRegistry?: boolean | null;
  extendedHours?: boolean | null;
  comments?: string | null;
  deadlineToCompleteRegistration?: string | null;
  completedRegistrationDate?: string | null;
  federalFundsDenied?: boolean;
  federalFundsDeniedReason?: string | null;
  id?: number;
  isDayCareHomeId?: number;
  isDayCareHome?: OptionSelection | null;
  nationalYouthProgram?: boolean;
  nonProfit?: boolean;
  publicAllianceContract?: OptionSelection | null;
  publicAllianceContractId?: number | null;
  rejectionJustification?: string | null;
  stateFundsDenied?: boolean;
  stateFundsDeniedReason?: string | null;
  taxExemptionStatus?: OptionSelection | null;
  taxExemptionStatusId?: number | null;
  taxExemptionType?: OptionSelection | null;
  taxExemptionTypeId?: number | null;
  typeOfApplicant?: OptionSelection | null;
  typeOfApplicantId?: number | null;
  typeOfEntity?: OptionSelection | null;
  typeOfEntityId?: number | null;
  participatesInHeadStartProgramId?: number | null;
  participatesInHeadStartProgram?: OptionSelection | null;
  servicesOfferedSince?: string | null;
  boardMeetingsPerYear?: number | null;
  boardMeetsRegularly?: boolean | null;
  boardExecutiveAuthority?: OptionSelection[] | null;
}
