export interface UpdateStaffActiveStatusRequest {
  staffId: number;
  isActive: boolean;
  inactiveDate?: string | null;
  inactiveJustification?: string | null;
  accessCancellationJustification?: string | null;
  accessCancellationConfirmedAt?: string | null;
}
