
export interface SiteStaff {
    id: number;
    siteId: number;
    staffId: number;
    assignmentDate: Date;
    isPrimary: boolean;
    startDate?: Date;
    endDate?: Date;
    comments?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt?: Date;
}
