export interface SchoolStaff {
    id: number;
    schoolId: number;
    staffId: number;
    assignmentDate: Date;
    assignmentTypeId: number;
    isPrimary: boolean;
    startDate?: Date;
    endDate?: Date;
    comments?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt?: Date;
}

export interface SchoolStaffList {
    id: number;
    schoolId: number;
    staffId: number;
    assignmentDate: Date;
    assignmentTypeId: number;
    isPrimary: boolean;
    startDate?: Date;
    endDate?: Date;
    comments?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt?: Date;
}

export interface SiteStaff {
    id: number;
    siteId: number;
    staffId: number;
    assignmentDate: Date;
    assignmentTypeId: number;
    isPrimary: boolean;
    startDate?: Date;
    endDate?: Date;
    comments?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt?: Date;
}
