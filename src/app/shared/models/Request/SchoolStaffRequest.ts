export interface SchoolStaffRequest {
    schoolId: number;
    staffId: number;
    assignmentTypeId: number;
    isPrimary: boolean;
    startDate?: Date;
    endDate?: Date;
    comments?: string;
}

export interface UpdateSchoolStaffRequest {
    assignmentTypeId: number;
    isPrimary: boolean;
    startDate?: Date;
    endDate?: Date;
    comments?: string;
}
