export interface SiteStaffRequest {
    siteId: number;
    staffId: number;
    isPrimary: boolean;
    startDate?: Date;
    endDate?: Date;
    comments?: string;
}

export interface UpdateSiteStaffRequest {
    isPrimary: boolean;
    startDate?: Date;
    endDate?: Date;
    comments?: string;
}
