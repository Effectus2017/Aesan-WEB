export interface SiteStaffRequest {
    siteId: number;
    staffId: number;
    assignmentTypeId: number;
    isPrimary: boolean;
    startDate?: Date;
    endDate?: Date;
    comments?: string;
}

export interface UpdateSiteStaffRequest {
    assignmentTypeId: number;
    isPrimary: boolean;
    startDate?: Date;
    endDate?: Date;
    comments?: string;
}
