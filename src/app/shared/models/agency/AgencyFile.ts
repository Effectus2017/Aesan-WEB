
export interface AgencyFile {
    id: number;
    fileName: string;
    fileUrl: string;
    contentType: string;
    fileSize: number;
    description?: string;
    documentType?: string;
    uploadedBy: string;
    uploadedAt: Date;
    isVerified: boolean;
    isActive: boolean;
}
