export interface SchoolStaffRequest {
  schoolId: number;
  staffId: number;
  isPrimary: boolean;
  startDate?: Date;
  endDate?: Date;
  comments?: string;
}

export interface UpdateSchoolStaffRequest {
  isPrimary: boolean;
  startDate?: Date;
  endDate?: Date;
  comments?: string;
}
