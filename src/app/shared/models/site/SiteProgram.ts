export interface SiteProgram {
  id: number;
  siteId: number;
  programId: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  programName?: string;
  programNameEN?: string;
}

export interface SiteProgramRequest {
  id?: number;
  siteId: number;
  programId: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface SiteProgramResponse {
  id: number;
  siteId: number;
  programId: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  programName?: string;
  programNameEN?: string;
}
