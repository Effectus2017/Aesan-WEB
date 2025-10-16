
export interface SchoolResponse {
    id: number;
    agencyId: number;
    name: string;
    schoolCode?: string;
    schoolNumber: number;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
    agency?: {
        id: number;
        name: string;
        code: string;
    };
    agencyName?: string;
    agencyCode?: string;
}
