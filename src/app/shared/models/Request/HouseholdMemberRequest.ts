export interface HouseholdMemberRequest {
  id?: number;
  applicationId: number;
  firstName: string;
  middleName?: string;
  fatherLastName: string;
  motherLastName: string;
  isStudent: boolean;
  schoolId?: number;
  grade?: string;
  isFoster: boolean;
  isMigrant: boolean;
  isHomeless: boolean;
  isRunaway: boolean;
  isActive: boolean;
}