export interface ProgramRequest {
    id: string;
    title: string;
    createdBy: string;
    createdAt: Date;
    agency: string;
    status: 'pending' | 'approved' | 'rejected';
}
