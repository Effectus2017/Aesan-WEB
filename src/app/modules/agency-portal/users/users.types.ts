export interface RequestUser {
  id?: string;
  firstName?: string | null;
  middleName?: string | null;
  fatherLastName?: string | null;
  motherLastName?: string | null;
  email?: string | null;
  userName?: string | null;
  imageURL?: string | null;
  roles?: string[];
  agencyId?: number | null;
  isActive?: boolean | null;
  isTemporalPasswordActived?: boolean | null;
  emailConfirmed?: boolean | null;
}

export interface ChangePassword {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

